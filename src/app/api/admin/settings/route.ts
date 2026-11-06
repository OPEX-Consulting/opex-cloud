import { audit } from "@/lib/admin/auth";
import { back, guard, numOrNull, str } from "@/lib/admin/http";
import { db } from "@/lib/server/db";
import { loadSettingRows } from "@/lib/pricing/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENUMS: Record<string, string[]> = {
  fx_mode: ["live", "live_buffer", "fixed"],
  partner_choice: ["Recommended", "UniCloud", "Unitellas"],
  amount_due_mode: ["first_month", "term", "deposit_pct"],
};
const BOOLS = ["show_partner"];
const FRACTIONS = ["vat", "unicloud_discount", "unitellas_discount", "default_margin", "fx_buffer_pct", "deposit_pct"];

/** Update pricing settings. Each changed key is audited. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const form = await req.formData();
  const rows = await loadSettingRows();
  let changed = 0;
  for (const r of rows) {
    if (!form.has(r.key)) continue;
    const raw = form.get(r.key);
    let value: unknown;
    if (ENUMS[r.key]) {
      value = str(raw);
      if (!ENUMS[r.key].includes(value as string)) return back(req, "/admin/pricing", { err: `${r.label}: choose one of ${ENUMS[r.key].join(", ")}.` });
    } else if (BOOLS.includes(r.key)) {
      value = str(raw) === "true";
    } else {
      const n = numOrNull(raw);
      if (n == null || !Number.isFinite(n) || n < 0) return back(req, "/admin/pricing", { err: `${r.label}: enter a number.` });
      if (FRACTIONS.includes(r.key) && n >= 1) return back(req, "/admin/pricing", { err: `${r.label}: enter a decimal (0.075 = 7.5%).` });
      value = n;
    }
    if (JSON.stringify(value) === JSON.stringify(r.value)) continue;
    const { error } = await db().from("pricing_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", r.key);
    if (error) return back(req, "/admin/pricing", { err: error.message });
    await audit("pricing_settings", r.key, "update", r.value, value);
    changed++;
  }
  return back(req, "/admin/pricing", { ok: changed ? `Saved ${changed} setting(s).` : "No changes." });
}
