import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshFx } from "@/lib/pricing/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** Daily USD->NGN refresh (Vercel cron sends "Authorization: Bearer $CRON_SECRET"). */
export async function GET(req: Request) {
  if (!authorised(req)) return NextResponse.json({ ok: false, message: "Unauthorised" }, { status: 401 });
  const row = await refreshFx("cron");
  if (!row) return NextResponse.json({ ok: false, message: "FX fetch failed; last good rate stays in use." }, { status: 502 });
  return NextResponse.json({ ok: true, rate: row.rate, fetchedAt: row.fetched_at, source: row.source });
}
