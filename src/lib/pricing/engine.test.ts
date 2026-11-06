import { test } from "node:test";
import assert from "node:assert/strict";
import { priceQuote, round2 } from "./engine";
import { DEFAULT_PRICING } from "./defaults";
import type { EngineInputs } from "./types";

/** The sheet's sample inputs ("Quote Builder" tab as delivered). */
const SAMPLE: EngineInputs = {
  servers: [
    { role: "Web portal", os: "Linux", qty: 1, vcpu: 4, ramGb: 8, ssdGb: 200, hddGb: 0, backup: true, replication: "None" },
  ],
  objectGb: 1000,
  publicIps: 2,
  sites: 1,
  mbps: 100,
  vpn: 1,
  firewalls: 1,
  loadBalancers: 1,
  monitoring: 1,
  standby: false,
  margin: 0.2,
  partner: "Recommended",
  termMonths: 12,
};
const FX = 1400;
const P = { ...DEFAULT_PRICING, settings: { ...DEFAULT_PRICING.settings, amountDueMode: "first_month" as const } };

test("round2 matches Google Sheets display rounding", () => {
  assert.equal(round2(28810.215), 28810.22);
  assert.equal(round2(384136.2 * 0.075), 28810.22);
  assert.equal(round2(1.005), 1.01);
  assert.equal(round2(82295.919 * 1.2), 98755.1);
});

test("sheet sample reproduces the Comparison and Client Quote tabs exactly", () => {
  const r = priceQuote(SAMPLE, P, FX);
  const c = r.comparison;
  assert.equal(c.uniMonthly, 320113.5);
  assert.equal(c.utlMonthly, 321860.0);
  assert.equal(c.uniGaps, 0);
  assert.equal(c.utlGaps, 6);
  assert.equal(c.uniLfl, 195840.0);
  assert.equal(c.utlLfl, 321860.0);
  assert.equal(c.recommended, "UniCloud");
  assert.equal(c.chosen, "UniCloud");
  assert.equal(c.recommendationReason, "UniCloud covers every requirement; Unitellas is missing 6 item(s).");
  assert.equal(c.lflNote, "UniCloud is ₦126,020.00 a month cheaper like for like (39.2%).");
  assert.equal(c.marginNgn, 64022.7);

  const compute = c.lines.find((l) => l.key === "compute")!;
  assert.equal(compute.description, "Web portal: 4 vCPU, 8 GB RAM, Linux");
  assert.equal(compute.uniUnit, 51840);
  assert.equal(round2(compute.utlUnit as number), 112420);
  assert.equal(compute.notes, "Unitellas size: Z4 Xlarge (4 vCPU / 16 GB)");

  const q = r.quote;
  assert.deepEqual(
    q.lines.map((l) => [l.n, l.description, l.qty, l.unitPrice, l.monthly]),
    [
      [1, "Web portal: 4 vCPU, 8 GB RAM, Linux", 1, 62208, 62208],
      [2, "NVMe / SSD block storage", 200, 216, 43200],
      [3, "S3-compatible object storage", 1000, 108, 108000],
      [4, "Static public IPv4", 2, 2700, 5400],
      [5, "Internet access, 100 Mbps", 1, 21600, 21600],
      [6, "VPN appliance", 1, 27108, 27108],
      [7, "Firewall (pfSense)", 1, 27556.2, 27556.2],
      [8, "Load balancer", 1, 31104, 31104],
      [9, "Infrastructure monitoring", 1, 12960, 12960],
      [10, "Managed VM backup", 1, 45000, 45000],
    ],
  );
  assert.equal(q.subtotal, 384136.2);
  assert.equal(q.vat, 28810.22);
  assert.equal(q.monthlyTotal, 412946.42);
  assert.equal(q.termTotal, 4955356.98);
  assert.equal(q.amountDueNow, 412946.42);
  assert.equal(q.tbqCount, 0);
  assert.deepEqual(q.notes, [
    "All prices exclude 7.5% VAT unless shown above.",
    "Backup and replication services are annual licences billed monthly.",
    "Prices are monthly and exclude one-off implementation and migration services, which are quoted separately.",
  ]);
});

test("Windows server: UniCloud licence is a gap, Unitellas Windows size includes it", () => {
  const r = priceQuote(
    {
      ...SAMPLE,
      servers: [{ role: "AD", os: "Windows", qty: 1, vcpu: 4, ramGb: 8, ssdGb: 100, hddGb: 0, backup: false, replication: "None" }],
      objectGb: 0,
      publicIps: 0,
      vpn: 0,
      firewalls: 0,
      loadBalancers: 0,
      monitoring: 0,
    },
    P,
    FX,
  );
  const c = r.comparison;
  assert.equal(c.uniGaps, 1);
  assert.equal(c.utlGaps, 0);
  assert.equal(c.uniMonthly, 87840);
  assert.equal(c.utlMonthly, 481096);
  assert.equal(c.recommended, "Unitellas");
  assert.equal(c.lines[0].notes, "Unitellas size: Z4 Xlarge (4 vCPU / 16 GB)");
  const q = r.quote;
  assert.deepEqual(
    q.lines.map((l) => [l.description, l.unitPrice, l.monthly]),
    [
      ["AD: 4 vCPU, 8 GB RAM, Windows", 377731.2, 377731.2],
      ["NVMe / SSD block storage", 147.84, 14784],
      ["Windows Server licence", 0, 0],
      ["Internet access, 100 Mbps", 184800, 184800],
    ],
  );
  assert.equal(q.subtotal, 577315.2);
  assert.equal(q.vat, 43298.64);
  assert.equal(q.monthlyTotal, 620613.84);
  assert.equal(q.termTotal, 7447366.08);
});

test("UniCloud chosen with Windows: licence line is To be quoted and excluded from totals", () => {
  const r = priceQuote(
    { ...SAMPLE, partner: "UniCloud", servers: [{ ...SAMPLE.servers[0], os: "Windows" }] },
    P,
    FX,
  );
  const lic = r.quote.lines.find((l) => l.key === "windows_licence")!;
  assert.equal(lic.toBeQuoted, true);
  assert.equal(lic.monthly, null);
  assert.equal(r.quote.tbqCount, 1);
  assert.equal(r.quote.subtotal, 384136.2);
  assert.equal(r.quote.notes[1], "1 item(s) marked To be quoted will be priced separately.");
});

test("bandwidth 200 Mbps: UniCloud internet is To be quoted, Unitellas uses the 200 Mbps tier", () => {
  const r = priceQuote({ ...SAMPLE, mbps: 200 }, P, FX);
  const c = r.comparison;
  const inet = c.lines.find((l) => l.key === "internet")!;
  assert.equal(inet.uniUnit, "To be quoted");
  assert.equal(inet.utlUnit, 308000);
  assert.equal(inet.notes, "UniCloud internet bursts to 100 Mbps only. Unitellas: smallest WAN tier at or above 200 Mbps.");
  assert.equal(c.uniGaps, 1);
  assert.equal(c.utlGaps, 6);
  assert.equal(c.recommended, "UniCloud");
  assert.equal(c.recommendationReason, "UniCloud covers more of the requirement (1 gap(s) against 6).");
  assert.equal(c.uniMonthly, 302113.5);
  assert.equal(r.quote.subtotal, 362536.2);
  assert.equal(r.quote.tbqCount, 1);
});

test("standby Yes with active-passive replication adds replication, standby compute and storage", () => {
  const r = priceQuote(
    { ...SAMPLE, standby: true, servers: [{ ...SAMPLE.servers[0], replication: "Active-passive" }] },
    P,
    FX,
  );
  const c = r.comparison;
  const by = (k: string) => c.lines.find((l) => l.key === k)!;
  assert.equal(by("replication_ap").qty, 1);
  assert.equal(by("standby_compute").description, "Standby compute for 1 replicated server(s)");
  assert.equal(by("standby_compute").uniUnit, 51840);
  assert.equal(round2(by("standby_compute").utlUnit as number), 112420);
  assert.equal(by("standby_storage").qty, 200);
  assert.equal(c.utlGaps, 7);
  assert.equal(c.uniMonthly, 490249.42);
  assert.equal(r.quote.subtotal, 588299.3);
  assert.equal(r.quote.vat, 44122.45);
  assert.equal(r.quote.monthlyTotal, 632421.75);
  assert.equal(r.quote.termTotal, 7589060.97);
});

test("standby Yes without replicated servers adds nothing", () => {
  const r = priceQuote({ ...SAMPLE, standby: true }, P, FX);
  assert.equal(r.quote.subtotal, 384136.2);
});

test("amount due modes", () => {
  const term = priceQuote(SAMPLE, { ...P, settings: { ...P.settings, amountDueMode: "term" } }, FX);
  assert.equal(term.quote.amountDueNow, 4955356.98);
  const dep = priceQuote(SAMPLE, { ...P, settings: { ...P.settings, amountDueMode: "deposit_pct", depositPct: 0.5 } }, FX);
  assert.equal(dep.quote.amountDueNow, 2477678.49);
});

test("no Unitellas size large enough is a gap", () => {
  const r = priceQuote({ ...SAMPLE, servers: [{ ...SAMPLE.servers[0], vcpu: 64, ramGb: 512 }] }, P, FX);
  const compute = r.comparison.lines[0];
  assert.equal(compute.utlUnit, "To be quoted");
  assert.equal(compute.notes, "No Unitellas size is large enough");
});
