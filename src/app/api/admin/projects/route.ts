import { randomBytes } from "node:crypto";
import { back, guard, numOrNull, str } from "@/lib/admin/http";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create a client link (replaces the SQL step). */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const f = await req.formData();
  const customer = str(f.get("customer_name"));
  if (!customer) return back(req, "/admin/projects", { err: "Customer name is required." });
  const days = numOrNull(f.get("expires_days")) ?? 30;
  if (!Number.isFinite(days) || days < 1 || days > 365) return back(req, "/admin/projects", { err: "Expiry must be 1 to 365 days." });
  const token = randomBytes(24).toString("hex");
  const { data, error } = await db()
    .from("projects")
    .insert({
      token,
      customer_name: customer,
      project_name: str(f.get("project_name")) || null,
      customer_address: str(f.get("customer_address")) || null,
      opex_sales_contact_name: str(f.get("opex_sales_contact_name")) || null,
      opex_sales_contact_email: str(f.get("opex_sales_contact_email")) || null,
      opex_sales_contact_phone: str(f.get("opex_sales_contact_phone")) || null,
      project_manager: str(f.get("project_manager")) || null,
      lead_engineer: str(f.get("lead_engineer")) || null,
      deployment_engineer: str(f.get("deployment_engineer")) || null,
      expires_at: new Date(Date.now() + days * 86400_000).toISOString(),
    })
    .select("id")
    .single();
  if (error) return back(req, "/admin/projects", { err: error.message });
  return back(req, `/admin/projects/${data.id}`, { ok: "Client link created." });
}
