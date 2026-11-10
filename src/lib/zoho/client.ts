// Server-only: Zoho Books OAuth connection (one zoho_connection row per environment) and an authenticated API fetch.
// Every network function takes an injectable fetch, and the DB-backed ones an injectable store, for tests.
import { db } from "../server/db";

export type ZohoConn = {
  id: number;
  refresh_token: string | null;
  accounts_server: string | null;
  api_domain: string | null;
  org_id: string | null;
  org_name: string | null;
  access_token: string | null;
  access_expires_at: string | null;
  tax_id: string | null;
  connected_at: string | null;
};

export type Fetch = typeof fetch;

/** Connection persistence, injectable for tests. */
export type ZohoStore = {
  load: () => Promise<ZohoConn | null>;
  save: (patch: Partial<ZohoConn>) => Promise<ZohoConn>;
};

export const SCOPES = "ZohoBooks.invoices.ALL,ZohoBooks.contacts.ALL,ZohoBooks.settings.READ";
const DEFAULT_ACCOUNTS = "https://accounts.zoho.com";

/**
 * Production and preview/development keep separate connections (row 1 and row 2), because both deployments
 * share one Supabase project. A preview can never reuse the production connection, or vice versa.
 */
export function connId(): number {
  return process.env.VERCEL_ENV === "production" ? 1 : 2;
}

export function envLabel(): string {
  return process.env.VERCEL_ENV === "production" ? "production" : "preview";
}

/** The only Zoho Books organisation this deployment may use (env ZOHO_ORG_ID), or null when unset. */
export function pinnedOrgId(): string | null {
  const v = (process.env.ZOHO_ORG_ID ?? "").trim();
  return v || null;
}

/**
 * Hard lock: no organisation-scoped Zoho call (read or write) runs unless ZOHO_ORG_ID is set for this
 * environment and the connection is on exactly that organisation.
 */
export function assertOrgAllowed(orgId: string | null | undefined): void {
  const pin = pinnedOrgId();
  if (!pin) throw new Error(`zoho locked: ZOHO_ORG_ID is not set for ${envLabel()}`);
  if (!orgId) throw new Error("zoho organization not selected");
  if (orgId !== pin) throw new Error(`zoho locked: organisation ${orgId} is not the one allowed for ${envLabel()} (${pin})`);
}

export async function getConnection(): Promise<ZohoConn | null> {
  const { data, error } = await db().from("zoho_connection").select("*").eq("id", connId()).maybeSingle();
  if (error) throw new Error(`zoho connection lookup failed: ${error.message}`);
  return (data as ZohoConn | null) ?? null;
}

export async function saveConnection(patch: Partial<ZohoConn>): Promise<ZohoConn> {
  const { data, error } = await db()
    .from("zoho_connection")
    .upsert({ ...patch, id: connId() }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw new Error(`zoho connection save failed: ${error.message}`);
  return data as ZohoConn;
}

export async function clearConnection(): Promise<void> {
  const { error } = await db().from("zoho_connection").delete().eq("id", connId());
  if (error) throw new Error(`zoho connection clear failed: ${error.message}`);
}

export const defaultStore: ZohoStore = { load: getConnection, save: saveConnection };

export function redirectUri(origin: string) {
  return `${origin.replace(/\/+$/, "")}/api/admin/zoho/callback`;
}

// The brief's pattern ^https://accounts\.(zoho|zohocloud)\.[a-z.]+$ also matches e.g. accounts.zoho.com.evil.com,
// which would receive the client secret on code exchange, so the suffix is limited to Zoho's data-centre domains.
export function isAllowedAccountsServer(u: string): boolean {
  return /^https:\/\/accounts\.(zoho|zohocloud)\.(com|eu|in|com\.au|com\.cn|jp|ca|sa|uk)$/.test(u);
}

export function authUrl(origin: string, state: string, accounts: string = DEFAULT_ACCOUNTS): string {
  if (!isAllowedAccountsServer(accounts)) throw new Error(`zoho accounts server not allowed: ${accounts}`);
  const p = new URLSearchParams({
    scope: SCOPES,
    client_id: process.env.ZOHO_CLIENT_ID ?? "",
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    redirect_uri: redirectUri(origin),
    state,
  });
  return `${accounts}/oauth/v2/auth?${p.toString()}`;
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  api_domain?: string;
  expires_in?: number;
  error?: string;
};

async function tokenCall(accounts: string, params: Record<string, string>, f: Fetch): Promise<TokenResponse> {
  if (!isAllowedAccountsServer(accounts)) throw new Error(`zoho accounts server not allowed: ${accounts}`);
  const url = `${accounts}/oauth/v2/token?${new URLSearchParams(params).toString()}`;
  const res = await f(url, { method: "POST" });
  let body: TokenResponse;
  try {
    body = (await res.json()) as TokenResponse;
  } catch {
    throw new Error(`zoho token request failed: HTTP ${res.status}`);
  }
  if (!res.ok || body.error || !body.access_token) {
    throw new Error(`zoho token request failed: ${body.error ?? `HTTP ${res.status}`}`);
  }
  return body;
}

export async function exchangeCode(
  code: string,
  accountsServer: string,
  origin: string,
  f: Fetch = fetch,
): Promise<{ refresh_token: string; access_token: string; api_domain: string; expires_in: number }> {
  const t = await tokenCall(
    accountsServer,
    {
      grant_type: "authorization_code",
      client_id: process.env.ZOHO_CLIENT_ID ?? "",
      client_secret: process.env.ZOHO_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri(origin),
      code,
    },
    f,
  );
  if (!t.refresh_token) throw new Error("zoho token request failed: no refresh_token (was prompt=consent sent?)");
  return {
    refresh_token: t.refresh_token,
    access_token: t.access_token!,
    api_domain: t.api_domain ?? "https://www.zohoapis.com",
    expires_in: Number(t.expires_in ?? 3600),
  };
}

/** Revoke the refresh token at Zoho. Best effort: a network error is thrown, a Zoho error body is ignored. */
export async function revoke(conn: ZohoConn, f: Fetch = fetch): Promise<void> {
  if (!conn.refresh_token || !conn.accounts_server || !isAllowedAccountsServer(conn.accounts_server)) return;
  const url = `${conn.accounts_server}/oauth/v2/token/revoke?${new URLSearchParams({ token: conn.refresh_token })}`;
  await f(url, { method: "POST" });
}

/** A valid access token: the cached one if it has more than 60s left, else a refreshed one (saved). */
export async function accessToken(
  conn: ZohoConn,
  f: Fetch = fetch,
  save: ZohoStore["save"] = saveConnection,
  now: () => number = Date.now,
): Promise<string> {
  if (conn.access_token && conn.access_expires_at && new Date(conn.access_expires_at).getTime() - now() > 60_000) {
    return conn.access_token;
  }
  if (!conn.refresh_token || !conn.accounts_server) throw new Error("zoho not connected");
  const t = await tokenCall(
    conn.accounts_server,
    {
      grant_type: "refresh_token",
      client_id: process.env.ZOHO_CLIENT_ID ?? "",
      client_secret: process.env.ZOHO_CLIENT_SECRET ?? "",
      refresh_token: conn.refresh_token,
    },
    f,
  );
  const patch: Partial<ZohoConn> = {
    access_token: t.access_token!,
    access_expires_at: new Date(now() + Number(t.expires_in ?? 3600) * 1000).toISOString(),
    ...(t.api_domain ? { api_domain: t.api_domain } : {}),
  };
  await save(patch);
  Object.assign(conn, patch);
  return t.access_token!;
}

export type ZohoInit = Omit<RequestInit, "body"> & {
  /** Plain object bodies are sent as JSON. */
  body?: unknown;
  /** Return the response body as an ArrayBuffer instead of parsed JSON. */
  raw?: boolean;
  /** Skip adding organization_id (e.g. GET /organizations). */
  noOrg?: boolean;
  /** Use this connection instead of loading it. */
  conn?: ZohoConn;
  store?: ZohoStore;
};

export type ZohoJson = { code: number; message?: string; [k: string]: unknown };

export async function zohoFetch(path: string, init: { raw: true } & ZohoInit, f?: Fetch): Promise<ArrayBuffer>;
export async function zohoFetch<T = ZohoJson>(path: string, init?: ZohoInit, f?: Fetch): Promise<T>;
export async function zohoFetch(path: string, init: ZohoInit = {}, f: Fetch = fetch): Promise<unknown> {
  const { raw, noOrg, conn: given, store = defaultStore, body, headers, ...rest } = init;
  const conn = given ?? (await store.load());
  if (!conn || !conn.refresh_token) throw new Error("zoho not connected");
  const token = await accessToken(conn, f, store.save);
  const base = `${(conn.api_domain ?? "https://www.zohoapis.com").replace(/\/+$/, "")}/books/v3`;
  const url = new URL(base + (path.startsWith("/") ? path : `/${path}`));
  if (!noOrg) {
    assertOrgAllowed(conn.org_id);
    url.searchParams.set("organization_id", conn.org_id!);
  }
  const h = new Headers(headers as HeadersInit | undefined);
  h.set("Authorization", `Zoho-oauthtoken ${token}`);
  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (typeof body === "string" || body instanceof URLSearchParams || body instanceof ArrayBuffer) payload = body as BodyInit;
    else {
      payload = JSON.stringify(body);
      h.set("Content-Type", "application/json");
    }
  }
  const res = await f(url.toString(), { ...rest, headers: h, body: payload });
  if (raw) {
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = (await res.json()) as ZohoJson;
        if (j?.message) msg = `${j.code}: ${j.message}`;
      } catch {}
      throw new Error(`zoho ${path} failed: ${msg}`);
    }
    return await res.arrayBuffer();
  }
  let json: ZohoJson;
  try {
    json = (await res.json()) as ZohoJson;
  } catch {
    throw new Error(`zoho ${path} failed: HTTP ${res.status} (non-JSON response)`);
  }
  if (json.code !== 0) throw new Error(`zoho ${path} failed: ${json.code}: ${json.message ?? `HTTP ${res.status}`}`);
  return json;
}

export type ZohoOrg = { organization_id: string; name: string; is_default_org?: boolean; currency_code?: string };

export async function listOrganizations(f: Fetch = fetch, init: Pick<ZohoInit, "conn" | "store"> = {}): Promise<ZohoOrg[]> {
  const r = await zohoFetch<{ organizations?: ZohoOrg[] }>("/organizations", { ...init, noOrg: true }, f);
  return r.organizations ?? [];
}
