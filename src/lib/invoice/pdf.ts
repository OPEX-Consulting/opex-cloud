// Server-side A4 invoice PDF (pdf-lib + embedded DejaVu Sans subset, so ₦ renders). Works on Vercel serverless.
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { InvoiceView } from "../requirements/schema";
import { COMPANY, INVOICE_TEXT } from "./company";
import { DEJAVU_BOLD_B64 } from "./fonts/dejavu-bold";
import { DEJAVU_REGULAR_B64 } from "./fonts/dejavu-regular";
import { longDate, naira, qtyFmt } from "./view";

const A4: [number, number] = [595.28, 841.89];
const M = 42; // page margin
const NAVY = rgb(7 / 255, 21 / 255, 47 / 255);
const BLUE = rgb(49 / 255, 92 / 255, 170 / 255);
const GREY = rgb(0.38, 0.42, 0.48);
const LIGHT = rgb(0.95, 0.96, 0.98);
const RULE = rgb(0.86, 0.88, 0.91);
const AMBER = rgb(0.71, 0.33, 0.16);

const b64 = (s: string) => Uint8Array.from(Buffer.from(s, "base64"));

type Ctx = { doc: PDFDocument; page: PDFPage; y: number; reg: PDFFont; bold: PDFFont; pageNo: number };

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const tryLine = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(tryLine, size) <= width) line = tryLine;
      else {
        if (line) out.push(line);
        // Hard-break very long words.
        let w = word;
        while (font.widthOfTextAtSize(w, size) > width && w.length > 1) {
          let i = w.length;
          while (i > 1 && font.widthOfTextAtSize(w.slice(0, i), size) > width) i--;
          out.push(w.slice(0, i));
          w = w.slice(i);
        }
        line = w;
      }
    }
    out.push(line);
  }
  return out;
}

function text(c: Ctx, s: string, x: number, y: number, size = 9, font = c.reg, color = NAVY) {
  c.page.drawText(s, { x, y, size, font, color });
}

function right(c: Ctx, s: string, xRight: number, y: number, size = 9, font = c.reg, color = NAVY) {
  c.page.drawText(s, { x: xRight - font.widthOfTextAtSize(s, size), y, size, font, color });
}

function footer(c: Ctx, v: InvoiceView) {
  const y = 30;
  c.page.drawLine({ start: { x: M, y: y + 14 }, end: { x: A4[0] - M, y: y + 14 }, thickness: 0.5, color: RULE });
  const legal = `${COMPANY.legalName} · RC ${COMPANY.rcNumber} · TIN ${COMPANY.tin} · VAT ${COMPANY.vatNumber}`;
  const lines = wrap(legal, c.reg, 6.5, A4[0] - 2 * M - 80);
  lines.forEach((l, i) => text(c, l, M, y + 4 - i * 8, 6.5, c.reg, GREY));
  right(c, `${v.number} v${v.version} · page ${c.pageNo}`, A4[0] - M, y + 4, 6.5, c.reg, GREY);
}

function newPage(c: Ctx, v: InvoiceView) {
  footer(c, v);
  c.page = c.doc.addPage(A4);
  c.pageNo += 1;
  c.y = A4[1] - M;
  text(c, `${COMPANY.tradingName} · ${INVOICE_TEXT.title} ${v.number} (version ${v.version}) continued`, M, c.y, 8, c.bold, GREY);
  c.y -= 20;
}

function ensure(c: Ctx, v: InvoiceView, h: number, onBreak?: () => void) {
  if (c.y - h < 52) {
    newPage(c, v);
    onBreak?.();
  }
}

export async function renderInvoicePdf(v: InvoiceView, opts: { projectName?: string } = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const reg = await doc.embedFont(b64(DEJAVU_REGULAR_B64), { subset: true });
  const bold = await doc.embedFont(b64(DEJAVU_BOLD_B64), { subset: true });
  doc.setTitle(`${INVOICE_TEXT.title} ${v.number} v${v.version}`);
  doc.setAuthor(COMPANY.legalName);
  doc.setSubject(`Pro-forma invoice for ${v.billTo.name}`);
  doc.setCreator("OPEX Cloud requirements portal");
  doc.setCreationDate(new Date(v.createdAt));

  const page = doc.addPage(A4);
  const c: Ctx = { doc, page, y: A4[1], reg, bold, pageNo: 1 };
  const W = A4[0] - 2 * M;

  /* ---- Header band ---- */
  const bandH = 92;
  page.drawRectangle({ x: 0, y: A4[1] - bandH, width: A4[0], height: bandH, color: NAVY });
  text(c, COMPANY.logoText, M, A4[1] - 44, 22, bold, rgb(1, 1, 1));
  text(c, v.partnerLine ? `${COMPANY.tagline}  |  ${v.partnerLine}` : COMPANY.tagline, M, A4[1] - 62, 9, reg, rgb(0.78, 0.84, 0.95));
  text(c, "[PLACEHOLDER: logo]", M, A4[1] - 78, 6.5, reg, rgb(0.6, 0.66, 0.78));
  right(c, INVOICE_TEXT.title, A4[0] - M, A4[1] - 40, 15, bold, rgb(1, 1, 1));
  right(c, `${v.number}  ·  version ${v.version}`, A4[0] - M, A4[1] - 58, 9.5, reg, rgb(0.85, 0.89, 0.97));
  if (v.status === "superseded") right(c, "SUPERSEDED", A4[0] - M, A4[1] - 76, 9, bold, rgb(1, 0.75, 0.6));

  /* ---- Meta + parties ---- */
  c.y = A4[1] - bandH - 26;
  const colW = (W - 20) / 3;
  const block = (x: number, title: string, rows: string[], w: number) => {
    let y = c.y;
    text(c, title.toUpperCase(), x, y, 7, bold, BLUE);
    y -= 13;
    for (const r of rows.filter(Boolean)) {
      for (const l of wrap(r, reg, 8.5, w)) {
        text(c, l, x, y, 8.5);
        y -= 11;
      }
    }
    return y;
  };
  const y1 = block(
    M,
    "Bill to",
    [v.billTo.name || "—", v.billTo.address, v.billTo.contactName ? `Attn: ${v.billTo.contactName}` : "", v.billTo.contactEmail, v.billTo.contactPhone],
    colW,
  );
  const y2 = block(M + colW + 10, "From", [COMPANY.legalName, COMPANY.address, COMPANY.email, COMPANY.phone], colW);
  const y3 = block(
    M + 2 * (colW + 10),
    "Invoice details",
    [
      `Invoice no: ${v.number}`,
      `Version: ${v.version}`,
      `Date: ${longDate(v.createdAt)}`,
      `Valid until: ${longDate(v.validUntil)}`,
      `Term: ${v.termMonths <= 1 ? "Monthly" : `${v.termMonths} months`}`,
      opts.projectName ? `Project: ${opts.projectName}` : "",
    ],
    colW,
  );
  c.y = Math.min(y1, y2, y3) - 10;

  /* ---- Lines table ---- */
  const cols = { n: M + 4, desc: M + 22, qtyR: M + W - 240, unit: M + W - 230, unitPriceR: M + W - 78, monthlyR: M + W - 4 };
  const descW = cols.qtyR - 36 - cols.desc;
  const head = () => {
    c.page.drawRectangle({ x: M, y: c.y - 6, width: W, height: 20, color: LIGHT });
    text(c, "#", cols.n, c.y, 7.5, bold, GREY);
    text(c, "Description", cols.desc, c.y, 7.5, bold, GREY);
    right(c, "Qty", cols.qtyR, c.y, 7.5, bold, GREY);
    text(c, "Unit", cols.unit, c.y, 7.5, bold, GREY);
    right(c, "Unit price", cols.unitPriceR, c.y, 7.5, bold, GREY);
    right(c, "Monthly", cols.monthlyR, c.y, 7.5, bold, GREY);
    c.y -= 22;
  };
  head();
  for (const l of v.lines) {
    const desc = wrap(`${l.description}${l.assumed ? " *" : ""}`, reg, 8.5, descW);
    const unitLines = wrap(l.unit, reg, 7.5, cols.unitPriceR - 66 - cols.unit);
    const h = Math.max(desc.length * 11, unitLines.length * 10) + (l.assumed ? 8 : 0) + 4;
    ensure(c, v, h + 4, head);
    text(c, String(l.n), cols.n, c.y, 8.5, reg, GREY);
    desc.forEach((d, i) => text(c, d, cols.desc, c.y - i * 11, 8.5));
    if (l.assumed) text(c, `Assumed: ${l.assumed}`, cols.desc, c.y - desc.length * 11, 6.5, reg, AMBER);
    right(c, qtyFmt(l.qty), cols.qtyR, c.y, 8.5);
    unitLines.forEach((u, i) => text(c, u, cols.unit, c.y - i * 10, 7.5, reg, GREY));
    if (l.toBeQuoted) {
      right(c, "To be quoted", cols.monthlyR, c.y, 8.5, bold, AMBER);
    } else {
      right(c, naira(l.unitPrice ?? 0), cols.unitPriceR, c.y, 8.5);
      right(c, naira(l.monthly ?? 0), cols.monthlyR, c.y, 8.5, bold);
    }
    c.y -= h;
    c.page.drawLine({ start: { x: M, y: c.y + 8 }, end: { x: M + W, y: c.y + 8 }, thickness: 0.4, color: RULE });
  }

  /* ---- Totals ---- */
  const totals: [string, string, boolean][] = [
    ["Monthly subtotal", naira(v.subtotal), false],
    [`VAT (${(v.vatRate * 100).toFixed(1)}%)`, naira(v.vat), false],
    ["Monthly total", naira(v.monthlyTotal), true],
  ];
  if (v.termTotal != null) totals.push([`Total for ${v.termMonths} months`, naira(v.termTotal), true]);
  const boxH = totals.length * 16 + 38;
  ensure(c, v, boxH + 10);
  c.y -= 6;
  const bx = M + W - 300;
  let ty = c.y;
  for (const [k, val, strong] of totals) {
    text(c, k, bx, ty, 9, strong ? bold : reg, strong ? NAVY : GREY);
    right(c, val, M + W - 4, ty, 9, strong ? bold : reg);
    ty -= 16;
  }
  c.page.drawRectangle({ x: bx - 8, y: ty - 16, width: 308, height: 26, color: NAVY });
  text(c, v.amountDueLabel, bx, ty - 7, 8, bold, rgb(1, 1, 1));
  right(c, naira(v.amountDueNow), M + W - 4, ty - 7, 10, bold, rgb(1, 1, 1));
  if (v.tbqCount > 0) {
    const n = wrap(`${v.tbqCount} line(s) “To be quoted” are not included in these totals.`, reg, 7.5, 180);
    n.forEach((l, i) => text(c, l, M, c.y - i * 10, 7.5, reg, AMBER));
  }
  c.y = ty - 30;

  /* ---- Payment details ---- */
  const pay: [string, string][] = [
    ["Bank", v.payment.bankName],
    ["Account name", v.payment.accountName],
    ["Account number", v.payment.accountNumber],
    ["Sort code", v.payment.sortCode],
    ["Payment reference", v.payment.reference],
  ];
  const instr = wrap(v.payment.instructions, reg, 8, W - 20);
  const payH = 26 + pay.length * 12 + instr.length * 10 + 10;
  ensure(c, v, payH);
  c.page.drawRectangle({ x: M, y: c.y - payH + 12, width: W, height: payH, color: LIGHT });
  let py = c.y;
  text(c, "PAYMENT DETAILS", M + 10, py, 7, bold, BLUE);
  py -= 14;
  for (const [k, val] of pay) {
    text(c, k, M + 10, py, 8.5, reg, GREY);
    text(c, val, M + 120, py, 8.5, bold);
    py -= 12;
  }
  instr.forEach((l) => {
    text(c, l, M + 10, py, 8, reg, GREY);
    py -= 10;
  });
  c.y -= payH + 8;

  /* ---- Terms and notes ---- */
  const notes = [...v.notes, INVOICE_TEXT.legalFooter];
  const noteLines = notes.flatMap((n) => wrap(`• ${n}`, reg, 8, W));
  ensure(c, v, 20 + Math.min(noteLines.length, 6) * 10);
  text(c, "TERMS AND NOTES", M, c.y, 7, bold, BLUE);
  c.y -= 13;
  for (const l of noteLines) {
    ensure(c, v, 12);
    text(c, l, M, c.y, 8, reg, GREY);
    c.y -= 10.5;
  }
  c.y -= 6;
  ensure(c, v, 12);
  text(c, `Prepared by ${COMPANY.tradingName}`, M, c.y, 8, bold, NAVY);

  footer(c, v);
  return doc.save();
}
