/*
 * Amount due now, aligned with the Zoho Books invoice: ZOHO_BILLING_MONTHS of service incl. VAT,
 * computed exactly as Zoho does it (each line's rate = round2(unit price × months), then VAT on the subtotal).
 * Once Zoho has created the invoice, its own total wins.
 */
import { round2 } from "../pricing/engine";
import { billingMonths } from "../zoho/books";
import type { InvoiceRow } from "./service";

type Line = { qty: number; unitPrice: number | null; toBeQuoted?: boolean };

export function billedTotal(lines: Line[], vatRate: number, months: number): number {
  const sub = lines
    .filter((l) => !l.toBeQuoted && l.unitPrice !== null)
    .reduce((a, l) => a + round2(Number(l.qty) * round2(Number(l.unitPrice) * months)), 0);
  const subtotal = round2(sub);
  return round2(subtotal + round2(subtotal * vatRate));
}

export function dueLabel(months: number): string {
  return months === 1 ? "Amount due now (first month, incl. VAT)" : `Amount due now (${months} months, incl. VAT)`;
}

export function amountDue(row: InvoiceRow & { zoho_total?: number | string | null }, months: number = billingMonths()) {
  const z = row.zoho_total;
  const amount =
    z !== null && z !== undefined && z !== "" && Number.isFinite(Number(z))
      ? Number(z)
      : billedTotal(row.line_items ?? [], Number(row.inputs_snapshot?.quote?.vatRate ?? 0.075), months);
  return { amount, months, label: dueLabel(months) };
}
