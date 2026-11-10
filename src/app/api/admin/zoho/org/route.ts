import { back, guard, str } from "@/lib/admin/http";
import { getConnection, saveConnection } from "@/lib/zoho/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Save the Zoho Books organisation invoices are created in. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const form = await req.formData();
  const org_id = str(form.get("org_id"));
  const org_name = str(form.get("org_name"));
  if (!org_id) return back(req, "/admin/zoho", { err: "Choose an organisation." });
  if (!(await getConnection())) return back(req, "/admin/zoho", { err: "Connect Zoho Books first." });
  try {
    await saveConnection({ org_id, org_name: org_name || org_id });
  } catch (e) {
    return back(req, "/admin/zoho", { err: e instanceof Error ? e.message : "Could not save organisation." });
  }
  return back(req, "/admin/zoho", { ok: `Organisation set to ${org_name || org_id}.` });
}
