import { back, guard } from "@/lib/admin/http";
import { refreshFx } from "@/lib/pricing/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fetch the live USD->NGN rate now. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const row = await refreshFx("admin");
  return back(req, "/admin/pricing", row ? { ok: `Fetched ₦${row.rate} per $1.` } : { err: "FX fetch failed; the last good rate stays in use." });
}
