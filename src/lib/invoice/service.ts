// Server-only: invoice versions for a project.
//
// Versioning rule:
//  - The engine inputs derived from the client's answers (plus the bill-to details) are hashed.
//  - Same hash as the current version -> nothing changes (prices, FX and rate cards stay locked).
//  - Different hash: if the current version has not been issued yet (never downloaded, never submitted) it is
//    repriced in place; otherwise a new version is created with the current rate cards and FX, and the old one is
//    marked 'superseded'.
//  - A version is issued when its PDF is downloaded or the requirements are submitted.
import { createHash } from "node:crypto";
import { db, must } from "../server/db";
import { loadPricing } from "../pricing/data";
import { effectiveFx } from "../pricing/fx";
import { priceQuote } from "../pricing/engine";
import { engineInputsFromRequirements } from "../pricing/fromRequirements";
import type { EngineInputs, EngineResult, Partner, PricingData } from "../pricing/types";
import type { Draft, InvoiceView } from "../requirements/schema";
import { INVOICE_TEXT } from "./company";
import { addDays, billToFrom, buildInvoiceView, type BillTo } from "./view";

export type InvoiceRow = {
  id: string;
  project_id: string;
  number: string;
  version: number;
  status: "current" | "superseded";
  fx_rate_used: number;
  fx_source: string;
  chosen_partner: Partner;
  line_items: EngineResult["quote"]["lines"];
  comparison: EngineResult["comparison"];
  subtotal: number;
  vat: number;
  monthly_total: number;
  term_months: number;
  term_total: number | null;
  amount_due_now: number;
  amount_due_mode: EngineResult["quote"]["amountDueMode"];
  inputs_hash: string;
  inputs_snapshot: {
    inputs: EngineInputs;
    assumptions: string[];
    billTo: BillTo;
    quote: EngineResult["quote"];
    settings: PricingData["settings"];
  };
  valid_until: string;
  created_reason: string;
  created_at: string;
  downloaded_at: string | null;
  download_count: number;
  issued_at: string | null;
};

export type ProjectRef = { id: string; customer_name: string | null };

/** True when the client has given something to price (servers, or at least one service quantity). */
export function hasPricedContent(d: Draft) {
  const s = d.servers;
  if (s.linux.length + s.windows.length + s.physical.length > 0) return true;
  const sv = d.answers.services;
  return [sv.objectStorageGb, sv.publicIps, sv.vpn, sv.firewalls, sv.loadBalancers, sv.monitoring].some(
    (q) => !q.notSure && (q.value ?? 0) > 0,
  );
}

function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (v && typeof v === "object")
    return `{${Object.keys(v as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  return JSON.stringify(v);
}

export function hashInputs(inputs: EngineInputs, billTo: BillTo) {
  // Margin, partner choice and term come from admin settings and are locked with the version, so they are not hashed.
  const { margin: _m, partner: _p, termMonths: _t, ...client } = inputs;
  void _m;
  void _p;
  void _t;
  return createHash("sha256").update(stable({ client, billTo })).digest("hex").slice(0, 32);
}

export async function getCurrentInvoice(projectId: string): Promise<InvoiceRow | null> {
  const { data, error } = await db().from("invoices").select("*").eq("project_id", projectId).eq("status", "current").maybeSingle();
  if (error) throw new Error(`invoice lookup failed: ${error.message}`);
  return (data as InvoiceRow | null) ?? null;
}

export async function listInvoices(projectId: string): Promise<InvoiceRow[]> {
  return must(
    await db().from("invoices").select("*").eq("project_id", projectId).order("version", { ascending: false }),
    "invoices list",
  ) as InvoiceRow[];
}

export async function getInvoice(id: string): Promise<InvoiceRow | null> {
  const { data, error } = await db().from("invoices").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`invoice lookup failed: ${error.message}`);
  return (data as InvoiceRow | null) ?? null;
}

/** Price a draft with the live pricing data and FX (no persistence). */
export async function priceDraft(draft: Draft, fallbackName = "") {
  const pricing = await loadPricing();
  const s = pricing.settings;
  const mapped = engineInputsFromRequirements(draft.answers, draft.servers, {
    margin: s.defaultMargin,
    partner: s.partnerChoice,
    termMonths: s.defaultTermMonths,
  });
  const billTo = billToFrom(draft.answers, fallbackName);
  return { pricing, mapped, billTo, hash: hashInputs(mapped.inputs, billTo) };
}

type Reason = "save" | "view" | "submit" | "download";

/**
 * Make sure the project's current invoice reflects the draft. Returns the current row (or null when there is
 * nothing to price and no invoice yet). `create` = create v1 when there is none yet.
 */
export async function ensureInvoice(project: ProjectRef, draft: Draft, reason: Reason, create: boolean): Promise<InvoiceRow | null> {
  let current = await getCurrentInvoice(project.id);
  if (!hasPricedContent(draft)) return current;
  if (!current && !create) return null;

  const { pricing, mapped, billTo, hash } = await priceDraft(draft, project.customer_name ?? "");
  const issue = reason === "submit" || reason === "download";
  const nowIso = new Date().toISOString();

  if (current && current.inputs_hash === hash) {
    if (issue) current = await markIssued(current, reason);
    return current;
  }

  const fx = await effectiveFx(pricing.settings);
  const result = priceQuote(mapped.inputs, pricing, fx.rate, INVOICE_TEXT.clientNote);
  const q = result.quote;
  const fields = {
    fx_rate_used: fx.rate,
    fx_source: fx.source,
    chosen_partner: result.comparison.chosen,
    line_items: q.lines,
    comparison: result.comparison,
    subtotal: q.subtotal,
    vat: q.vat,
    monthly_total: q.monthlyTotal,
    term_months: q.termMonths,
    term_total: q.termTotal,
    amount_due_now: q.amountDueNow,
    amount_due_mode: q.amountDueMode,
    inputs_hash: hash,
    inputs_snapshot: { inputs: mapped.inputs, assumptions: mapped.assumptions, billTo, quote: q, settings: pricing.settings },
    valid_until: addDays(nowIso, pricing.settings.quoteValidityDays),
    created_at: nowIso,
    created_reason: reason,
    issued_at: issue ? nowIso : null,
    ...(reason === "download" ? { downloaded_at: nowIso, download_count: 1 } : {}),
  };

  if (current && !current.issued_at) {
    const { data, error } = await db().from("invoices").update(fields).eq("id", current.id).select("*").single();
    if (error) throw new Error(`invoice update failed: ${error.message}`);
    return data as InvoiceRow;
  }

  let number = current?.number;
  if (!number) {
    const { data, error } = await db().rpc("next_invoice_number");
    if (error) throw new Error(`invoice number failed: ${error.message}`);
    number = String(data);
  }
  const version = (current?.version ?? 0) + 1;
  if (current) {
    const { error } = await db().from("invoices").update({ status: "superseded" }).eq("id", current.id);
    if (error) throw new Error(`supersede failed: ${error.message}`);
  }
  const { data, error } = await db()
    .from("invoices")
    .insert({ project_id: project.id, number, version, status: "current", ...fields })
    .select("*")
    .single();
  if (error) {
    if (current) await db().from("invoices").update({ status: "current" }).eq("id", current.id);
    // A concurrent request may have created this version already: return whatever is current now.
    const now = await getCurrentInvoice(project.id);
    if (now) return now;
    throw new Error(`invoice insert failed: ${error.message}`);
  }
  return data as InvoiceRow;
}

async function markIssued(row: InvoiceRow, reason: Reason): Promise<InvoiceRow> {
  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  if (!row.issued_at) patch.issued_at = nowIso;
  if (reason === "download") {
    patch.downloaded_at = nowIso;
    patch.download_count = (row.download_count ?? 0) + 1;
  }
  if (!Object.keys(patch).length) return row;
  const { data, error } = await db().from("invoices").update(patch).eq("id", row.id).select("*").single();
  if (error) throw new Error(`invoice issue failed: ${error.message}`);
  return data as InvoiceRow;
}

export function rowToView(row: InvoiceRow, showPartner: boolean): InvoiceView {
  return buildInvoiceView({
    id: row.id,
    number: row.number,
    version: row.version,
    status: row.status,
    createdAt: row.created_at,
    validUntil: row.valid_until,
    quote: row.inputs_snapshot.quote,
    chosen: row.chosen_partner,
    settings: { showPartner },
    billTo: row.inputs_snapshot.billTo,
  });
}

/** Human-readable differences between two versions (for the OPEX email). */
export function describeChanges(prev: InvoiceRow | null, cur: InvoiceRow): string[] {
  if (!prev) return ["First version of this invoice."];
  const key = (l: { description: string; unit: string }) => `${l.description}|${l.unit}`;
  const before = new Map(prev.line_items.map((l) => [key(l), l]));
  const after = new Map(cur.line_items.map((l) => [key(l), l]));
  const money = (n: number | null) => (n == null ? "To be quoted" : `₦${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  const out: string[] = [];
  for (const [k, l] of after) {
    const p = before.get(k);
    if (!p) out.push(`Added: ${l.description} × ${l.qty} (${money(l.monthly)}/month)`);
    else if (p.qty !== l.qty || p.monthly !== l.monthly)
      out.push(`Changed: ${l.description}: qty ${p.qty} → ${l.qty}, ${money(p.monthly)} → ${money(l.monthly)}/month`);
  }
  for (const [k, l] of before) if (!after.has(k)) out.push(`Removed: ${l.description} × ${l.qty}`);
  const pb = prev.inputs_snapshot.billTo;
  const cb = cur.inputs_snapshot.billTo;
  if (stable(pb) !== stable(cb)) out.push("Bill-to details changed.");
  if (Number(prev.monthly_total) !== Number(cur.monthly_total))
    out.push(`Monthly total (incl. VAT): ${money(Number(prev.monthly_total))} → ${money(Number(cur.monthly_total))}`);
  if (Number(prev.fx_rate_used) !== Number(cur.fx_rate_used)) out.push(`FX rate used: ${prev.fx_rate_used} → ${cur.fx_rate_used}`);
  return out.length ? out : ["No priced changes (re-issued)."];
}
