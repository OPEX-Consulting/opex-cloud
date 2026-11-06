import { after } from "next/server";
import { isDemo, loadDraft } from "@/lib/requirements/server";
import { checkToken, json, NO_STORE } from "@/lib/requirements/http";
import { ensureInvoice, rowToView } from "@/lib/invoice/service";
import { renderInvoicePdf } from "@/lib/invoice/pdf";
import { notifyInvoiceDownload } from "@/lib/invoice/email";
import { loadSettingRows, settingsFromRows } from "@/lib/pricing/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Download the current invoice version as a PDF. Issues the version and emails OPEX (after the response). */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!checkToken(token)) return json({ success: false, message: "This link is not recognised." }, 404);
  if (isDemo(token)) return json({ success: false, message: "PDF invoices are available on live client links." }, 400);
  try {
    const found = await loadDraft(token);
    if (!found) return json({ success: false, message: "This link is not recognised." }, 404);
    const row = await ensureInvoice(found.p, found.draft, "download", true);
    if (!row) return json({ success: false, message: "Add your servers or services first." }, 409);
    const settings = settingsFromRows(await loadSettingRows());
    const pdf = await renderInvoicePdf(rowToView(row, settings.showPartner), { projectName: found.p.project_name ?? "" });
    after(() =>
      notifyInvoiceDownload({
        invoice: row,
        pdf,
        customerName: row.inputs_snapshot.billTo.name || found.p.customer_name || "",
        projectName: found.p.project_name ?? "",
      }),
    );
    return new Response(Buffer.from(pdf), {
      headers: {
        ...NO_STORE,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${row.number}-v${row.version}.pdf"`,
        "Content-Length": String(pdf.byteLength),
      },
    });
  } catch (error) {
    console.error("[invoice] pdf failed", error);
    return json({ success: false, message: "We couldn't create the PDF just now." }, 500);
  }
}
