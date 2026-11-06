/**
 * OPEX Cloud pricing engine: a pure function that reproduces the retired Google Sheet
 * "OPEX_Cloud_Quote_Builder" (tabs Settings, Rate Cards, Unitellas Sizes, Quote Builder, Comparison, Client Quote).
 *
 * Inputs (servers + services) + pricing data (settings, rate cards, Unitellas sizes and WAN tiers) + FX (₦ per $1)
 *   -> the partner comparison and the client quote.
 *
 * Formula map (sheet cell -> code):
 *   Rate Cards D (UniCloud partner cost)    = list × (1 − UNI_DISC)                       uni()
 *   Rate Cards H (Unitellas partner cost)   = list$ × FX × (1 − UTL_DISC)                 utl()
 *   Unitellas Sizes F/G                     = $/h × HOURS × (1 − UTL_DISC) × FX           sizeCost()
 *   Unitellas Sizes K (WAN)                 = $/month × FX × (1 − UTL_DISC)               wanCost()
 *   Quote Builder K (UniCloud per server)   = vCPU × U_VCPU + RAM × U_RAM
 *   Quote Builder M (Unitellas per server)  = MINIFS(cost, vCPU ≥, RAM ≥, cost > 0) on the Linux or Windows column
 *   Comparison F/H                          = qty × unit, or "To be quoted"
 *   Comparison J/K (like for like)          = F/H only when both partners price the line
 *   Comparison M (client unit price)        = ROUND(chosen unit × (1 + MARGIN), 2)
 *   Comparison O (client monthly)           = M × qty
 *   Client Quote F45..F48                   = subtotal, VAT, monthly total, term total
 *
 * No I/O here: safe to run in the browser, on the server and in unit tests.
 */
import {
  TBQ,
  type ComparisonLine,
  type EngineInputs,
  type EngineResult,
  type Money,
  type Partner,
  type PricingData,
  type RateCard,
  type ServerInput,
} from "./types";

/** Round like Google Sheets: tidy binary noise to 15 significant digits, then round half away from zero. */
export function round2(x: number): number {
  if (!Number.isFinite(x)) return x;
  const tidy = Number(x.toPrecision(15));
  const sign = tidy < 0 ? -1 : 1;
  return sign * Number(`${Math.round(Number(`${Math.abs(tidy)}e2`))}e-2`);
}

const isNum = (m: Money | null | undefined): m is number => typeof m === "number" && Number.isFinite(m);

/** TEXT(x, "0.0%") */
export const pct1 = (x: number) => `${(Math.round(x * 1000) / 10).toFixed(1)}%`;

/** TEXT(x, "#,##0.00") */
export const ngn2 = (x: number) =>
  new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(round2(x));

export const DEFAULT_CLIENT_NOTE =
  "Prices are monthly and exclude one-off implementation and migration services, which are quoted separately.";

type Rates = {
  card: (key: string) => RateCard | undefined;
  uni: (key: string) => number | null; // UniCloud partner cost (₦), null = blank
  utl: (key: string) => number | null; // Unitellas partner cost (₦), null = blank
};

function rates(p: PricingData, fx: number): Rates {
  const byKey = new Map(p.rateCards.map((c) => [c.key, c]));
  const s = p.settings;
  return {
    card: (k) => byKey.get(k),
    uni: (k) => {
      const v = byKey.get(k)?.unicloudListNgn;
      return v == null ? null : v * (1 - s.unicloudDiscount);
    },
    utl: (k) => {
      const v = byKey.get(k)?.unitellasListUsd;
      return v == null ? null : v * fx * (1 - s.unitellasDiscount);
    },
  };
}

function sizeCost(hourly: number | null, p: PricingData, fx: number): number | null {
  if (hourly == null) return null;
  return hourly * p.settings.hoursPerMonth * (1 - p.settings.unitellasDiscount) * fx;
}

/** Quote Builder M + L: cheapest Unitellas size with at least the vCPU and RAM asked for (0 = no size fits). */
export function matchUnitellasSize(
  s: Pick<ServerInput, "os" | "vcpu" | "ramGb">,
  p: PricingData,
  fx: number,
): { cost: number; label: string } {
  let best: number | null = null;
  for (const z of p.sizes) {
    const c = sizeCost(s.os === "Windows" ? z.windowsUsdHour : z.linuxUsdHour, p, fx);
    if (c == null || !(c > 0)) continue;
    if (z.vcpu >= s.vcpu && z.ramGb >= s.ramGb && (best == null || c < best)) best = c;
  }
  if (best == null) return { cost: 0, label: "No size fits" };
  // MATCH(cost, column, 0): first row in sheet order with that exact cost.
  const z = p.sizes.find((r) => sizeCost(s.os === "Windows" ? r.windowsUsdHour : r.linuxUsdHour, p, fx) === best)!;
  return { cost: best, label: `${z.name} (${z.vcpu} vCPU / ${z.ramGb} GB)` };
}

function line(
  partial: Omit<ComparisonLine, "uniMonthly" | "utlMonthly" | "uniLfl" | "utlLfl" | "chosenUnit" | "clientUnit" | "clientMonthly" | "lineNo" | "assumed"> & {
    assumed?: string | null;
  },
): ComparisonLine {
  const q = partial.qty;
  const monthly = (u: Money): Money | null => (q === 0 ? null : isNum(u) ? q * u : TBQ);
  const uniMonthly = monthly(partial.uniUnit);
  const utlMonthly = monthly(partial.utlUnit);
  const both = q > 0 && isNum(uniMonthly) && isNum(utlMonthly);
  return {
    ...partial,
    uniMonthly,
    utlMonthly,
    uniLfl: both ? (uniMonthly as number) : 0,
    utlLfl: both ? (utlMonthly as number) : 0,
    chosenUnit: TBQ,
    clientUnit: TBQ,
    clientMonthly: null,
    lineNo: null,
    assumed: partial.assumed ?? null,
  };
}

const orTbq = (v: number | null): Money => (v == null ? TBQ : v);

export function priceQuote(inputs: EngineInputs, pricing: PricingData, fx: number, clientNote = DEFAULT_CLIENT_NOTE): EngineResult {
  const s = pricing.settings;
  const r = rates(pricing, fx);
  const U_VCPU = r.uni("vcpu");
  const U_RAM = r.uni("ram");
  const U_SSD = r.uni("ssd");
  const U_HDD = r.uni("hdd");
  const T_SSD = r.utl("ssd");
  const T_HDD = r.utl("hdd");
  const assumed = inputs.assumed ?? {};

  // Quote Builder rows (blank role or qty 0 rows are ignored, as in the sheet).
  const servers = inputs.servers.filter((x) => x.role.trim() !== "" && x.qty > 0);
  const rows = servers.map((x) => {
    const uni = U_VCPU == null || U_RAM == null ? null : x.vcpu * U_VCPU + x.ramGb * U_RAM; // K
    const utl = matchUnitellasSize(x, pricing, fx); // M, L
    const replicated = x.replication === "Active-passive" || x.replication === "Active-active" ? 1 : 0; // N
    return { x, uni, utl, replicated };
  });

  const lines: ComparisonLine[] = [];

  // Compute (Comparison rows 15-29)
  for (const { x, uni, utl } of rows) {
    lines.push(
      line({
        key: "compute",
        category: "Compute",
        description: `${x.role}: ${x.vcpu} vCPU, ${x.ramGb} GB RAM, ${x.os}`,
        qty: x.qty,
        unit: "server / month",
        uniUnit: orTbq(uni),
        utlUnit: utl.cost > 0 ? utl.cost : TBQ,
        notes: utl.cost > 0 ? `Unitellas size: ${utl.label}` : "No Unitellas size is large enough",
        assumed: x.assumed && x.assumed.length ? x.assumed.join("; ") : null,
      }),
    );
  }

  const sumQty = (f: (x: ServerInput) => number) => servers.reduce((a, x) => a + x.qty * f(x), 0);
  const ssdQty = sumQty((x) => x.ssdGb);
  const hddQty = sumQty((x) => x.hddGb);
  const storageAssumed = assumed.storage ?? null;

  // Storage (rows 30-32)
  lines.push(
    line({
      key: "ssd",
      category: "Storage",
      description: "NVMe / SSD block storage",
      qty: ssdQty,
      unit: "GB / month",
      uniUnit: orTbq(U_SSD),
      utlUnit: T_SSD == null ? TBQ : T_SSD / s.gbPerTb,
      notes: "",
      assumed: storageAssumed,
    }),
  );
  lines.push(
    line({
      key: "hdd",
      category: "Storage",
      description: "HDD block storage",
      qty: hddQty,
      unit: "GB / month",
      uniUnit: U_HDD == null ? orTbq(U_SSD) : U_HDD,
      utlUnit: T_HDD == null ? TBQ : T_HDD / s.gbPerTb,
      notes: U_HDD == null ? "UniCloud has no HDD tier: priced at SSD rate" : "",
      assumed: storageAssumed,
    }),
  );
  const T_OBJ = r.utl("object");
  lines.push(
    line({
      key: "object",
      category: "Storage",
      description: "S3-compatible object storage",
      qty: inputs.objectGb,
      unit: "GB / month",
      uniUnit: orTbq(r.uni("object")),
      utlUnit: T_OBJ == null ? TBQ : T_OBJ / s.gbPerTb,
      notes: "",
      assumed: assumed.object ?? null,
    }),
  );

  // Licences (row 33)
  lines.push(
    line({
      key: "windows_licence",
      category: "Licences",
      description: "Windows Server licence",
      qty: servers.filter((x) => x.os === "Windows").reduce((a, x) => a + x.qty, 0),
      unit: "server / month",
      uniUnit: orTbq(r.uni("windows_licence")),
      utlUnit: 0,
      notes: "Unitellas: included in Windows sizes. UniCloud quotes OS licences separately.",
    }),
  );

  // Network and security (rows 34-39)
  lines.push(
    line({
      key: "public_ip",
      category: "Network",
      description: "Static public IPv4",
      qty: inputs.publicIps,
      unit: "IP / month",
      uniUnit: orTbq(r.uni("public_ip")),
      utlUnit: orTbq(r.utl("public_ip")),
      notes: "",
      assumed: assumed.public_ip ?? null,
    }),
  );
  const U_INET = r.uni("internet");
  const wanCosts = pricing.wan
    .filter((w) => w.mbps >= inputs.mbps)
    .map((w) => w.listUsdMonth * fx * (1 - s.unitellasDiscount));
  const wanMin = wanCosts.length ? Math.min(...wanCosts) : 0;
  lines.push(
    line({
      key: "internet",
      category: "Network",
      description: `Internet access, ${inputs.mbps} Mbps`,
      qty: inputs.sites,
      unit: "site / month",
      uniUnit: U_INET == null || inputs.mbps > s.unicloudInternetCapMbps ? TBQ : U_INET,
      utlUnit: wanMin === 0 ? TBQ : wanMin,
      notes:
        (inputs.mbps > s.unicloudInternetCapMbps
          ? `UniCloud internet bursts to ${s.unicloudInternetCapMbps} Mbps only. `
          : "") + `Unitellas: smallest WAN tier at or above ${inputs.mbps} Mbps.`,
      assumed: assumed.internet ?? null,
    }),
  );
  const simple: [string, string, string, number, string][] = [
    ["vpn", "Security", "VPN appliance", inputs.vpn, "appliance / month"],
    ["firewall", "Security", "Firewall (pfSense)", inputs.firewalls, "instance / month"],
    ["load_balancer", "Network", "Load balancer", inputs.loadBalancers, "appliance / month"],
    ["monitoring", "Monitoring", "Infrastructure monitoring", inputs.monitoring, "service / month"],
  ];
  for (const [key, category, description, qty, unit] of simple) {
    lines.push(
      line({ key, category, description, qty, unit, uniUnit: orTbq(r.uni(key)), utlUnit: orTbq(r.utl(key)), notes: "", assumed: assumed[key] ?? null }),
    );
  }

  // Protection (rows 40-42)
  const protection: [string, string, number][] = [
    ["backup", "Managed VM backup", servers.filter((x) => x.backup).reduce((a, x) => a + x.qty, 0)],
    ["replication_ap", "Active-passive VM replication", servers.filter((x) => x.replication === "Active-passive").reduce((a, x) => a + x.qty, 0)],
    ["replication_aa", "Active-active VM replication", servers.filter((x) => x.replication === "Active-active").reduce((a, x) => a + x.qty, 0)],
  ];
  const protAssumed = servers.filter((x) => (x.assumed ?? []).some((a) => /backup|replication/i.test(a)));
  for (const [key, description, qty] of protection) {
    lines.push(
      line({
        key,
        category: "Protection",
        description,
        qty,
        unit: "protected VM / month",
        uniUnit: orTbq(r.uni(key)),
        utlUnit: orTbq(r.utl(key)),
        notes: "UniCloud: annual licence billed monthly.",
        assumed: assumed[key] ?? (protAssumed.length && qty > 0 ? "Protection level assumed where it was not given" : null),
      }),
    );
  }

  // Secondary site (rows 43-44)
  const replicatedCount = rows.reduce((a, w) => a + w.replicated * w.x.qty, 0);
  const anyUniNull = rows.some((w) => w.replicated && w.uni == null);
  lines.push(
    line({
      key: "standby_compute",
      category: "Secondary site",
      description: `Standby compute for ${replicatedCount} replicated server(s)`,
      qty: inputs.standby && replicatedCount > 0 ? 1 : 0,
      unit: "standby set / month",
      uniUnit: anyUniNull ? TBQ : rows.reduce((a, w) => a + w.replicated * w.x.qty * (w.uni ?? 0), 0),
      utlUnit: rows.reduce((a, w) => a + w.replicated * w.x.qty * w.utl.cost, 0),
      notes: "Same sizes as the replicated primary servers.",
      assumed: assumed.standby ?? null,
    }),
  );
  lines.push(
    line({
      key: "standby_storage",
      category: "Secondary site",
      description: "Standby block storage",
      qty: inputs.standby ? rows.reduce((a, w) => a + w.replicated * w.x.qty * (w.x.ssdGb + w.x.hddGb), 0) : 0,
      unit: "GB / month",
      uniUnit: orTbq(U_SSD),
      utlUnit: T_SSD == null ? TBQ : T_SSD / s.gbPerTb,
      notes: "Priced at SSD rate.",
      assumed: assumed.standby ?? null,
    }),
  );

  // Comparison summary (rows 5-12)
  const sum = (f: (l: ComparisonLine) => Money | number | null) =>
    lines.reduce((a, l) => {
      const v = f(l);
      return a + (isNum(v as Money) ? (v as number) : 0);
    }, 0);
  const uniMonthly = sum((l) => l.uniMonthly);
  const utlMonthly = sum((l) => l.utlMonthly);
  const UG = lines.filter((l) => l.qty > 0 && l.uniMonthly === TBQ).length;
  const TG = lines.filter((l) => l.qty > 0 && l.utlMonthly === TBQ).length;
  const UL = sum((l) => l.uniLfl);
  const TL = sum((l) => l.utlLfl);

  let recommended: Partner;
  if (UG === 0 && TG > 0) recommended = "UniCloud";
  else if (TG === 0 && UG > 0) recommended = "Unitellas";
  else if (UG > 0 && TG > 0 && Math.abs(UG - TG) >= 2) recommended = UG < TG ? "UniCloud" : "Unitellas";
  else recommended = UL <= TL ? "UniCloud" : "Unitellas";

  let recommendationReason: string;
  if (UG === 0 && TG > 0) recommendationReason = `UniCloud covers every requirement; Unitellas is missing ${TG} item(s).`;
  else if (TG === 0 && UG > 0) recommendationReason = `Unitellas covers every requirement; UniCloud is missing ${UG} item(s).`;
  else if (UG > 0 && TG > 0 && Math.abs(UG - TG) >= 2)
    recommendationReason = `${recommended} covers more of the requirement (${Math.min(UG, TG)} gap(s) against ${Math.max(UG, TG)}).`;
  else recommendationReason = `Both partners cover the same items; ${recommended} is cheaper like for like.`;

  const lflNote =
    Math.max(UL, TL) === 0
      ? ""
      : `${UL <= TL ? "UniCloud" : "Unitellas"} is ₦${ngn2(Math.abs(UL - TL))} a month cheaper like for like (${pct1(Math.abs(UL - TL) / Math.max(UL, TL))}).`;

  const chosen: Partner = inputs.partner === "Recommended" ? recommended : inputs.partner;

  // Client pricing (Comparison L, M, N, O)
  let n = 0;
  for (const l of lines) {
    l.chosenUnit = chosen === "UniCloud" ? l.uniUnit : l.utlUnit;
    l.clientUnit = isNum(l.chosenUnit) ? round2(l.chosenUnit * (1 + inputs.margin)) : TBQ;
    l.lineNo = l.qty > 0 ? ++n : null;
    l.clientMonthly = l.qty === 0 ? null : isNum(l.clientUnit) ? l.clientUnit * l.qty : TBQ;
  }

  // Client Quote
  const used = lines.filter((l) => l.lineNo != null);
  const clientLines = used.map((l) => ({
    n: l.lineNo!,
    key: l.key,
    description: l.description,
    qty: l.qty,
    unit: l.unit,
    unitPrice: isNum(l.clientUnit) ? l.clientUnit : null,
    monthly: isNum(l.clientMonthly) ? round2(l.clientMonthly) : null,
    toBeQuoted: !isNum(l.clientMonthly),
    assumed: l.assumed,
  }));
  const subtotalRaw = used.reduce((a, l) => a + (isNum(l.clientMonthly) ? l.clientMonthly : 0), 0); // F45
  const vatRaw = subtotalRaw * s.vat; // F46
  const totalRaw = subtotalRaw + vatRaw; // F47
  const term = inputs.termMonths;
  const termRaw = term > 1 ? totalRaw * term : null; // F48
  const monthlyTotal = round2(totalRaw);
  const termTotal = termRaw == null ? null : round2(termRaw);
  const amountDueNow =
    s.amountDueMode === "term"
      ? termTotal ?? monthlyTotal
      : s.amountDueMode === "deposit_pct"
        ? round2((termRaw ?? totalRaw) * s.depositPct)
        : monthlyTotal;

  const tbqCount = clientLines.filter((l) => l.toBeQuoted).length;
  const protectionQty = lines.filter((l) => l.category === "Protection").reduce((a, l) => a + l.qty, 0);
  const notes = [
    `All prices exclude ${pct1(s.vat)} VAT unless shown above.`,
    ...(tbqCount > 0 ? [`${tbqCount} item(s) marked To be quoted will be priced separately.`] : []),
    ...(chosen === "UniCloud" && protectionQty > 0 ? ["Backup and replication services are annual licences billed monthly."] : []),
    clientNote,
  ];

  const partnerCostChosen = chosen === "UniCloud" ? uniMonthly : utlMonthly;
  const marginNgn = subtotalRaw - partnerCostChosen;

  return {
    fx,
    comparison: {
      lines,
      uniMonthly: round2(uniMonthly),
      utlMonthly: round2(utlMonthly),
      uniGaps: UG,
      utlGaps: TG,
      uniLfl: round2(UL),
      utlLfl: round2(TL),
      recommended,
      recommendationReason,
      lflNote,
      chosen,
      partnerCostChosen: round2(partnerCostChosen),
      marginNgn: round2(marginNgn),
      marginPctOfPrice: subtotalRaw === 0 ? 0 : marginNgn / subtotalRaw,
    },
    quote: {
      lines: clientLines,
      subtotal: round2(subtotalRaw),
      vatRate: s.vat,
      vat: round2(vatRaw),
      monthlyTotal,
      termMonths: term,
      termTotal,
      amountDueMode: s.amountDueMode,
      amountDueNow,
      tbqCount,
      notes,
    },
  };
}
