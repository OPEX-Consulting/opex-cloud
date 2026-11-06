import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/server/db";
import { AdminShell, Card, Flash, btn, input, ngn, when, type SP } from "../_ui";

export const dynamic = "force-dynamic";

type P = {
  id: string;
  customer_name: string | null;
  project_name: string | null;
  status: string;
  updated_at: string;
  expires_at: string | null;
  submitted_at: string | null;
};
type I = { project_id: string; number: string; version: number; monthly_total: number };

const STATUS_STYLE: Record<string, string> = {
  invited: "bg-[#eef2f8] text-[#425066]",
  in_progress: "bg-[#e9f0fb] text-[#315caa]",
  submitted: "bg-[#eaf7ef] text-[#15803d]",
  edited: "bg-[#fdf1ec] text-[#b4532a]",
  resubmitted: "bg-[#eaf7ef] text-[#15803d]",
  reviewed: "bg-[#07152f] text-white",
};

export default async function Projects({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const [{ data: projects }, { data: invoices }] = await Promise.all([
    db().from("projects").select("id, customer_name, project_name, status, updated_at, expires_at, submitted_at").order("updated_at", { ascending: false }).limit(500),
    db().from("invoices").select("project_id, number, version, monthly_total").eq("status", "current"),
  ]);
  const inv = new Map(((invoices ?? []) as I[]).map((i) => [i.project_id, i]));
  const f = (name: string, label: string, props: Record<string, unknown> = {}) => (
    <label className="grid gap-1 text-xs font-semibold text-secondary">
      {label}
      <input name={name} className={input} {...props} />
    </label>
  );
  return (
    <AdminShell active="projects">
      <Flash searchParams={searchParams} />
      <Card title="Create a client link">
        <form action="/api/admin/projects" method="post" className="grid gap-3 md:grid-cols-3">
          {f("customer_name", "Customer name *", { required: true })}
          {f("project_name", "Project name")}
          {f("customer_address", "Customer address")}
          {f("opex_sales_contact_name", "OPEX sales contact name")}
          {f("opex_sales_contact_email", "OPEX sales contact email", { type: "email" })}
          {f("opex_sales_contact_phone", "OPEX sales contact phone")}
          {f("project_manager", "Project manager (internal)")}
          {f("lead_engineer", "Lead engineer (internal)")}
          {f("deployment_engineer", "Deployment engineer (internal)")}
          {f("expires_days", "Link open for (days)", { type: "number", min: 1, max: 365, defaultValue: 30 })}
          <div className="flex items-end">
            <button className={btn}>Create link</button>
          </div>
        </form>
      </Card>
      <Card title={`Projects (${projects?.length ?? 0})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Project</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Invoice</th>
                <th className="py-2 pr-3 text-right">Monthly incl. VAT</th>
                <th className="py-2 pr-3">Updated</th>
                <th className="py-2 pr-3">Link expires</th>
              </tr>
            </thead>
            <tbody>
              {((projects ?? []) as P[]).map((p) => {
                const i = inv.get(p.id);
                return (
                  <tr key={p.id} className="border-t border-[#eef1f5]">
                    <td className="py-2 pr-3 font-semibold">
                      <Link href={`/admin/projects/${p.id}`} className="text-opex-blue hover:underline">
                        {p.customer_name || "(no name)"}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{p.project_name}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[p.status] ?? ""}`}>{p.status.replace("_", " ")}</span>
                    </td>
                    <td className="py-2 pr-3">{i ? `${i.number} v${i.version}` : "—"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{i ? ngn(i.monthly_total) : "—"}</td>
                    <td className="py-2 pr-3">{when(p.updated_at)}</td>
                    <td className="py-2 pr-3">{when(p.expires_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
