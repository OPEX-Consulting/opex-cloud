import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_HEADERS } from "@/lib/admin/http";
import { exchangeCode, isAllowedAccountsServer, listOrganizations, pinnedOrgId, saveConnection } from "@/lib/zoho/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "zoho_oauth_state";

function done(req: Request, params: Record<string, string>) {
  const u = new URL("/admin/zoho", req.url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = NextResponse.redirect(u, { status: 303, headers: ADMIN_HEADERS });
  res.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/api/admin/zoho" });
  return res;
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Zoho OAuth redirect target. The admin session cookie is sameSite=strict and does not arrive on this
 * cross-site navigation, so the state cookie (set only by the admin-guarded /connect route) is the proof
 * that an admin started this flow.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const expected = (await cookies()).get(STATE_COOKIE)?.value ?? "";
  const state = url.searchParams.get("state") ?? "";
  if (!expected || !state || !same(expected, state)) return done(req, { err: "Zoho sign-in expired or did not match. Please connect again." });

  const zohoError = url.searchParams.get("error");
  if (zohoError) return done(req, { err: `Zoho declined the connection: ${zohoError.slice(0, 100)}` });

  const code = url.searchParams.get("code");
  if (!code) return done(req, { err: "Zoho did not return an authorisation code." });

  const accountsServer = url.searchParams.get("accounts-server") || "https://accounts.zoho.com";
  if (!isAllowedAccountsServer(accountsServer)) return done(req, { err: "Unexpected Zoho accounts server." });

  try {
    const t = await exchangeCode(code, accountsServer, url.origin);
    await saveConnection({
      refresh_token: t.refresh_token,
      access_token: t.access_token,
      access_expires_at: new Date(Date.now() + Number(t.expires_in ?? 3600) * 1000).toISOString(),
      api_domain: t.api_domain,
      accounts_server: accountsServer,
    });
    try {
      const orgs = await listOrganizations();
      const pin = pinnedOrgId();
      const pick = pin ? orgs.find((o) => o.organization_id === pin) : undefined;
      if (pick) await saveConnection({ org_id: pick.organization_id, org_name: pick.name });
      else if (pin) return done(req, { err: `Connected, but organisation ${pin} (ZOHO_ORG_ID) was not found in this Zoho account.` });
    } catch {
      // Org lookup failure is non-fatal: the admin can pick one on /admin/zoho.
    }
    return done(req, { ok: "Connected" });
  } catch (e) {
    // Never log or echo tokens; only a short message.
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("zoho callback failed:", msg.slice(0, 200));
    return done(req, { err: `Could not connect to Zoho: ${msg.slice(0, 150)}` });
  }
}
