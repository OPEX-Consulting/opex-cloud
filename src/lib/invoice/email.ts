import { amountDue } from "./due";
// Server-only: email OPEX when a client downloads an invoice PDF (SMTP via nodemailer).
// Env: SMTP_HOST, SMTP_PORT (default 465), SMTP_SECURE (default true when port 465), SMTP_USER, SMTP_PASS.
// Every attempt is written to the `notifications` outbox. Never throws: the download must not depend on email.
import nodemailer from "nodemailer";
import { db } from "../server/db";
import { EMAIL } from "./company";
import { describeChanges, type InvoiceRow } from "./service";
import { naira } from "./view";

const DEBOUNCE_MS = 10 * 60 * 1000;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** "[PLACEHOLDER] finance@x.com" -> "finance@x.com"; "Name <a@b.c>" stays as is. */
export function cleanAddress(v: string) {
  const angle = v.match(/<([^>]+@[^>]+)>/);
  if (angle) return v.replace(/\[PLACEHOLDER[^\]]*\]\s*/gi, "").trim();
  const m = v.match(/[^\s<>[\]]+@[^\s<>[\]]+\.[^\s<>[\]]+/);
  return m ? m[0] : v.trim();
}

export async function notifyInvoiceDownload(args: {
  invoice: InvoiceRow;
  pdf: Uint8Array;
  customerName: string;
  projectName: string;
  /** Filename of the PDF that was served (defaults to NUMBER-vN.pdf). */
  filename?: string;
  zohoNumber?: string;
  /** Total of the Zoho Books invoice, when one exists (wins over the computed amount). */
  zohoTotal?: number | null;
  /** 'created' | 'reused' | 'not connected' | 'failed: msg' */
  zohoStatus?: string;
  warning?: string;
}): Promise<{ status: string; id?: string }> {
  const { invoice, pdf } = args;
  try {
    // Debounce: one email per version per 10 minutes (failed attempts don't count).
    const since = new Date(Date.now() - DEBOUNCE_MS).toISOString();
    const { data: recent } = await db()
      .from("notifications")
      .select("id")
      .eq("invoice_id", invoice.id)
      .eq("kind", "invoice_download")
      .in("status", ["pending", "sent", "skipped_no_provider"])
      .gte("created_at", since)
      .limit(1);

    const due = amountDue({ ...invoice, zoho_total: args.zohoTotal ?? (invoice as { zoho_total?: number | null }).zoho_total ?? null });
    const subject = `Invoice downloaded: ${args.customerName || "client"} · ${invoice.number} v${invoice.version} · ${naira(due.amount)} due`;
    const to = cleanAddress(EMAIL.alertTo);
    const base = { kind: "invoice_download", project_id: invoice.project_id, invoice_id: invoice.id, to_address: to, subject };

    if (recent && recent.length) {
      await db().from("notifications").insert({ ...base, status: "debounced" });
      return { status: "debounced" };
    }

    const host = (process.env.SMTP_HOST ?? "").trim().replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "").replace(/:\d+$/, "") || undefined;
    if (!host || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      const { data } = await db().from("notifications").insert({ ...base, status: "skipped_no_provider", error: "SMTP_HOST / SMTP_USER / SMTP_PASS not set" }).select("id").single();
      return { status: "skipped_no_provider", id: data?.id };
    }

    const { data: pending } = await db().from("notifications").insert({ ...base, status: "pending" }).select("id").single();

    let prev: InvoiceRow | null = null;
    if (invoice.version > 1) {
      const { data } = await db()
        .from("invoices")
        .select("*")
        .eq("project_id", invoice.project_id)
        .eq("version", invoice.version - 1)
        .maybeSingle();
      prev = (data as InvoiceRow | null) ?? null;
    }
    const changes = describeChanges(prev, invoice);
    const rows: [string, string][] = [
      ["Client", args.customerName || "—"],
      ["Project", args.projectName || "—"],
      ["Invoice", `${invoice.number} (version ${invoice.version})`],
      ["Monthly total (incl. VAT)", naira(Number(invoice.monthly_total))],
      [due.label, naira(due.amount)],
      ["Partner (internal)", invoice.chosen_partner],
      ["FX used (internal)", `${invoice.fx_rate_used} – ${invoice.fx_source}`],
      ["Zoho Books invoice", args.zohoNumber || "—"],
      ["Zoho sync", args.zohoStatus || "not connected"],
    ];
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#07152f">
<p>A client has downloaded a pro-forma invoice from the requirements portal.</p>
${args.warning ? `<p style="color:#c0262d"><b>Warning:</b> ${esc(args.warning)}</p>` : ""}
<table cellpadding="4" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#5f6b7a">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join("")}</table>
<p><b>What changed from the previous version</b></p><ul>${changes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
<p>The PDF is attached.</p></div>`;
    const text = `${args.warning ? `WARNING: ${args.warning}\n\n` : ""}${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nWhat changed:\n${changes.map((c) => `- ${c}`).join("\n")}`;

    const port = Number(process.env.SMTP_PORT || 465);
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    try {
      const info = await transport.sendMail({
        from: EMAIL.from,
        to,
        subject,
        html,
        text,
        attachments: [{ filename: args.filename || `${invoice.number}-v${invoice.version}.pdf`, content: Buffer.from(pdf), contentType: "application/pdf" }],
      });
      await db().from("notifications").update({ status: "sent", provider_id: info.messageId ?? null, sent_at: new Date().toISOString() }).eq("id", pending?.id);
      return { status: "sent", id: info.messageId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await db().from("notifications").update({ status: "failed", error: `SMTP: ${msg}`.slice(0, 500) }).eq("id", pending?.id);
      return { status: "failed" };
    }
  } catch (e) {
    console.error("[invoice email] failed", e);
    try {
      await db().from("notifications").insert({
        kind: "invoice_download",
        project_id: invoice.project_id,
        invoice_id: invoice.id,
        status: "failed",
        error: (e instanceof Error ? e.message : String(e)).slice(0, 500),
      });
    } catch {
      /* ignore */
    }
    return { status: "failed" };
  }
}
