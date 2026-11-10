import { amountDue } from "@/lib/invoice/due";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/server/db";
import { listInvoices } from "@/lib/invoice/service";
import { draftSchema, SERVER_KINDS, type Servers } from "@/lib/requirements/schema";
import { Summary } from "@/app/requirements/_components/Summary";
import { CopyButton } from "../../_copy";
import { AdminShell, Card, Flash, btn, btnLight, input, ngn, when, type SP } from "../../_ui";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: p } = await db().from("projects").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const [{ data: req }, { data: srv }, invoices, { data: notes }] = await Promise.all([
    db().from("requirements").select("answers, current_step, updated_at").eq("project_id", id).maybeSingle(),
    db().from("servers").select("*").eq("project_id", id).order("kind").order("position"),
    listInvoices(id),
    db().from("notifications").select("created_at, status, to_address, subject, error").eq("project_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  const servers: Servers = { linux: [], windows: [], physical: [] };
  for (const s of srv ?? []) {
    if (!SERVER_KINDS.includes(s.kind)) continue;
    const d = s.details ?? {};
    servers[s.kind as keyof Servers].push({
      id: s.id, vcpu: s.vcpu, ramGib: s.ram_gib == null ? null : Number(s.ram_gib), bootGib: s.boot_gib == null ? null : Number(s.boot_gib),
      os: s.os ?? "", osOther: d.osOther ?? "", osVersion: s.os_version ?? "", osType: d.osType ?? "", publicIps: s.public_ips,
      kernel: s.kernel ?? "", hostname: s.hostname ?? "", role: s.role ?? "", roleOther: d.roleOther ?? "", hypervisor: s.hypervisor ?? "",
      hypervisorOther: d.hypervisorOther ?? "", drProtect: s.dr_protect ?? "", fstab: s.fstab ?? "", lsblk: s.lsblk ?? "",
      disks: (s.disks ?? []).map(Number), backup: s.backup ?? "", replication: s.replication ?? "",
    });
  }
  const draft = draftSchema.safeParse({ answers: req?.answers ?? {}, currentStep: req?.current_step ?? 0, servers });
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const link = `${origin}/requirements/${p.token}`;
  const cur = invoices.find((i) => i.status === "current");
  const c = cur?.comparison;

  return (
    <AdminShell active="projects">
      <Flash searchParams={searchParams} />
      <h1 className="text-2xl font-bold">{p.customer_name}</h1>
      <p className="mb-5 text-sm text-secondary">
        {p.project_name} · status <b>{p.status}</b> · submitted {when(p.submitted_at)} ({p.submit_count ?? 0}×) · link expires {when(p.expires_at)}
      </p>
      <Card title="Client link">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 break-all rounded-lg bg-[#f5f7fb] px-3 py-2 font-mono text-sm">{link}</p>
          <CopyButton text={link} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={`/api/admin/projects/${id}`} method="post" className="flex items-center gap-2">
            <input type="hidden" name="action" value="extend" />
            <input name="days" type="number" min={1} max={365} defaultValue={14} className={`${input} w-20`} aria-label="Days" />
            <button className={btnLight}>Extend link</button>
          </form>
          <form action={`/api/admin/projects/${id}`} method="post">
            <input type="hidden" name="action" value="reviewed" />
            <button className={btn}>Mark reviewed</button>
          </form>
        </div>
        <p className="mt-3 text-xs text-muted">
          Internal team: PM {p.project_manager || "—"} · Lead {p.lead_engineer || "—"} · Deployment {p.deployment_engineer || "—"} · Sales{" "}
          {p.opex_sales_contact_name || "—"} {p.opex_sales_contact_email ? `(${p.opex_sales_contact_email})` : ""}
        </p>
      </Card>

      <Card title={`Invoice versions (${invoices.length})`}>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted">No invoice yet. One is created when the client opens the invoice step, submits, or downloads.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2 pr-3">Version</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-3">Reason</th>
                  <th className="py-2 pr-3 text-right">Subtotal</th>
                  <th className="py-2 pr-3 text-right">Monthly incl. VAT</th>
                  <th className="py-2 pr-3 text-right">Due now</th>
                  <th className="py-2 pr-3">Partner</th>
                  <th className="py-2 pr-3">FX</th>
                  <th className="py-2 pr-3">Downloads</th>
                  <th className="py-2 pr-3">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-t border-[#eef1f5]">
                    <td className="py-2 pr-3 font-semibold">{i.number} v{i.version}</td>
                    <td className="py-2 pr-3">{i.status}{i.issued_at ? " · issued" : ""}</td>
                    <td className="py-2 pr-3">{when(i.created_at)}</td>
                    <td className="py-2 pr-3">{i.created_reason}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{ngn(i.subtotal)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{ngn(i.monthly_total)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{ngn(amountDue(i).amount)}</td>
                    <td className="py-2 pr-3">{i.chosen_partner}</td>
                    <td className="py-2 pr-3 text-xs" title={i.fx_source}>{i.fx_rate_used}</td>
                    <td className="py-2 pr-3">{i.download_count}</td>
                    <td className="py-2 pr-3">
                      <a className="font-semibold text-opex-blue hover:underline" href={`/api/admin/invoices/${i.id}/pdf`} target="_blank">
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {c && (
          <div className="mt-4 rounded-xl bg-[#f5f7fb] p-4 text-sm">
            <p className="font-semibold">Current version: partner comparison (internal)</p>
            <p className="mt-1">
              UniCloud {ngn(c.uniMonthly)} ({c.uniGaps} gaps) · Unitellas {ngn(c.utlMonthly)} ({c.utlGaps} gaps) · like for like {ngn(c.uniLfl)} vs {ngn(c.utlLfl)}
            </p>
            <p>
              Recommended <b>{c.recommended}</b>: {c.recommendationReason} {c.lflNote} Chosen: <b>{c.chosen}</b>. Margin {ngn(c.marginNgn)} (
              {(c.marginPctOfPrice * 100).toFixed(1)}% of price).
            </p>
            {cur!.inputs_snapshot.assumptions.length > 0 && <p className="mt-1 text-[#b4532a]">Assumed: {cur!.inputs_snapshot.assumptions.join("; ")}</p>}
          </div>
        )}
      </Card>

      <Card title="Email notifications">
        {(notes ?? []).length === 0 ? (
          <p className="text-sm text-muted">None yet.</p>
        ) : (
          <ul className="grid gap-1 text-sm">
            {(notes ?? []).map((n, k) => (
              <li key={k}>
                {when(n.created_at)} · <b>{n.status}</b> · {n.to_address} · {n.subject} {n.error ? <span className="text-[#b4532a]">({n.error})</span> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Answers">
        {draft.success ? <Summary a={draft.data.answers} servers={draft.data.servers} /> : <p className="text-sm text-muted">No answers saved yet.</p>}
      </Card>
    </AdminShell>
  );
}
