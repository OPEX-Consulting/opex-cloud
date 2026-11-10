import { after } from "next/server";
import { isDemo, loadDraft } from "@/lib/requirements/server";
import { checkToken, json, NO_STORE } from "@/lib/requirements/http";
import { ensureInvoice, rowToView } from "@/lib/invoice/service";
import { renderInvoicePdf } from "@/lib/invoice/pdf";
import { notifyInvoiceDownload } from "@/lib/invoice/email";
import { loadSettingRows, settingsFromRows } from "@/lib/pricing/data";
import { db } from "@/lib/server/db";
import { getConnection } from "@/lib/zoho/client";
import { fetchZohoPdf, saveZohoFields, syncInvoiceToZoho, type ZohoInvoiceRow } from "@/lib/zoho/books";

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
    const inv = row as ZohoInvoiceRow;
    let prev: ZohoInvoiceRow | null = null;
    if (inv.version > 1) {
      const { data } = await db()
        .from("invoices")
        .select("*")
        .eq("project_id", inv.project_id)
        .eq("version", inv.version - 1)
        .maybeSingle();
      prev = (data as ZohoInvoiceRow | null) ?? null;
    }

    // Zoho Books: create (or reuse) an open invoice for this version and serve Zoho's PDF.
    // Never fails the download: on any error the portal PDF is served and the error is recorded on the row.
    let pdf: Uint8Array | null = null;
    let filename = `${inv.number}-v${inv.version}.pdf`;
    let zohoNumber: string | undefined;
    let zohoStatus = "not connected";
    let warning: string | undefined;
    try {
      const conn = await getConnection();
      if (conn?.org_id && conn.refresh_token) {
        try {
          // Reuse only an invoice created in this deployment's organisation; preview (test org) and
          // production (live org) share the invoices table.
          const sameOrg = inv.zoho_org_id === conn.org_id;
          let id = sameOrg ? (inv.zoho_invoice_id ?? null) : null;
          let number = sameOrg ? (inv.zoho_invoice_number ?? null) : null;
          if (id) {
            zohoStatus = "reused";
          } else {
            const r = await syncInvoiceToZoho(inv, prev, { conn });
            const now = new Date().toISOString();
            id = r.zoho_invoice_id;
            number = r.zoho_invoice_number;
            await saveZohoFields(inv.id, {
              zoho_invoice_id: r.zoho_invoice_id,
              zoho_org_id: conn.org_id,
              zoho_voided_at: null,
              zoho_invoice_number: r.zoho_invoice_number,
              zoho_total: r.zoho_total,
              zoho_status: r.zoho_status,
              zoho_synced_at: now,
              zoho_sync_error: null,
            });
            Object.assign(inv, { zoho_invoice_id: id, zoho_invoice_number: number });
            if (prev && r.voidedPrev) await saveZohoFields(prev.id, { zoho_voided_at: now, zoho_status: "void" });
            if (prev && r.voidSkipped) await saveZohoFields(prev.id, { zoho_sync_error: r.voidSkipped.slice(0, 500) });
            warning = r.warning ?? undefined;
            zohoStatus = "created";
          }
          zohoNumber = number ?? undefined;
          pdf = await fetchZohoPdf(id, fetch, { conn });
          filename = `${number || id}.pdf`;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[invoice] zoho failed", e);
          zohoStatus = `failed: ${msg}`;
          pdf = null;
          filename = `${inv.number}-v${inv.version}.pdf`;
          try {
            await saveZohoFields(inv.id, { zoho_sync_error: msg.slice(0, 500) });
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      // getConnection failed (e.g. table missing): behave as not connected.
      console.error("[invoice] zoho connection lookup failed", e);
    }

    if (!pdf) {
      const settings = settingsFromRows(await loadSettingRows());
      pdf = await renderInvoicePdf(rowToView(row, settings.showPartner), { projectName: found.p.project_name ?? "" });
    }
    const served = pdf;
    after(() =>
      notifyInvoiceDownload({
        invoice: row,
        pdf: served,
        filename,
        customerName: row.inputs_snapshot.billTo.name || found.p.customer_name || "",
        projectName: found.p.project_name ?? "",
        zohoNumber,
        zohoStatus,
        warning,
      }),
    );
    return new Response(Buffer.from(pdf), {
      headers: {
        ...NO_STORE,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename.replace(/[^\w.-]/g, "_")}"`,
        "Content-Length": String(pdf.byteLength),
      },
    });
  } catch (error) {
    console.error("[invoice] pdf failed", error);
    return json({ success: false, message: "We couldn't create the PDF just now." }, 500);
  }
}
