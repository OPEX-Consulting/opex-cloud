/* Generated from the retired Google Sheet "OPEX_Cloud_Quote_Builder" (Rate Cards + Unitellas Sizes tabs, 6 Nov 2026).
 * These are the SEED values only: the live values are in Supabase (rate_cards, unitellas_sizes, unitellas_wan,
 * pricing_settings) and are edited at /admin. Used by unit tests, demo mode and as a fallback. */
import type { PricingData, PricingSettings, RateCard, UnitellasSize, UnitellasWan } from "./types";

export const DEFAULT_SETTINGS: PricingSettings = {
  vat: 0.075,
  unicloudDiscount: 0.1,
  unitellasDiscount: 0.45,
  hoursPerMonth: 730,
  gbPerTb: 1000,
  unicloudInternetCapMbps: 100,
  defaultMargin: 0.2,
  quoteValidityDays: 30,
  defaultTermMonths: 12,
  fxMode: "live_buffer",
  fxBufferPct: 0.03,
  fxFixedRate: 1400,
  showPartner: false,
  partnerChoice: "Recommended",
  amountDueMode: "first_month",
  depositPct: 0.5,
};

export const DEFAULT_RATE_CARDS: RateCard[] = [
  { key: "vcpu", service: "vCPU", unicloudUnit: "per vCPU / month", unicloudListNgn: 4700, unitellasUnit: "n/a: priced through server sizes", unitellasListUsd: null },
  { key: "ram", service: "RAM", unicloudUnit: "per GB / month", unicloudListNgn: 4850, unitellasUnit: "n/a: priced through server sizes", unitellasListUsd: null },
  { key: "ssd", service: "NVMe / SSD block storage", unicloudUnit: "per GB / month", unicloudListNgn: 200, unitellasUnit: "per TB / month", unitellasListUsd: 160 },
  { key: "hdd", service: "HDD block storage", unicloudUnit: "per GB / month (blank = SSD rate)", unicloudListNgn: null, unitellasUnit: "per TB / month", unitellasListUsd: 80 },
  { key: "object", service: "S3-compatible object storage", unicloudUnit: "per GB / month", unicloudListNgn: 100, unitellasUnit: "per TB / month", unitellasListUsd: 40 },
  { key: "windows_licence", service: "Windows Server licence", unicloudUnit: "per Windows server / month (blank = quoted separately)", unicloudListNgn: null, unitellasUnit: "n/a: included in Windows sizes", unitellasListUsd: null },
  { key: "public_ip", service: "Static public IPv4", unicloudUnit: "per IP / month", unicloudListNgn: 2500, unitellasUnit: "per IP / month", unitellasListUsd: null },
  { key: "internet", service: "Internet access", unicloudUnit: "per site / month, burstable to 100 Mbps, unmetered", unicloudListNgn: 20000, unitellasUnit: "n/a: see WAN tiers", unitellasListUsd: null },
  { key: "vpn", service: "VPN appliance (2 vCPU, 4 GB)", unicloudUnit: "per appliance / month", unicloudListNgn: 25100, unitellasUnit: "per appliance / month", unitellasListUsd: null },
  { key: "firewall", service: "pfSense firewall", unicloudUnit: "per instance / month", unicloudListNgn: 25515, unitellasUnit: "per instance / month", unitellasListUsd: null },
  { key: "load_balancer", service: "Load balancer (2 vCPU, 4 GB)", unicloudUnit: "per appliance / month", unicloudListNgn: 28800, unitellasUnit: "per appliance / month", unitellasListUsd: null },
  { key: "monitoring", service: "Monitoring", unicloudUnit: "per agreed service / month", unicloudListNgn: 12000, unitellasUnit: "per service / month", unitellasListUsd: null },
  { key: "backup", service: "Managed VM backup", unicloudUnit: "per protected VM / month", unicloudListNgn: 41666.67, unitellasUnit: "per protected VM / month", unitellasListUsd: null },
  { key: "replication_ap", service: "Active-passive replication", unicloudUnit: "per protected VM / month", unicloudListNgn: 91439.91, unitellasUnit: "per protected VM / month", unitellasListUsd: null },
  { key: "replication_aa", service: "Active-active replication", unicloudUnit: "per protected VM / month", unicloudListNgn: 274319.74, unitellasUnit: "per protected VM / month", unitellasListUsd: null },
];

export const DEFAULT_SIZES: UnitellasSize[] = [
  { vcpu: 1, ramGb: 4, name: "Z4 Medium", linuxUsdHour: 0.05, windowsUsdHour: 0.14 },
  { vcpu: 2, ramGb: 8, name: "Z4 Large", linuxUsdHour: 0.1, windowsUsdHour: 0.28 },
  { vcpu: 4, ramGb: 16, name: "Z4 Xlarge", linuxUsdHour: 0.2, windowsUsdHour: 0.56 },
  { vcpu: 6, ramGb: 24, name: "Z4 3large", linuxUsdHour: 0.3, windowsUsdHour: 0.84 },
  { vcpu: 8, ramGb: 16, name: "z4.2xlarge", linuxUsdHour: 0.34, windowsUsdHour: 1.06 },
  { vcpu: 8, ramGb: 32, name: "Z4 2xlarge", linuxUsdHour: 0.4, windowsUsdHour: 1.12 },
  { vcpu: 10, ramGb: 40, name: "Z4 5large", linuxUsdHour: 0.5, windowsUsdHour: 1.4 },
  { vcpu: 12, ramGb: 48, name: "Z4 3xlarge", linuxUsdHour: 0.6, windowsUsdHour: 1.68 },
  { vcpu: 14, ramGb: 56, name: "Z4 7large", linuxUsdHour: 0.7, windowsUsdHour: 1.96 },
  { vcpu: 16, ramGb: 64, name: "Z4 4xlarge", linuxUsdHour: 0.8, windowsUsdHour: 2.24 },
  { vcpu: 18, ramGb: 72, name: "Z4 9large", linuxUsdHour: 0.9, windowsUsdHour: 2.52 },
  { vcpu: 20, ramGb: 80, name: "Z4 5xlarge", linuxUsdHour: 1, windowsUsdHour: 2.8 },
  { vcpu: 22, ramGb: 88, name: "Z4 11large", linuxUsdHour: 1.1, windowsUsdHour: 3.08 },
  { vcpu: 24, ramGb: 96, name: "Z4 6xlarge", linuxUsdHour: 1.2, windowsUsdHour: 3.36 },
  { vcpu: 26, ramGb: 104, name: "Z4 13large", linuxUsdHour: 1.3, windowsUsdHour: 3.64 },
  { vcpu: 28, ramGb: 112, name: "Z4 7xlarge", linuxUsdHour: 1.4, windowsUsdHour: 3.92 },
  { vcpu: 30, ramGb: 120, name: "Z4 15large", linuxUsdHour: 1.5, windowsUsdHour: 4.2 },
  { vcpu: 34, ramGb: 136, name: "Z4 17large", linuxUsdHour: 1.7, windowsUsdHour: 4.76 },
  { vcpu: 36, ramGb: 144, name: "Z4 9xlarge", linuxUsdHour: 1.8, windowsUsdHour: 5.04 },
  { vcpu: 38, ramGb: 152, name: "Z4 19large", linuxUsdHour: 1.9, windowsUsdHour: 5.32 },
  { vcpu: 40, ramGb: 160, name: "Z4 10xlarge", linuxUsdHour: 2, windowsUsdHour: 5.6 },
  { vcpu: 42, ramGb: 168, name: "Z4 21large", linuxUsdHour: 2.1, windowsUsdHour: 5.88 },
  { vcpu: 44, ramGb: 176, name: "Z4 11xlarge", linuxUsdHour: 2.2, windowsUsdHour: 6.16 },
  { vcpu: 46, ramGb: 184, name: "Z4 23large", linuxUsdHour: 2.3, windowsUsdHour: 6.44 },
  { vcpu: 48, ramGb: 192, name: "Z4 12xlarge", linuxUsdHour: 2.4, windowsUsdHour: 6.72 },
];

export const DEFAULT_WAN: UnitellasWan[] = [
  { mbps: 100, listUsdMonth: 200 },
  { mbps: 200, listUsdMonth: 400 },
  { mbps: 1000, listUsdMonth: 1500 },
  { mbps: 10000, listUsdMonth: 10000 },
];

export const DEFAULT_PRICING: PricingData = {
  settings: DEFAULT_SETTINGS,
  rateCards: DEFAULT_RATE_CARDS,
  sizes: DEFAULT_SIZES,
  wan: DEFAULT_WAN,
};
