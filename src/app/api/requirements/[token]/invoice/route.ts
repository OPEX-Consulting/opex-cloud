import { isDemo, loadDraft } from "@/lib/requirements/server";
import { checkToken, json } from "@/lib/requirements/http";
import { ensureInvoice, listInvoices, rowToView } from "@/lib/invoice/service";
import { loadSettingRows, settingsFromRows } from "@/lib/pricing/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Current pro-forma invoice for the saved answers (created or repriced on demand). Client-safe fields only. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!checkToken(token)) return json({ success: false, message: "This link is not recognised." }, 404);
  if (isDemo(token)) return json({ success: false, message: "Demo links price in the browser: use the preview endpoint." }, 400);
  try {
    const found = await loadDraft(token);
    if (!found) return json({ success: false, message: "This link is not recognised." }, 404);
    const row = await ensureInvoice(found.p, found.draft, "view", true);
    if (!row) return json({ success: true, invoice: null, versions: [], message: "Add your servers or services to see your invoice." });
    const settings = settingsFromRows(await loadSettingRows());
    const versions = (await listInvoices(found.p.id)).map((v) => ({
      version: v.version,
      status: v.status,
      createdAt: v.created_at,
      monthlyTotal: Number(v.monthly_total),
      issued: Boolean(v.issued_at),
    }));
    return json({ success: true, invoice: rowToView(row, settings.showPartner), versions, assumptions: row.inputs_snapshot.assumptions });
  } catch (error) {
    console.error("[invoice] load failed", error);
    return json({ success: false, message: "We couldn't prepare your invoice just now." }, 500);
  }
}
