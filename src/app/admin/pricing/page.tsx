import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/server/db";
import { loadSettingRows, settingsFromRows } from "@/lib/pricing/data";
import { latestGoodRate } from "@/lib/pricing/fx";
import { AdminShell, Card, Flash, btn, btnLight, input, when, type SP } from "../_ui";

export const dynamic = "force-dynamic";

const ENUMS: Record<string, string[]> = {
  fx_mode: ["live", "live_buffer", "fixed"],
  partner_choice: ["Recommended", "UniCloud", "Unitellas"],
  amount_due_mode: ["first_month", "term", "deposit_pct"],
  show_partner: ["false", "true"],
};

const fmtNum = (v: unknown) => (v == null ? "" : String(Number(v)));

export default async function Pricing({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const [rows, { data: cards }, { data: sizes }, { data: wan }, live, { data: lastFx }, { data: auditRows }] = await Promise.all([
    loadSettingRows(),
    db().from("rate_cards").select("*").order("sort"),
    db().from("unitellas_sizes").select("*").order("sort"),
    db().from("unitellas_wan").select("*").order("mbps"),
    latestGoodRate(),
    db().from("fx_rates").select("rate, source, ok, error, fetched_at").order("fetched_at", { ascending: false }).limit(5),
    db().from("pricing_audit").select("*").order("at", { ascending: false }).limit(30),
  ]);
  const s = settingsFromRows(rows);
  const effective =
    s.fxMode === "fixed" ? s.fxFixedRate : live ? (s.fxMode === "live" ? live.rate : Math.round(live.rate * (1 + s.fxBufferPct) * 100) / 100) : s.fxFixedRate;

  return (
    <AdminShell active="pricing">
      <Flash searchParams={searchParams} />
      <p className="mb-5 text-sm text-secondary">
        Every change is audited. Existing invoice versions keep the prices and FX they were created with; changes apply to newly priced versions.
      </p>

      <Card
        title="Exchange rate (USD → NGN)"
        right={
          <form action="/api/admin/fx" method="post">
            <button className={btnLight}>Fetch now</button>
          </form>
        }
      >
        <p className="text-sm">
          Latest live rate: <b>{live ? `₦${live.rate} per $1` : "none"}</b> {live && <>from {live.source}, fetched {when(live.fetched_at)}</>}
          <br />
          Mode <b>{s.fxMode}</b>
          {s.fxMode === "live_buffer" && ` (+${(s.fxBufferPct * 100).toFixed(2)}%)`} → effective rate for new invoices: <b>₦{effective}</b>
          {!live && s.fxMode !== "fixed" && " (fallback: fixed rate)"}
        </p>
        <ul className="mt-2 text-xs text-muted">
          {(lastFx ?? []).map((f, i) => (
            <li key={i}>
              {when(f.fetched_at)} · {f.ok ? `₦${f.rate}` : `failed: ${f.error}`} · {f.source}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Settings">
        <form action="/api/admin/settings" method="post">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {rows.map((r) => (
              <label key={r.key} className="grid gap-1 text-xs font-semibold text-secondary">
                {r.label}
                {ENUMS[r.key] ? (
                  <select name={r.key} defaultValue={String(r.value)} className={input}>
                    {ENUMS[r.key].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input name={r.key} defaultValue={fmtNum(r.value)} className={input} inputMode="decimal" />
                )}
                {r.note && <span className="font-normal text-muted">{r.note}</span>}
              </label>
            ))}
          </div>
          <button className={`${btn} mt-4`}>Save settings</button>
        </form>
      </Card>

      <Card title="Rate cards">
        <p className="mb-3 text-xs text-muted">List prices before partner discounts. Leave blank when a partner does not offer an item: it is then a gap and shown as “To be quoted”.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2 pr-2">Service</th>
                <th className="py-2 pr-2">UniCloud unit</th>
                <th className="py-2 pr-2">UniCloud list ₦</th>
                <th className="py-2 pr-2">Unitellas unit</th>
                <th className="py-2 pr-2">Unitellas list $</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(cards ?? []).map((c) => (
                <tr key={c.key} className="border-t border-[#eef1f5]">
                  <td className="py-1.5 pr-2 font-semibold">
                    {c.service}
                    <form id={`rc-${c.key}`} action="/api/admin/rate-cards" method="post">
                      <input type="hidden" name="key" value={c.key} />
                    </form>
                  </td>
                  <td className="py-1.5 pr-2"><input form={`rc-${c.key}`} name="unicloud_unit" defaultValue={c.unicloud_unit ?? ""} className={`${input} min-w-[200px]`} /></td>
                  <td className="py-1.5 pr-2"><input form={`rc-${c.key}`} name="unicloud_list_ngn" defaultValue={fmtNum(c.unicloud_list_ngn)} className={`${input} w-28`} aria-label={`${c.service} UniCloud list price`} /></td>
                  <td className="py-1.5 pr-2"><input form={`rc-${c.key}`} name="unitellas_unit" defaultValue={c.unitellas_unit ?? ""} className={`${input} min-w-[180px]`} /></td>
                  <td className="py-1.5 pr-2"><input form={`rc-${c.key}`} name="unitellas_list_usd" defaultValue={fmtNum(c.unitellas_list_usd)} className={`${input} w-24`} aria-label={`${c.service} Unitellas list price`} /></td>
                  <td className="py-1.5"><button form={`rc-${c.key}`} className={btnLight}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Unitellas server sizes ($ per hour)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2 pr-2">Order</th>
                <th className="py-2 pr-2">Size</th>
                <th className="py-2 pr-2">vCPU</th>
                <th className="py-2 pr-2">RAM GB</th>
                <th className="py-2 pr-2">Linux $/h</th>
                <th className="py-2 pr-2">Windows $/h</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(sizes ?? []).map((z) => (
                <tr key={z.id} className="border-t border-[#eef1f5]">
                  <td className="py-1.5 pr-2">
                    <form id={`sz-${z.id}`} action="/api/admin/sizes" method="post">
                      <input type="hidden" name="id" value={z.id} />
                    </form>
                    <input form={`sz-${z.id}`} name="sort" defaultValue={z.sort} className={`${input} w-16`} />
                  </td>
                  <td className="py-1.5 pr-2"><input form={`sz-${z.id}`} name="size_name" defaultValue={z.size_name} className={`${input} w-36`} /></td>
                  <td className="py-1.5 pr-2"><input form={`sz-${z.id}`} name="vcpu" defaultValue={z.vcpu} className={`${input} w-20`} /></td>
                  <td className="py-1.5 pr-2"><input form={`sz-${z.id}`} name="ram_gb" defaultValue={fmtNum(z.ram_gb)} className={`${input} w-20`} /></td>
                  <td className="py-1.5 pr-2"><input form={`sz-${z.id}`} name="linux_usd_hour" defaultValue={fmtNum(z.linux_usd_hour)} className={`${input} w-24`} /></td>
                  <td className="py-1.5 pr-2"><input form={`sz-${z.id}`} name="windows_usd_hour" defaultValue={fmtNum(z.windows_usd_hour)} className={`${input} w-24`} /></td>
                  <td className="flex gap-1 py-1.5">
                    <button form={`sz-${z.id}`} name="action" value="update" className={btnLight}>Save</button>
                    <button form={`sz-${z.id}`} name="action" value="delete" className={btnLight}>Delete</button>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#e3e7ee]">
                <td className="py-1.5 pr-2">
                  <form id="sz-new" action="/api/admin/sizes" method="post">
                    <input type="hidden" name="action" value="insert" />
                  </form>
                  <input form="sz-new" name="sort" placeholder="#" className={`${input} w-16`} />
                </td>
                <td className="py-1.5 pr-2"><input form="sz-new" name="size_name" placeholder="New size" className={`${input} w-36`} /></td>
                <td className="py-1.5 pr-2"><input form="sz-new" name="vcpu" className={`${input} w-20`} /></td>
                <td className="py-1.5 pr-2"><input form="sz-new" name="ram_gb" className={`${input} w-20`} /></td>
                <td className="py-1.5 pr-2"><input form="sz-new" name="linux_usd_hour" className={`${input} w-24`} /></td>
                <td className="py-1.5 pr-2"><input form="sz-new" name="windows_usd_hour" className={`${input} w-24`} /></td>
                <td className="py-1.5"><button form="sz-new" className={btn}>Add</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Unitellas WAN tiers ($ per site per month)">
        <table className="text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="py-2 pr-2">Mbps</th>
              <th className="py-2 pr-2">$ / month</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(wan ?? []).map((w) => (
              <tr key={w.id} className="border-t border-[#eef1f5]">
                <td className="py-1.5 pr-2">
                  <form id={`wan-${w.id}`} action="/api/admin/wan" method="post">
                    <input type="hidden" name="id" value={w.id} />
                  </form>
                  <input form={`wan-${w.id}`} name="mbps" defaultValue={fmtNum(w.mbps)} className={`${input} w-28`} />
                </td>
                <td className="py-1.5 pr-2"><input form={`wan-${w.id}`} name="list_usd_month" defaultValue={fmtNum(w.list_usd_month)} className={`${input} w-28`} /></td>
                <td className="flex gap-1 py-1.5">
                  <button form={`wan-${w.id}`} name="action" value="update" className={btnLight}>Save</button>
                  <button form={`wan-${w.id}`} name="action" value="delete" className={btnLight}>Delete</button>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-[#e3e7ee]">
              <td className="py-1.5 pr-2">
                <form id="wan-new" action="/api/admin/wan" method="post">
                  <input type="hidden" name="action" value="insert" />
                </form>
                <input form="wan-new" name="mbps" placeholder="Mbps" className={`${input} w-28`} />
              </td>
              <td className="py-1.5 pr-2"><input form="wan-new" name="list_usd_month" placeholder="$" className={`${input} w-28`} /></td>
              <td className="py-1.5"><button form="wan-new" className={btn}>Add</button></td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card title="Recent changes">
        <ul className="grid gap-1 text-xs">
          {(auditRows ?? []).map((a) => (
            <li key={a.id} className="font-mono">
              {when(a.at)} · {a.actor} · {a.table_name}/{a.row_key} · {a.action} · {JSON.stringify(a.old_value)} → {JSON.stringify(a.new_value)}
            </li>
          ))}
        </ul>
      </Card>
    </AdminShell>
  );
}
