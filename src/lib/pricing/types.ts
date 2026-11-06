/* Pricing types shared by the engine, the admin and the invoice code. Pure types: safe for client and server. */

export type FxMode = "live" | "live_buffer" | "fixed";
export type PartnerChoice = "Recommended" | "UniCloud" | "Unitellas";
export type Partner = "UniCloud" | "Unitellas";
export type AmountDueMode = "first_month" | "term" | "deposit_pct";
export type Replication = "None" | "Active-passive" | "Active-active";

export type PricingSettings = {
  vat: number; // 0.075
  unicloudDiscount: number; // 0.10
  unitellasDiscount: number; // 0.45
  hoursPerMonth: number; // 730
  gbPerTb: number; // 1000
  unicloudInternetCapMbps: number; // 100
  defaultMargin: number; // 0.20
  quoteValidityDays: number; // 30
  defaultTermMonths: number; // 12
  fxMode: FxMode;
  fxBufferPct: number; // 0.03 = 3 %
  fxFixedRate: number; // ₦ per $1
  showPartner: boolean;
  partnerChoice: PartnerChoice;
  amountDueMode: AmountDueMode;
  depositPct: number; // used when amountDueMode = deposit_pct (0.5 = 50 %)
};

export type RateCardKey =
  | "vcpu"
  | "ram"
  | "ssd"
  | "hdd"
  | "object"
  | "windows_licence"
  | "public_ip"
  | "internet"
  | "vpn"
  | "firewall"
  | "load_balancer"
  | "monitoring"
  | "backup"
  | "replication_ap"
  | "replication_aa";

export type RateCard = {
  key: RateCardKey | string;
  service: string;
  unicloudUnit: string;
  unicloudListNgn: number | null; // null = not offered
  unitellasUnit: string;
  unitellasListUsd: number | null; // null = not offered
};

export type UnitellasSize = {
  vcpu: number;
  ramGb: number;
  name: string;
  linuxUsdHour: number | null;
  windowsUsdHour: number | null;
};

export type UnitellasWan = { mbps: number; listUsdMonth: number };

export type PricingData = {
  settings: PricingSettings;
  rateCards: RateCard[];
  sizes: UnitellasSize[];
  wan: UnitellasWan[];
};

/** One server row as in the sheet's "Quote Builder" servers table. */
export type ServerInput = {
  role: string;
  os: "Linux" | "Windows";
  qty: number;
  vcpu: number;
  ramGb: number;
  ssdGb: number;
  hddGb: number;
  backup: boolean;
  replication: Replication;
  /** Why some of this row's values were assumed (e.g. "vCPU not given"). Empty = all answered. */
  assumed?: string[];
};

/** Everything the Quote Builder tab takes as input. */
export type EngineInputs = {
  servers: ServerInput[];
  objectGb: number;
  publicIps: number;
  sites: number;
  mbps: number;
  vpn: number;
  firewalls: number;
  loadBalancers: number;
  monitoring: number;
  standby: boolean;
  margin: number;
  partner: PartnerChoice;
  termMonths: number;
  /** Line keys priced on an assumed value, with the reason shown to the client. */
  assumed?: Partial<Record<string, string>>;
};

export const TBQ = "To be quoted" as const;
export type Money = number | typeof TBQ;

export type ComparisonLine = {
  key: string;
  category: string;
  description: string;
  qty: number;
  unit: string;
  uniUnit: Money;
  uniMonthly: Money | null; // null = qty 0 (line not used)
  utlUnit: Money;
  utlMonthly: Money | null;
  notes: string;
  uniLfl: number;
  utlLfl: number;
  chosenUnit: Money;
  clientUnit: Money;
  clientMonthly: Money | null;
  lineNo: number | null;
  assumed: string | null;
};

export type ClientLine = {
  n: number;
  key: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number | null; // null = To be quoted
  monthly: number | null; // null = To be quoted
  toBeQuoted: boolean;
  assumed: string | null;
};

export type Quote = {
  lines: ClientLine[];
  subtotal: number;
  vatRate: number;
  vat: number;
  monthlyTotal: number;
  termMonths: number;
  termTotal: number | null; // null when term <= 1
  amountDueMode: AmountDueMode;
  amountDueNow: number;
  tbqCount: number;
  notes: string[];
};

export type EngineResult = {
  fx: number;
  comparison: {
    lines: ComparisonLine[];
    uniMonthly: number;
    utlMonthly: number;
    uniGaps: number;
    utlGaps: number;
    uniLfl: number;
    utlLfl: number;
    recommended: Partner;
    recommendationReason: string;
    lflNote: string;
    chosen: Partner;
    partnerCostChosen: number;
    marginNgn: number;
    marginPctOfPrice: number;
  };
  quote: Quote;
};
