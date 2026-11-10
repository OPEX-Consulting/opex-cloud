import { test } from "node:test";
import assert from "node:assert/strict";
import { billedTotal, dueLabel } from "./due";

// The live test invoice (INV-000001 in the Zoho test org, 2026-11-10): 12 months, Zoho total ₦4,955,356.98.
const lines = [
  { qty: 1, unitPrice: 62208 },
  { qty: 200, unitPrice: 216 },
  { qty: 1000, unitPrice: 108 },
  { qty: 2, unitPrice: 2700 },
  { qty: 1, unitPrice: 21600 },
  { qty: 1, unitPrice: 27108 },
  { qty: 1, unitPrice: 27556.2 },
  { qty: 1, unitPrice: 31104 },
  { qty: 1, unitPrice: 12960 },
  { qty: 1, unitPrice: 45000 },
  { qty: 3, unitPrice: null, toBeQuoted: true },
];

test("amount due matches Zoho's total for 12 months (per-line rounding, VAT on subtotal)", () => {
  assert.equal(billedTotal(lines, 0.075, 12), 4955356.98);
  assert.equal(billedTotal(lines, 0.075, 1), 412946.42);
  assert.equal(dueLabel(12), "Amount due now (12 months, incl. VAT)");
  assert.equal(dueLabel(1), "Amount due now (first month, incl. VAT)");
});
