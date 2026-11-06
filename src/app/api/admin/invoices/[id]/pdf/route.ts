import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { ADMIN_HEADERS } from "@/lib/admin/http";
import { getInvoice, rowToView } from "@/lib/invoice/service";
import { renderInvoicePdf } from "@/lib/invoice/pdf";
import { loadSettingRows, settingsFromRows } from "@/lib/pricing/data";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Any invoice version as a PDF (admin only; no email, does not mark the version downloaded). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, message: "Sign in first." }, { status: 401, headers: ADMIN_HEADERS });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: false }, { status: 404, headers: ADMIN_HEADERS });
  const row = await getInvoice(id);
  if (!row) return NextResponse.json({ ok: false }, { status: 404, headers: ADMIN_HEADERS });
  const { data: p } = await db().from("projects").select("project_name").eq("id", row.project_id).maybeSingle();
  const settings = settingsFromRows(await loadSettingRows());
  const pdf = await renderInvoicePdf(rowToView(row, settings.showPartner), { projectName: p?.project_name ?? "" });
  return new Response(Buffer.from(pdf), {
    headers: { ...ADMIN_HEADERS, "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${row.number}-v${row.version}.pdf"` },
  });
}
