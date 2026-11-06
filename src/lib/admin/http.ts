import { NextResponse } from "next/server";
import { isAdmin } from "./auth";

export const ADMIN_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export function back(req: Request, path: string, params: Record<string, string> = {}) {
  const u = new URL(path, req.url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return NextResponse.redirect(u, { status: 303, headers: ADMIN_HEADERS });
}

/** Returns a response to send when not signed in, or null when the request may proceed. */
export async function guard(req: Request) {
  if (await isAdmin()) return null;
  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");
  return wantsJson
    ? NextResponse.json({ ok: false, message: "Sign in first." }, { status: 401, headers: ADMIN_HEADERS })
    : back(req, "/admin", { err: "Please sign in." });
}

/** "" -> null, "1,234.5" -> 1234.5, junk -> NaN */
export function numOrNull(v: FormDataEntryValue | null): number | null {
  const t = String(v ?? "").replace(/[,\s₦$]/g, "");
  if (t === "") return null;
  return Number(t);
}

export const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
