// Server-only: USD -> NGN exchange rate. Daily cron + on-demand refresh when the latest rate is older than 26 h.
// Fallbacks: last good rate, then the fixed rate from pricing_settings.
import { db, supabaseConfigured } from "../server/db";
import type { PricingSettings } from "./types";

export const FX_URL = "https://open.er-api.com/v6/latest/USD";
export const FX_SOURCE = "open.er-api.com";
const MAX_AGE_MS = 26 * 60 * 60 * 1000;

export type FxRow = { rate: number; source: string; fetched_at: string; source_time: string | null };
export type EffectiveFx = {
  rate: number; // effective ₦ per $1 used for pricing
  source: string; // human-readable description, stored on the invoice
  mode: PricingSettings["fxMode"];
  live: FxRow | null;
};

export async function latestGoodRate(): Promise<FxRow | null> {
  const { data, error } = await db()
    .from("fx_rates")
    .select("rate, source, fetched_at, source_time")
    .eq("ok", true)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`fx_rates lookup failed: ${error.message}`);
  return data ? { ...(data as FxRow), rate: Number((data as FxRow).rate) } : null;
}

/** Fetch the live rate and record the attempt (ok or failed). Returns the stored row or null on failure. */
export async function refreshFx(trigger: "cron" | "on_demand" | "admin"): Promise<FxRow | null> {
  const source = `${FX_SOURCE} (${trigger})`;
  try {
    const res = await fetch(FX_URL, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number };
    const rate = body.rates?.NGN;
    if (body.result !== "success" || typeof rate !== "number" || !(rate > 100 && rate < 100000)) {
      throw new Error(`unexpected response (result=${body.result}, NGN=${rate})`);
    }
    const row = {
      rate,
      source,
      ok: true,
      source_time: body.time_last_update_unix ? new Date(body.time_last_update_unix * 1000).toISOString() : null,
    };
    const { data, error } = await db().from("fx_rates").insert(row).select("rate, source, fetched_at, source_time").single();
    if (error) throw new Error(`fx_rates insert failed: ${error.message}`);
    return { ...(data as FxRow), rate: Number((data as FxRow).rate) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[fx] refresh failed", message);
    await db().from("fx_rates").insert({ rate: null, source, ok: false, error: message.slice(0, 500) });
    return null;
  }
}

const fmtRate = (n: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 4 }).format(n);

/** Effective rate for pricing, per the settings' fx_mode. */
export async function effectiveFx(s: PricingSettings): Promise<EffectiveFx> {
  const fixed = (why: string): EffectiveFx => ({
    rate: s.fxFixedRate,
    source: `fixed ₦${fmtRate(s.fxFixedRate)}/$ (${why})`,
    mode: s.fxMode,
    live: null,
  });
  if (!supabaseConfigured()) return fixed("demo");
  if (s.fxMode === "fixed") return fixed("fixed mode");

  let live = await latestGoodRate();
  if (!live || Date.now() - new Date(live.fetched_at).getTime() > MAX_AGE_MS) {
    const fresh = await refreshFx("on_demand");
    if (fresh) live = fresh;
  }
  if (!live) return fixed("no live rate available");
  const day = live.fetched_at.slice(0, 10);
  if (s.fxMode === "live") {
    return { rate: live.rate, source: `${FX_SOURCE} ₦${fmtRate(live.rate)}/$ fetched ${day} (live)`, mode: s.fxMode, live };
  }
  const rate = Math.round(live.rate * (1 + s.fxBufferPct) * 100) / 100;
  return {
    rate,
    source: `${FX_SOURCE} ₦${fmtRate(live.rate)}/$ fetched ${day} + ${Math.round(s.fxBufferPct * 10000) / 100}% buffer`,
    mode: s.fxMode,
    live,
  };
}
