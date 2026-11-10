import { back, guard } from "@/lib/admin/http";
import { clearConnection, getConnection, revoke } from "@/lib/zoho/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Revoke the Zoho refresh token (best effort) and forget the connection. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const conn = await getConnection();
    if (conn) await revoke(conn);
  } catch {
    // ignore: we clear locally regardless
  }
  try {
    await clearConnection();
  } catch (e) {
    return back(req, "/admin/zoho", { err: e instanceof Error ? e.message : "Could not disconnect." });
  }
  return back(req, "/admin/zoho", { ok: "Disconnected from Zoho Books." });
}
