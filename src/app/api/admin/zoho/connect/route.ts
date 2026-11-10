import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_HEADERS, back, guard } from "@/lib/admin/http";
import { authUrl } from "@/lib/zoho/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start the Zoho OAuth flow: set a short-lived state cookie and send the admin to Zoho's consent page. */
async function start(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  if (!process.env.ZOHO_CLIENT_ID) return back(req, "/admin/zoho", { err: "ZOHO_CLIENT_ID is not set on the server." });
  const origin = new URL(req.url).origin;
  const state = randomBytes(24).toString("base64url");
  const res = NextResponse.redirect(authUrl(origin, state), { status: 302, headers: ADMIN_HEADERS });
  res.cookies.set("zoho_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/api/admin/zoho",
  });
  return res;
}

export const GET = start;
export const POST = start;
