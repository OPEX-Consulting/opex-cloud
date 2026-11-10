// Server-only: push a portal invoice version to Zoho Books (create contact if needed, create + mark sent,
// void the previous unpaid version) and read Zoho's PDF.
import { db } from "../server/db";
import { round2 } from "../pricing/engine";
import type { InvoiceRow } from "../invoice/service";
import { defaultStore, zohoFetch, type Fetch, type ZohoConn, type ZohoStore } from "./client";

export type ZohoFields = {
  zoho_invoice_id: string | null;
  zoho_invoice_number: string | null;
  zoho_total: number | null;
  zoho_status: string | null;
  zoho_voided_at: string | null;
  zoho_sync_error: string | null;
  zoho_synced_at: string | null;
};

/** An invoices row including the Zoho sync columns (migration 0003). */
export type ZohoInvoiceRow = InvoiceRow & Partial<ZohoFields>;

export type SyncOpts = {
  f?: Fetch;
  conn?: ZohoConn;
  store?: ZohoStore;
  /** Defaults to Number(env ZOHO_BILLING_MONTHS || 1). */
  months?: number;
};

export type SyncResult = {
  zoho_invoice_id: string;
  zoho_invoice_number: string;
  zoho_total: number;
  zoho_status: string;
  /** Zoho invoice id of the previous version that was voided, or null. */
  voidedPrev: string | null;
  /** Why the previous version was not voided (paid / part-paid / already void), or null. */
  voidSkipped: string | null;
  /** Set when Zoho's total differs from the portal total (monthly_total × months) by more than 1. */
  warning: string | null;
};

export const VAT_PERCENT = 7.5;

export function billingMonths(): number {
  const m = Number(process.env.ZOHO_BILLING_MONTHS || 1);
  return Number.isFinite(m) && m > 0 ? m : 1;
}

export type ZohoLineItem = { name: string; description: string; quantity: number; rate: number; tax_id: string };

export type InvoicePayload = {
  customer_id: string;
  reference_number: string;
  line_items: ZohoLineItem[];
  notes: string;
  terms: string;
  payment_terms: number;
};

/** Pure: the POST /invoices body for a portal invoice row. To-be-quoted lines are left out. */
export function buildInvoicePayload(row: InvoiceRow, customerId: string, taxId: string, months: number): InvoicePayload {
  const line_items = (row.line_items ?? [])
    .filter((l) => !l.toBeQuoted && l.unitPrice !== null)
    .map((l) => ({
      name: l.description,
      description: l.unit,
      quantity: l.qty,
      rate: round2((l.unitPrice ?? 0) * months),
      tax_id: taxId,
    }));
  const notes: string[] = [`Portal invoice ${row.number} v${row.version}.`];
  if (months > 1) notes.push(`Rates cover ${months} months of service.`);
  const tbq = (row.line_items ?? []).filter((l) => l.toBeQuoted).length;
  if (tbq > 0) notes.push(`${tbq} item(s) marked "To be quoted" are not included and will be invoiced separately.`);
  return {
    customer_id: customerId,
    reference_number: `${row.number}-v${row.version}`,
    line_items,
    notes: notes.join("\n"),
    terms: "Due on Receipt",
    payment_terms: 0,
  };
}

type Contact = { contact_id: string; contact_name?: string; email?: string };

export async function findOrCreateContact(row: InvoiceRow, f: Fetch, base: { conn?: ZohoConn; store?: ZohoStore }): Promise<string> {
  const b = row.inputs_snapshot?.billTo;
  const name = (b?.name ?? "").trim();
  const email = (b?.contactEmail ?? "").trim();
  if (!name) throw new Error("invoice has no bill-to name");
  const byName = await zohoFetch<{ contacts?: Contact[] }>(`/contacts?${new URLSearchParams({ contact_name: name })}`, base, f);
  const hit = (byName.contacts ?? []).find((c) => (c.contact_name ?? "").trim().toLowerCase() === name.toLowerCase()) ?? byName.contacts?.[0];
  if (hit) return hit.contact_id;
  if (email) {
    const byEmail = await zohoFetch<{ contacts?: Contact[] }>(`/contacts?${new URLSearchParams({ email })}`, base, f);
    if (byEmail.contacts?.[0]) return byEmail.contacts[0].contact_id;
  }
  const person: Record<string, unknown> = { first_name: (b?.contactName || name).trim(), is_primary_contact: true };
  if (email) person.email = email;
  if (b?.contactPhone) person.phone = b.contactPhone.trim();
  const created = await zohoFetch<{ contact: Contact }>(
    "/contacts",
    {
      ...base,
      method: "POST",
      body: {
        contact_name: name,
        company_name: name,
        contact_type: "customer",
        billing_address: { address: b?.address ?? "" },
        contact_persons: [person],
      },
    },
    f,
  );
  return created.contact.contact_id;
}

export async function vatTaxId(conn: ZohoConn, f: Fetch, store: ZohoStore): Promise<string> {
  if (conn.tax_id) return conn.tax_id;
  const r = await zohoFetch<{ taxes?: { tax_id: string; tax_name?: string; tax_percentage: number | string }[] }>(
    "/settings/taxes",
    { conn, store },
    f,
  );
  const t = (r.taxes ?? []).find((x) => Number(x.tax_percentage) === VAT_PERCENT);
  if (!t) throw new Error(`no ${VAT_PERCENT}% tax found in Zoho Books (Settings > Taxes)`);
  await store.save({ tax_id: t.tax_id });
  conn.tax_id = t.tax_id;
  return t.tax_id;
}

type ZInvoice = { invoice_id: string; invoice_number: string; total: number; balance: number; status: string };

export async function syncInvoiceToZoho(row: ZohoInvoiceRow, prev: ZohoInvoiceRow | null, opts: SyncOpts = {}): Promise<SyncResult> {
  const f = opts.f ?? fetch;
  const store = opts.store ?? defaultStore;
  const conn = opts.conn ?? (await store.load());
  if (!conn || !conn.refresh_token) throw new Error("zoho not connected");
  if (!conn.org_id) throw new Error("zoho organization not selected");
  const base = { conn, store };
  const months = opts.months ?? billingMonths();

  const customerId = await findOrCreateContact(row, f, base);
  const taxId = await vatTaxId(conn, f, store);
  const payload = buildInvoicePayload(row, customerId, taxId, months);
  if (payload.line_items.length === 0) throw new Error("invoice has no priced lines to send to Zoho");

  const created = await zohoFetch<{ invoice: ZInvoice }>("/invoices", { ...base, method: "POST", body: payload }, f);
  const inv = created.invoice;
  await zohoFetch(`/invoices/${encodeURIComponent(inv.invoice_id)}/status/sent`, { ...base, method: "POST" }, f);

  let voidedPrev: string | null = null;
  let voidSkipped: string | null = null;
  if (prev?.zoho_invoice_id && !prev.zoho_voided_at) {
    const p = await zohoFetch<{ invoice: ZInvoice }>(`/invoices/${encodeURIComponent(prev.zoho_invoice_id)}`, base, f);
    const pi = p.invoice;
    const status = String(pi.status ?? "").toLowerCase();
    const unpaid = Number(pi.balance) === Number(pi.total);
    if (unpaid && status !== "void" && status !== "paid") {
      await zohoFetch(`/invoices/${encodeURIComponent(prev.zoho_invoice_id)}/status/void`, { ...base, method: "POST" }, f);
      voidedPrev = prev.zoho_invoice_id;
    } else {
      voidSkipped = `previous Zoho invoice ${pi.invoice_number ?? prev.zoho_invoice_id} not voided (status ${status || "unknown"}, balance ${pi.balance} of ${pi.total})`;
    }
  }

  const zohoTotal = Number(inv.total);
  const portalTotal = round2(Number(row.monthly_total) * months);
  const warning =
    Math.abs(zohoTotal - portalTotal) > 1
      ? `Zoho total ${zohoTotal} differs from portal total ${portalTotal} (monthly ${row.monthly_total} × ${months})`
      : null;

  return {
    zoho_invoice_id: inv.invoice_id,
    zoho_invoice_number: inv.invoice_number,
    zoho_total: zohoTotal,
    zoho_status: "sent",
    voidedPrev,
    voidSkipped,
    warning,
  };
}

export async function fetchZohoPdf(id: string, f: Fetch = fetch, init: { conn?: ZohoConn; store?: ZohoStore } = {}): Promise<Uint8Array> {
  const buf = await zohoFetch(`/invoices/${encodeURIComponent(id)}?accept=pdf`, { ...init, raw: true }, f);
  return new Uint8Array(buf);
}

export async function saveZohoFields(invoiceId: string, fields: Partial<ZohoFields>): Promise<void> {
  const { error } = await db().from("invoices").update(fields).eq("id", invoiceId);
  if (error) throw new Error(`zoho fields save failed: ${error.message}`);
}
