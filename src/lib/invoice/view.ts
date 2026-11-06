/* Build the client-facing invoice view (pure; shared by the API, the PDF and the portal preview). */
import type { InvoiceView } from "../requirements/schema";
import type { Answers } from "../requirements/schema";
import type { EngineResult, Partner, PricingSettings } from "../pricing/types";
import { COMPANY, INVOICE_TEXT, PAYMENT } from "./company";

export type BillTo = InvoiceView["billTo"];

export function billToFrom(a: Answers, fallbackName = ""): BillTo {
  return {
    name: a.contact.customerName.trim() || fallbackName,
    address: a.contact.customerAddress.trim(),
    contactName: a.contact.contactName.trim(),
    contactEmail: a.contact.contactEmail.trim(),
    contactPhone: a.contact.contactPhone.trim(),
  };
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const PARTNER_NAMES: Record<Partner, string> = { UniCloud: "UniCloud Africa", Unitellas: "Unitellas" };

export function buildInvoiceView(args: {
  id: string | null;
  number: string;
  version: number;
  status: InvoiceView["status"];
  createdAt: string;
  validUntil: string;
  quote: EngineResult["quote"];
  chosen: Partner;
  settings: Pick<PricingSettings, "showPartner">;
  billTo: BillTo;
}): InvoiceView {
  const q = args.quote;
  const assumedCount = q.lines.filter((l) => l.assumed).length;
  const notes = [...q.notes];
  if (q.tbqCount > 0) notes.push(INVOICE_TEXT.tbqNote);
  if (assumedCount > 0) notes.push(INVOICE_TEXT.assumedNote);
  return {
    id: args.id,
    number: args.number,
    version: args.version,
    status: args.status,
    createdAt: args.createdAt,
    validUntil: args.validUntil,
    termMonths: q.termMonths,
    lines: q.lines.map((l) => ({
      n: l.n,
      description: l.description,
      qty: l.qty,
      unit: l.unit,
      unitPrice: l.unitPrice,
      monthly: l.monthly,
      toBeQuoted: l.toBeQuoted,
      assumed: l.assumed,
    })),
    subtotal: q.subtotal,
    vatRate: q.vatRate,
    vat: q.vat,
    monthlyTotal: q.monthlyTotal,
    termTotal: q.termTotal,
    amountDueMode: q.amountDueMode,
    amountDueNow: q.amountDueNow,
    amountDueLabel: INVOICE_TEXT.amountDueLabels[q.amountDueMode],
    tbqCount: q.tbqCount,
    assumedCount,
    notes,
    partnerLine: args.settings.showPartner ? `Infrastructure partner: ${PARTNER_NAMES[args.chosen]}` : null,
    billTo: args.billTo,
    payment: {
      bankName: PAYMENT.bankName,
      accountName: PAYMENT.accountName,
      accountNumber: PAYMENT.accountNumber,
      sortCode: PAYMENT.sortCode,
      reference: PAYMENT.referenceTemplate.replace("{number}", args.number),
      instructions: PAYMENT.instructions,
    },
  };
}

export const naira = (n: number) =>
  `₦${new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

export const qtyFmt = (n: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(n);

export const longDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

export { COMPANY };
