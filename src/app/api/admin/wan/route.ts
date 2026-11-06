import { audit } from "@/lib/admin/auth";
import { back, guard, numOrNull, str } from "@/lib/admin/http";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Add, update or delete a Unitellas WAN tier. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const form = await req.formData();
  const action = str(form.get("action")) || "update";
  const id = str(form.get("id"));
  const go = (p: Record<string, string>) => back(req, "/admin/pricing", p);
  if (action === "delete") {
    const { data: old } = await db().from("unitellas_wan").select("*").eq("id", id).maybeSingle();
    if (!old) return go({ err: "WAN tier not found." });
    const { error } = await db().from("unitellas_wan").delete().eq("id", id);
    if (error) return go({ err: error.message });
    await audit("unitellas_wan", `${old.mbps} Mbps`, "delete", old, null);
    return go({ ok: `Deleted ${old.mbps} Mbps tier.` });
  }
  const row = { mbps: numOrNull(form.get("mbps")), list_usd_month: numOrNull(form.get("list_usd_month")) };
  if ([row.mbps, row.list_usd_month].some((n) => n == null || !Number.isFinite(n) || n <= 0)) return go({ err: "WAN tier: Mbps and $/month must be positive numbers." });
  if (action === "insert") {
    const { error } = await db().from("unitellas_wan").insert({ ...row, sort: row.mbps });
    if (error) return go({ err: error.message });
    await audit("unitellas_wan", `${row.mbps} Mbps`, "insert", null, row);
    return go({ ok: `Added ${row.mbps} Mbps tier.` });
  }
  const { data: old } = await db().from("unitellas_wan").select("mbps, list_usd_month").eq("id", id).maybeSingle();
  if (!old) return go({ err: "WAN tier not found." });
  if (Number(old.mbps) === row.mbps && Number(old.list_usd_month) === row.list_usd_month) return go({ ok: "No changes." });
  const { error } = await db().from("unitellas_wan").update({ ...row, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return go({ err: error.message });
  await audit("unitellas_wan", `${row.mbps} Mbps`, "update", old, row);
  return go({ ok: `Saved ${row.mbps} Mbps tier.` });
}
