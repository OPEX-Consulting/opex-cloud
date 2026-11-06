import { audit } from "@/lib/admin/auth";
import { back, guard, numOrNull, str } from "@/lib/admin/http";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Update one rate card row. Blank list price = not offered ("To be quoted"). */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const form = await req.formData();
  const key = str(form.get("key"));
  const { data: old, error: e0 } = await db().from("rate_cards").select("*").eq("key", key).maybeSingle();
  if (e0 || !old) return back(req, "/admin/pricing", { err: `Unknown rate card ${key}.` });
  const uni = numOrNull(form.get("unicloud_list_ngn"));
  const utl = numOrNull(form.get("unitellas_list_usd"));
  if ((uni != null && (!Number.isFinite(uni) || uni < 0)) || (utl != null && (!Number.isFinite(utl) || utl < 0)))
    return back(req, "/admin/pricing", { err: `${old.service}: prices must be positive numbers or blank.` });
  const next = {
    unicloud_list_ngn: uni,
    unitellas_list_usd: utl,
    unicloud_unit: form.has("unicloud_unit") ? str(form.get("unicloud_unit")) : old.unicloud_unit,
    unitellas_unit: form.has("unitellas_unit") ? str(form.get("unitellas_unit")) : old.unitellas_unit,
  };
  const before = {
    unicloud_list_ngn: old.unicloud_list_ngn == null ? null : Number(old.unicloud_list_ngn),
    unitellas_list_usd: old.unitellas_list_usd == null ? null : Number(old.unitellas_list_usd),
    unicloud_unit: old.unicloud_unit,
    unitellas_unit: old.unitellas_unit,
  };
  if (JSON.stringify(before) === JSON.stringify(next)) return back(req, "/admin/pricing", { ok: "No changes." });
  const { error } = await db().from("rate_cards").update({ ...next, updated_at: new Date().toISOString() }).eq("key", key);
  if (error) return back(req, "/admin/pricing", { err: error.message });
  await audit("rate_cards", key, "update", before, next);
  return back(req, "/admin/pricing", { ok: `Saved ${old.service}.` });
}
