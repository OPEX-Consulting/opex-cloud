/**
 * Invoice template and company details.
 *
 * EVERY value marked [PLACEHOLDER] must be replaced with OPEX Consulting's confirmed details before the invoice
 * is sent to real clients. They are deliberately obvious so they can't be mistaken for real data.
 * See docs/requirements-portal.md → "Placeholders" for the full list (this file, pricing_settings, policy.ts, env vars).
 */
export const COMPANY = {
  /** Shown as text in the PDF header until a logo file is supplied. */
  logoText: "OPEX Cloud", // [PLACEHOLDER: replace with logo image]
  tradingName: "OPEX Cloud",
  legalName: "OPEX Consulting Limited",
  tagline: "Managed cloud infrastructure",
  address: "[PLACEHOLDER: registered office address, Lagos, Nigeria]",
  email: "[PLACEHOLDER: billing email]",
  phone: "[PLACEHOLDER: billing phone]",
  website: "opexcloud.com.ng",
  rcNumber: "[PLACEHOLDER: RC number]",
  tin: "[PLACEHOLDER: TIN]",
  vatNumber: "[PLACEHOLDER: VAT registration number]",
};

export const PAYMENT = {
  bankName: "[PLACEHOLDER: bank name]",
  accountName: "[PLACEHOLDER: account name]",
  accountNumber: "[PLACEHOLDER: 10-digit NUBAN account number]",
  sortCode: "[PLACEHOLDER: sort code]",
  /** {number} is replaced with the invoice number. */
  referenceTemplate: "{number}",
  instructions: "Please quote the invoice number as the payment reference. [PLACEHOLDER: payment terms, e.g. due within 14 days]",
};

export const INVOICE_TEXT = {
  title: "PRO-FORMA INVOICE",
  /** Client note reused from the Quote Builder sheet ("Notes for the client"). */
  clientNote: "Prices are monthly and exclude one-off implementation and migration services, which are quoted separately.",
  assumedNote:
    "Lines marked * are priced on assumed quantities because an answer was left blank or marked ‘Not sure’. We will confirm them with you before billing.",
  tbqNote: "Lines marked ‘To be quoted’ are not included in the totals and will be priced separately.",
  legalFooter:
    "This pro-forma invoice is not a tax invoice. A final invoice will follow once the order is confirmed. [PLACEHOLDER: legal wording to be confirmed by OPEX Consulting]",
  amountDueLabels: {
    first_month: "Amount due now (first month, incl. VAT)",
    term: "Amount due now (full term, incl. VAT)",
    deposit_pct: "Amount due now (deposit, incl. VAT)",
  },
};

/** Email alerts (Resend). Env vars override these defaults. */
export const EMAIL = {
  alertTo: process.env.INVOICE_ALERT_TO || "[PLACEHOLDER] finance@opexconsult.co.uk",
  from: process.env.INVOICE_FROM || "OPEX Cloud <onboarding@resend.dev>",
};

/** Invoice number: OPX-YYMMDD-NNN (NNN = running count for that day). [PLACEHOLDER format, confirm with finance] */
export const INVOICE_NUMBER_PREFIX = "OPX";
