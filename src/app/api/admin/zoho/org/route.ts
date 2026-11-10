import { back, guard, str } from "@/lib/admin/http";
import { envLabel, getConnection, pinnedOrgId, saveConnection } from "@/lib/zoho/client";

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
  const pin = pinnedOrgId();
  if (!pin) return back(req, "/admin/zoho", { err: `Set ZOHO_ORG_ID for ${envLabel()} in Vercel first, then redeploy.` });
  if (org_id !== pin) return back(req, "/admin/zoho", { err: `This ${envLabel()} deployment may only use organisation ${pin}.` });
  if (!(await getConnection())) return back(req, "/admin/zoho", { err: "Connect Zoho Books first." });
  try {
    await saveConnection({ org_id, org_name: org_name || org_id });
  } catch (e) {
    return back(req, "/admin/zoho", { err: e instanceof Error ? e.message : "Could not save organisation." });
  }
  return back(req, "/admin/zoho", { ok: `Organisation set to ${org_name || org_id}.` });
}
