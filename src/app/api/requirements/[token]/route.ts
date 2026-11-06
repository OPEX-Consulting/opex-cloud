import { loadPortal } from "@/lib/requirements/server";
import { checkToken, json } from "@/lib/requirements/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Load a client's project (public fields only), saved answers and servers by token. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!checkToken(token)) return json({ success: false, message: "This link is not recognised." }, 404);
  try {
    const payload = await loadPortal(token);
    if (!payload) return json({ success: false, message: "This link is not recognised." }, 404);
    return json({ success: true, ...payload });
  } catch (error) {
    console.error("[requirements] load failed", error);
    return json({ success: false, message: "We couldn't load your requirements just now." }, 500);
  }
}
