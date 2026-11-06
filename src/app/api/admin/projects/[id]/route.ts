import { back, guard, numOrNull, str } from "@/lib/admin/http";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Project actions: mark reviewed, extend the link. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const f = await req.formData();
  const action = str(f.get("action"));
  const path = `/admin/projects/${id}`;
  if (action === "reviewed") {
    const { error } = await db().from("projects").update({ status: "reviewed" }).eq("id", id);
    return back(req, path, error ? { err: error.message } : { ok: "Marked as reviewed." });
  }
  if (action === "extend") {
    const days = numOrNull(f.get("days")) ?? 14;
    if (!Number.isFinite(days) || days < 1 || days > 365) return back(req, path, { err: "Days must be 1 to 365." });
    const { error } = await db().from("projects").update({ expires_at: new Date(Date.now() + days * 86400_000).toISOString() }).eq("id", id);
    return back(req, path, error ? { err: error.message } : { ok: `Link open for ${days} more days.` });
  }
  return back(req, path, { err: "Unknown action." });
}
