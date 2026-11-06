// Server-only: load pricing data from Supabase (falls back to the sheet defaults when Supabase is not configured).
import { db, must, supabaseConfigured } from "../server/db";
import { DEFAULT_PRICING, DEFAULT_SETTINGS } from "./defaults";
import type { PricingData, PricingSettings, RateCard, UnitellasSize, UnitellasWan } from "./types";

/** DB key (snake_case) -> settings field. */
export const SETTING_KEYS: Record<string, keyof PricingSettings> = {
  vat: "vat",
  unicloud_discount: "unicloudDiscount",
  unitellas_discount: "unitellasDiscount",
  hours_per_month: "hoursPerMonth",
  gb_per_tb: "gbPerTb",
  unicloud_internet_cap_mbps: "unicloudInternetCapMbps",
  default_margin: "defaultMargin",
  quote_validity_days: "quoteValidityDays",
  default_term_months: "defaultTermMonths",
  fx_mode: "fxMode",
  fx_buffer_pct: "fxBufferPct",
  fx_fixed_rate: "fxFixedRate",
  show_partner: "showPartner",
  partner_choice: "partnerChoice",
  amount_due_mode: "amountDueMode",
  deposit_pct: "depositPct",
};

export type SettingRow = { key: string; value: unknown; label: string; note: string | null; sort: number; updated_at: string };

const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

export async function loadSettingRows(): Promise<SettingRow[]> {
  return must(await db().from("pricing_settings").select("*").order("sort"), "pricing_settings") as SettingRow[];
}

export function settingsFromRows(rows: SettingRow[]): PricingSettings {
  const s: PricingSettings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    const k = SETTING_KEYS[r.key];
    if (!k) continue;
    (s as Record<string, unknown>)[k] = r.value;
  }
  return s;
}

export async function loadPricing(): Promise<PricingData> {
  if (!supabaseConfigured()) return DEFAULT_PRICING;
  const [rows, cards, sizes, wan] = await Promise.all([
    loadSettingRows(),
    db().from("rate_cards").select("*").order("sort"),
    db().from("unitellas_sizes").select("*").order("sort"),
    db().from("unitellas_wan").select("*").order("mbps"),
  ]);
  return {
    settings: settingsFromRows(rows),
    rateCards: (must(cards, "rate_cards") as Record<string, unknown>[]).map(
      (c): RateCard => ({
        key: String(c.key),
        service: String(c.service),
        unicloudUnit: String(c.unicloud_unit ?? ""),
        unicloudListNgn: num(c.unicloud_list_ngn),
        unitellasUnit: String(c.unitellas_unit ?? ""),
        unitellasListUsd: num(c.unitellas_list_usd),
      }),
    ),
    sizes: (must(sizes, "unitellas_sizes") as Record<string, unknown>[]).map(
      (z): UnitellasSize => ({
        vcpu: Number(z.vcpu),
        ramGb: Number(z.ram_gb),
        name: String(z.size_name),
        linuxUsdHour: num(z.linux_usd_hour),
        windowsUsdHour: num(z.windows_usd_hour),
      }),
    ),
    wan: (must(wan, "unitellas_wan") as Record<string, unknown>[]).map(
      (w): UnitellasWan => ({ mbps: Number(w.mbps), listUsdMonth: Number(w.list_usd_month) }),
    ),
  };
}
