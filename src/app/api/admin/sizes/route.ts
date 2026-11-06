import { audit } from "@/lib/admin/auth";
import { back, guard, numOrNull, str } from "@/lib/admin/http";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Add, update or delete a Unitellas server size. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const form = await req.formData();
  const action = str(form.get("action")) || "update";
  const id = str(form.get("id"));
  const go = (p: Record<string, string>) => back(req, "/admin/pricing", p);
  if (action === "delete") {
    const { data: old } = await db().from("unitellas_sizes").select("*").eq("id", id).maybeSingle();
    if (!old) return go({ err: "Size not found." });
    const { error } = await db().from("unitellas_sizes").delete().eq("id", id);
    if (error) return go({ err: error.message });
    await audit("unitellas_sizes", old.size_name, "delete", old, null);
    return go({ ok: `Deleted ${old.size_name}.` });
  }
  const row = {
    vcpu: numOrNull(form.get("vcpu")),
    ram_gb: numOrNull(form.get("ram_gb")),
    size_name: str(form.get("size_name")),
    linux_usd_hour: numOrNull(form.get("linux_usd_hour")),
    windows_usd_hour: numOrNull(form.get("windows_usd_hour")),
    sort: numOrNull(form.get("sort")) ?? 0,
  };
  const bad = [row.vcpu, row.ram_gb].some((n) => n == null || !Number.isFinite(n) || n <= 0) ||
    [row.linux_usd_hour, row.windows_usd_hour].some((n) => n != null && (!Number.isFinite(n) || n < 0)) ||
    !row.size_name;
  if (bad) return go({ err: "Size: vCPU, RAM and name are required; prices must be numbers or blank." });
  if (action === "insert") {
    const { error } = await db().from("unitellas_sizes").insert(row);
    if (error) return go({ err: error.message });
    await audit("unitellas_sizes", row.size_name, "insert", null, row);
    return go({ ok: `Added ${row.size_name}.` });
  }
  const { data: old } = await db().from("unitellas_sizes").select("vcpu, ram_gb, size_name, linux_usd_hour, windows_usd_hour, sort").eq("id", id).maybeSingle();
  if (!old) return go({ err: "Size not found." });
  const norm = (o: Record<string, unknown>) => JSON.stringify(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v == null || k === "size_name" ? v : Number(v)])));
  if (norm(old) === norm(row)) return go({ ok: "No changes." });
  const { error } = await db().from("unitellas_sizes").update({ ...row, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return go({ err: error.message });
  await audit("unitellas_sizes", row.size_name, "update", old, row);
  return go({ ok: `Saved ${row.size_name}.` });
}
