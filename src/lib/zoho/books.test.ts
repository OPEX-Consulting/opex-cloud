import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvoicePayload, syncInvoiceToZoho, fetchZohoPdf } from "./books";
import { accessToken, authUrl, exchangeCode, isAllowedAccountsServer, type ZohoConn, type ZohoStore } from "./client";
import type { InvoiceRow } from "../invoice/service";

process.env.ZOHO_CLIENT_ID = "cid";
process.env.ZOHO_CLIENT_SECRET = "csecret";

type Call = { method: string; url: URL; body: unknown };

/** A fetch mock routed by "METHOD /path" (path relative to /books/v3 or full for oauth). */
function mockFetch(routes: Record<string, (c: Call) => unknown>) {
  const calls: Call[] = [];
  const f = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const method = (init?.method ?? "GET").toUpperCase();
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const call = { method, url, body };
    calls.push(call);
    const path = url.pathname.replace(/^\/books\/v3/, "");
    const handler = routes[`${method} ${path}`];
    if (!handler) throw new Error(`unmocked ${method} ${url}`);
    const out = handler(call);
    if (out instanceof Uint8Array) return new Response(out as BodyInit, { status: 200 });
    return new Response(JSON.stringify(out), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  return { f, calls };
}

function conn(extra: Partial<ZohoConn> = {}): ZohoConn {
  return {
    id: 1,
    refresh_token: "rt",
    accounts_server: "https://accounts.zoho.com",
    api_domain: "https://www.zohoapis.com",
    org_id: "org1",
    org_name: "OPEX",
    access_token: "at",
    access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
    tax_id: null,
    connected_at: null,
    ...extra,
  };
}

function memStore(c: ZohoConn | null) {
  const saved: Partial<ZohoConn>[] = [];
  const store: ZohoStore = {
    load: async () => c,
    save: async (p) => {
      saved.push(p);
      return { ...(c as ZohoConn), ...p };
    },
  };
  return { store, saved };
}

const line = (o: Partial<InvoiceRow["line_items"][number]>) => ({
  n: 1,
  key: "k",
  description: "VM",
  qty: 1,
  unit: "per month",
  unitPrice: 100,
  monthly: 100,
  toBeQuoted: false,
  assumed: null,
  ...o,
});

function row(o: Partial<InvoiceRow> = {}): InvoiceRow {
  return {
    id: "inv-2",
    number: "OC-0007",
    version: 2,
    monthly_total: 107.5,
    vat: 7.5,
    line_items: [
      line({ description: "Linux VM", qty: 2, unit: "per VM / month", unitPrice: 50.005 }),
      line({ description: "Firewall", qty: 1, unitPrice: null, monthly: null, toBeQuoted: true }),
    ],
    inputs_snapshot: {
      billTo: { name: "Acme Ltd", address: "1 Marina, Lagos", contactName: "Ada", contactEmail: "ada@acme.ng", contactPhone: "0800" },
    },
    ...o,
  } as unknown as InvoiceRow;
}

test("payload excludes TBQ lines, applies months to rate and sets tax_id", () => {
  const p = buildInvoicePayload(row(), "cust1", "tax75", 3);
  assert.equal(p.customer_id, "cust1");
  assert.equal(p.reference_number, "OC-0007-v2");
  assert.equal(p.terms, "Due on Receipt");
  assert.equal(p.payment_terms, 0);
  assert.equal(p.line_items.length, 1);
  assert.deepEqual(p.line_items[0], { name: "Linux VM", description: "per VM / month", quantity: 2, rate: 150.02, tax_id: "tax75" });
  assert.match(p.notes, /To be quoted/);
});

function invoiceRoutes(extra: Record<string, (c: Call) => unknown>, total = 107.5) {
  return {
    "GET /settings/taxes": () => ({ code: 0, taxes: [{ tax_id: "t0", tax_percentage: 0 }, { tax_id: "tax75", tax_percentage: 7.5 }] }),
    "POST /invoices": () => ({ code: 0, invoice: { invoice_id: "zi2", invoice_number: "INV-002", total, balance: total, status: "draft" } }),
    "POST /invoices/zi2/status/sent": () => ({ code: 0, message: "ok" }),
    ...extra,
  };
}

test("existing contact is found by name and used; tax id cached", async () => {
  const c = conn();
  const { store, saved } = memStore(c);
  const { f, calls } = mockFetch(
    invoiceRoutes({ "GET /contacts": () => ({ code: 0, contacts: [{ contact_id: "c9", contact_name: "Acme Ltd" }] }) }),
  );
  const r = await syncInvoiceToZoho(row(), null, { f, conn: c, store, months: 1 });
  assert.equal(r.zoho_invoice_id, "zi2");
  assert.equal(r.zoho_status, "sent");
  assert.equal(r.warning, null);
  assert.equal(r.voidedPrev, null);
  assert.ok(!calls.some((x) => x.method === "POST" && x.url.pathname.endsWith("/contacts")));
  const inv = calls.find((x) => x.method === "POST" && x.url.pathname.endsWith("/invoices"))!;
  assert.equal((inv.body as { customer_id: string }).customer_id, "c9");
  assert.equal(inv.url.searchParams.get("organization_id"), "org1");
  assert.deepEqual(saved, [{ tax_id: "tax75" }]);
});

test("contact is created when neither name nor email matches; warning on total mismatch", async () => {
  const c = conn({ tax_id: "taxCached" });
  const { store } = memStore(c);
  const { f, calls } = mockFetch(
    invoiceRoutes(
      {
        "GET /contacts": () => ({ code: 0, contacts: [] }),
        "POST /contacts": () => ({ code: 0, contact: { contact_id: "cNew" } }),
      },
      500,
    ),
  );
  const r = await syncInvoiceToZoho(row(), null, { f, conn: c, store, months: 1 });
  const gets = calls.filter((x) => x.method === "GET" && x.url.pathname.endsWith("/contacts"));
  assert.equal(gets.length, 2);
  assert.equal(gets[0].url.searchParams.get("contact_name"), "Acme Ltd");
  assert.equal(gets[1].url.searchParams.get("email"), "ada@acme.ng");
  const post = calls.find((x) => x.method === "POST" && x.url.pathname.endsWith("/contacts"))!;
  assert.deepEqual(post.body, {
    contact_name: "Acme Ltd",
    company_name: "Acme Ltd",
    contact_type: "customer",
    billing_address: { address: "1 Marina, Lagos" },
    contact_persons: [{ first_name: "Ada", is_primary_contact: true, email: "ada@acme.ng", phone: "0800" }],
  });
  assert.ok(!calls.some((x) => x.url.pathname.endsWith("/settings/taxes")));
  const inv = calls.find((x) => x.method === "POST" && x.url.pathname.endsWith("/invoices"))!;
  assert.equal((inv.body as { customer_id: string; line_items: { tax_id: string }[] }).line_items[0].tax_id, "taxCached");
  assert.match(r.warning ?? "", /differs/);
});

const prevRow = (o: Record<string, unknown> = {}) => row({ id: "inv-1", version: 1, ...o } as Partial<InvoiceRow>);

test("previous Zoho invoice is voided only when unpaid", async () => {
  const base = { "GET /contacts": () => ({ code: 0, contacts: [{ contact_id: "c9", contact_name: "Acme Ltd" }] }) };
  // Unpaid -> voided
  {
    const c = conn({ tax_id: "t" });
    const { f, calls } = mockFetch(
      invoiceRoutes({
        ...base,
        "GET /invoices/zi1": () => ({ code: 0, invoice: { invoice_id: "zi1", total: 107.5, balance: 107.5, status: "sent" } }),
        "POST /invoices/zi1/status/void": () => ({ code: 0 }),
      }),
    );
    const r = await syncInvoiceToZoho(row(), prevRow({ zoho_invoice_id: "zi1", zoho_voided_at: null }), { f, conn: c, store: memStore(c).store, months: 1 });
    assert.equal(r.voidedPrev, "zi1");
    assert.equal(r.voidSkipped, null);
    assert.ok(calls.some((x) => x.url.pathname.endsWith("/invoices/zi1/status/void")));
  }
  // Part paid -> skipped
  {
    const c = conn({ tax_id: "t" });
    const { f, calls } = mockFetch(
      invoiceRoutes({
        ...base,
        "GET /invoices/zi1": () => ({ code: 0, invoice: { invoice_id: "zi1", invoice_number: "INV-1", total: 107.5, balance: 50, status: "partially_paid" } }),
      }),
    );
    const r = await syncInvoiceToZoho(row(), prevRow({ zoho_invoice_id: "zi1", zoho_voided_at: null }), { f, conn: c, store: memStore(c).store, months: 1 });
    assert.equal(r.voidedPrev, null);
    assert.match(r.voidSkipped ?? "", /not voided/);
    assert.ok(!calls.some((x) => x.url.pathname.endsWith("/status/void")));
  }
  // Already voided in portal -> not even looked up
  {
    const c = conn({ tax_id: "t" });
    const { f, calls } = mockFetch(invoiceRoutes(base));
    const r = await syncInvoiceToZoho(row(), prevRow({ zoho_invoice_id: "zi1", zoho_voided_at: "2026-11-01T00:00:00Z" }), {
      f,
      conn: c,
      store: memStore(c).store,
      months: 1,
    });
    assert.equal(r.voidedPrev, null);
    assert.ok(!calls.some((x) => x.url.pathname.includes("/invoices/zi1")));
  }
});

test("code exchange sends every param in the query string", async () => {
  const { f, calls } = mockFetch({
    "POST /oauth/v2/token": () => ({ access_token: "A", refresh_token: "R", api_domain: "https://www.zohoapis.eu", expires_in: 3600 }),
  });
  const t = await exchangeCode("CODE", "https://accounts.zoho.eu", "https://portal.example", f);
  assert.deepEqual(t, { access_token: "A", refresh_token: "R", api_domain: "https://www.zohoapis.eu", expires_in: 3600 });
  const c = calls[0];
  assert.equal(c.url.origin, "https://accounts.zoho.eu");
  assert.equal(c.body, undefined);
  const q = Object.fromEntries(c.url.searchParams);
  assert.deepEqual(q, {
    grant_type: "authorization_code",
    client_id: "cid",
    client_secret: "csecret",
    redirect_uri: "https://portal.example/api/admin/zoho/callback",
    code: "CODE",
  });
  const bad = mockFetch({ "POST /oauth/v2/token": () => ({ error: "invalid_code" }) });
  await assert.rejects(exchangeCode("X", "https://accounts.zoho.com", "https://p", bad.f), /invalid_code/);
});

test("access token: cached when fresh, refreshed via query string when near expiry", async () => {
  const none = mockFetch({});
  assert.equal(await accessToken(conn(), none.f, async (p) => ({ ...conn(), ...p })), "at");
  assert.equal(none.calls.length, 0);
  const c = conn({ access_expires_at: new Date(Date.now() + 30_000).toISOString() });
  const { f, calls } = mockFetch({ "POST /oauth/v2/token": () => ({ access_token: "NEW", expires_in: 3600 }) });
  const saved: Partial<ZohoConn>[] = [];
  assert.equal(await accessToken(c, f, async (p) => (saved.push(p), { ...c, ...p })), "NEW");
  assert.equal(calls[0].url.searchParams.get("grant_type"), "refresh_token");
  assert.equal(calls[0].url.searchParams.get("refresh_token"), "rt");
  assert.equal(saved[0].access_token, "NEW");
});

test("accounts-server allowlist", () => {
  for (const ok of ["https://accounts.zoho.com", "https://accounts.zoho.eu", "https://accounts.zoho.com.au", "https://accounts.zohocloud.ca", "https://accounts.zoho.in"])
    assert.ok(isAllowedAccountsServer(ok), ok);
  for (const bad of ["http://accounts.zoho.com", "https://accounts.zoho.com/x", "https://evil.com", "https://accounts.zoho.com.evil.com/", "https://accounts.zoho.com.evil.com", "https://accounts.evilzoho.com", "https://accounts.zoho.com@evil.com"])
    assert.ok(!isAllowedAccountsServer(bad), bad);
  assert.throws(() => authUrl("https://p", "s", "https://evil.com"));
  const u = new URL(authUrl("https://p", "st8"));
  assert.equal(u.origin + u.pathname, "https://accounts.zoho.com/oauth/v2/auth");
  assert.equal(u.searchParams.get("scope"), "ZohoBooks.invoices.ALL,ZohoBooks.contacts.ALL,ZohoBooks.settings.READ");
  assert.equal(u.searchParams.get("access_type"), "offline");
  assert.equal(u.searchParams.get("prompt"), "consent");
  assert.equal(u.searchParams.get("redirect_uri"), "https://p/api/admin/zoho/callback");
  assert.equal(u.searchParams.get("state"), "st8");
});

test("fetchZohoPdf returns bytes with accept=pdf and auth header", async () => {
  const c = conn();
  let auth = "";
  const { f, calls } = mockFetch({ "GET /invoices/zi2": () => new Uint8Array([37, 80, 68, 70]) });
  const wrapped = (async (u: string, i?: RequestInit) => {
    auth = new Headers(i?.headers).get("Authorization") ?? "";
    return f(u, i);
  }) as typeof fetch;
  const bytes = await fetchZohoPdf("zi2", wrapped, { conn: c, store: memStore(c).store });
  assert.deepEqual([...bytes], [37, 80, 68, 70]);
  assert.equal(calls[0].url.searchParams.get("accept"), "pdf");
  assert.equal(auth, "Zoho-oauthtoken at");
});
