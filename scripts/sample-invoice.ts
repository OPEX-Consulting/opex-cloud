// Render a sample invoice PDF from the sheet's sample inputs: npx tsx scripts/sample-invoice.ts out.pdf
import { writeFileSync } from "node:fs";
import { priceQuote } from "../src/lib/pricing/engine";
import { DEFAULT_PRICING } from "../src/lib/pricing/defaults";
import { buildInvoiceView, addDays } from "../src/lib/invoice/view";
import { renderInvoicePdf } from "../src/lib/invoice/pdf";
import { INVOICE_TEXT } from "../src/lib/invoice/company";

const r = priceQuote(
  {
    servers: [
      { role: "Web portal", os: "Linux", qty: 1, vcpu: 4, ramGb: 8, ssdGb: 200, hddGb: 0, backup: true, replication: "None" },
      { role: "Domain controller", os: "Windows", qty: 2, vcpu: 2, ramGb: 4, ssdGb: 100, hddGb: 0, backup: true, replication: "None", assumed: ["backup assumed"] },
    ],
    objectGb: 1000, publicIps: 2, sites: 1, mbps: 100, vpn: 1, firewalls: 1, loadBalancers: 1, monitoring: 1,
    standby: false, margin: 0.2, partner: "UniCloud", termMonths: 12,
  },
  DEFAULT_PRICING,
  1400,
  INVOICE_TEXT.clientNote,
);
const now = new Date().toISOString();
const v = buildInvoiceView({
  id: null, number: "OPX-261106-001", version: 1, status: "current", createdAt: now, validUntil: addDays(now, 30),
  quote: r.quote, chosen: r.comparison.chosen, settings: { showPartner: false },
  billTo: { name: "Sample Client Ltd", address: "1 Test Road, Ikoyi, Lagos", contactName: "Head of ICT", contactEmail: "ict@example.com", contactPhone: "+234 000 000 0000" },
});
renderInvoicePdf(v, { projectName: "Sample migration" }).then((b) => writeFileSync(process.argv[2] ?? "invoice.pdf", b));
