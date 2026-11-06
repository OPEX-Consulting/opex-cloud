"use client";

import type { ReactNode } from "react";
import { FiAlertCircle, FiEdit2 } from "react-icons/fi";
import { NOT_SURE, USE_CASES } from "@/lib/requirements/options";
import type { Answers, DataSize, QtyAnswer, ServerKind, ServerRow, Servers } from "@/lib/requirements/schema";
import { KIND_LABELS, STEPS, fmt, listWithOther, overallTotals, rowStorage, totalsFor, type Missing } from "@/lib/requirements/logic";

const dash = <span className="text-[#b6bfcc]">—</span>;

function V({ children }: { children: ReactNode }) {
  if (children === "" || children == null || (Array.isArray(children) && children.length === 0)) return dash;
  return <>{children}</>;
}

function Row({ label, children, missing }: { label: string; children: ReactNode; missing?: boolean | string }) {
  return (
    <div className="grid gap-0.5 border-t border-border py-2.5 first:border-t-0 sm:grid-cols-[220px_1fr] sm:gap-4 print:grid-cols-[200px_1fr] print:py-1.5">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className={`whitespace-pre-line break-words text-sm ${missing ? "font-semibold text-[#b4532a]" : "text-opex-navy"}`}>
        {missing ? (
          <span className="inline-flex items-center gap-1">
            <FiAlertCircle aria-hidden /> {typeof missing === "string" ? missing : "Required – not answered"}
          </span>
        ) : (
          <V>{children}</V>
        )}
      </dd>
    </div>
  );
}

function Group({
  step,
  onEdit,
  missingCount,
  children,
}: {
  step: number;
  onEdit?: (s: number) => void;
  missingCount: number;
  children: ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-[18px] border border-border bg-white p-5 sm:p-6 print:rounded-none print:border-0 print:border-t print:p-0 print:pt-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-opex-navy">
          <span className="text-xs font-semibold text-muted">{step + 1}.</span>
          {STEPS[step].title}
          {missingCount > 0 && (
            <span className="rounded-full bg-[#fdf1ec] px-2 py-0.5 text-[11px] font-semibold text-[#b4532a] print:hidden">
              {missingCount} to complete
            </span>
          )}
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(step)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-opex-blue hover:bg-surface-blue print:hidden"
          >
            <FiEdit2 aria-hidden /> Edit
          </button>
        )}
      </div>
      <dl>{children}</dl>
    </section>
  );
}

const yesNotSure = (flag: boolean, v: string) => (flag ? NOT_SURE : v);
const size = (d: DataSize) => (d.notSure ? NOT_SURE : d.value == null ? "" : `${fmt(d.value)} ${d.unit}`);
const range = (s: string, e: string) => (s || e ? `${s || "?"} – ${e || "?"}` : "");
const other = (v: string, o: string) => (o.trim() && (v === "Other" || v.endsWith("(other)")) ? `${v}: ${o}` : v);

function ServerTable({ kind, rows }: { kind: ServerKind; rows: ServerRow[] }) {
  const t = totalsFor(rows);
  const cols: [string, (r: ServerRow) => ReactNode][] = [
    [kind === "physical" ? "Cores" : "vCPU", (r) => r.vcpu ?? ""],
    ["RAM GiB", (r) => r.ramGib ?? ""],
    ["Boot GiB", (r) => r.bootGib ?? ""],
    ["Extra disks GiB", (r) => r.disks.join(", ")],
    ["Total GiB", (r) => fmt(rowStorage(r))],
    ["O/S", (r) => [other(r.os, r.osOther), r.osVersion, r.osType].filter(Boolean).join(" · ")],
    ["Public IPs", (r) => r.publicIps ?? ""],
    ["Hostname", (r) => r.hostname],
    ["Role", (r) => other(r.role, r.roleOther)],
    ...(kind !== "physical" ? ([["Hypervisor", (r: ServerRow) => other(r.hypervisor, r.hypervisorOther)]] as [string, (r: ServerRow) => ReactNode][]) : []),
    ["DR protect", (r) => r.drProtect],
    ["Backup", (r) => r.backup],
    ["Replication", (r) => r.replication],
    ...(kind === "linux"
      ? ([["Kernel / fstab / lsblk", (r: ServerRow) => [r.kernel, r.fstab && "fstab ✓", r.lsblk && "lsblk ✓"].filter(Boolean).join(" · ")]] as [
          string,
          (r: ServerRow) => ReactNode,
        ][])
      : []),
  ];
  return (
    <div className="mt-3 break-inside-avoid">
      <p className="text-xs font-semibold text-opex-navy">
        {KIND_LABELS[kind]} · {rows.length} · {fmt(t.cpu)} {kind === "physical" ? "cores" : "vCPU"} · {fmt(t.ram)} GiB RAM · {fmt(t.storage)} GiB storage · {fmt(t.publicIps)} public {t.publicIps === 1 ? "IP" : "IPs"}
      </p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-border print:overflow-visible">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-2 py-1.5 font-semibold text-muted">#</th>
              {cols.map(([h]) => (
                <th key={h} className="whitespace-nowrap px-2 py-1.5 font-semibold text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-2 py-1.5 text-muted">{i + 1}</td>
                {cols.map(([h, f]) => (
                  <td key={h} className="whitespace-nowrap px-2 py-1.5 text-opex-navy">
                    <V>{f(r)}</V>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const qty = (q: QtyAnswer, unit = "") => (q.notSure ? NOT_SURE : q.value == null ? "" : `${fmt(q.value)}${unit ? ` ${unit}` : ""}`);

export function Summary({
  a,
  servers,
  missing = [],
  onEdit,
}: {
  a: Answers;
  servers: Servers;
  missing?: Missing[];
  onEdit?: (step: number) => void;
}) {
  const miss = (f: string) => missing.some((m) => m.field === f);
  const count = (s: number) => missing.filter((m) => m.step === s).length;
  const all = overallTotals(servers);
  const useCaseLabels = a.useCase.useCases.map((v) => USE_CASES.find((u) => u.value === v)?.title ?? v);

  return (
    <div className="grid gap-4 print:gap-5">
      <Group step={0} onEdit={onEdit} missingCount={count(0)}>
        <Row label="Customer name" missing={miss("customerName")}>{a.contact.customerName}</Row>
        <Row label="Address & details">{a.contact.customerAddress}</Row>
        <Row label="Contact name" missing={miss("contactName")}>{a.contact.contactName}</Row>
        <Row label="Contact email" missing={miss("contactEmail")}>{a.contact.contactEmail}</Row>
        <Row label="Contact phone">{a.contact.contactPhone}</Row>
        <Row label="Date">{a.contact.date}</Row>
      </Group>

      <Group step={1} onEdit={onEdit} missingCount={count(1)}>
        <Row label="Requirement" missing={miss("requirement") || miss("requirementOther")}>
          {a.objectives.requirement === "Other" ? `Other: ${a.objectives.requirementOther}` : a.objectives.requirement}
        </Row>
        <Row label="Top challenges" missing={miss("challenges")}>
          {a.objectives.challenges.filter((c) => c.trim()).map((c, i) => `${i + 1}. ${c}`).join("\n")}
        </Row>
        <Row label="Success criteria">{a.objectives.successCriteria}</Row>
      </Group>

      <Group step={2} onEdit={onEdit} missingCount={count(2)}>
        <Row label="Use cases" missing={miss("useCases")}>{useCaseLabels.join(", ")}</Row>
        {a.useCase.useCases.includes("multisite_dr") && <Row label="Multi-site mode">{a.useCase.multiSiteMode}</Row>}
        {a.useCase.useCases.includes("managed_dr") && (
          <Row label="Managed DR term" missing={miss("managedDrYears")}>
            {a.useCase.managedDrYears ? `${a.useCase.managedDrYears} year${a.useCase.managedDrYears === 1 ? "" : "s"}` : ""}
          </Row>
        )}
        <Row label="Source platforms" missing={miss("platforms")}>{listWithOther(a.source.platforms, a.source.platformOther)}</Row>
        <Row label="Source site description">{a.source.description}</Row>
        <Row label="Cloud-hosted source data">
          {a.source.clouds.map((c) => (c === "Other private cloud" && a.source.cloudOther ? `${c}: ${a.source.cloudOther}` : c)).join(", ")}
        </Row>
        <Row label="Applications">
          {[listWithOther(a.source.applications, ""), a.source.applicationsOther].filter(Boolean).join("\n")}
        </Row>
        <Row label="Data on VMware VMs">{size(a.source.vmwareDataSize)}</Row>
        <Row label="Data on non-VMware / physical">{size(a.source.nonVmwareDataSize)}</Row>
        <Row label="Replication window">
          {a.source.windowNotSure
            ? NOT_SURE
            : [
                range(a.source.weekdayStart, a.source.weekdayEnd) && `Weekdays ${range(a.source.weekdayStart, a.source.weekdayEnd)}`,
                range(a.source.weekendStart, a.source.weekendEnd) && `Weekends ${range(a.source.weekendStart, a.source.weekendEnd)}`,
              ]
                .filter(Boolean)
                .join("\n")}
        </Row>
        <Row label="After-hours / weekend work" missing={miss("afterHours")}>{a.source.afterHours}</Row>
        <Row label="Source bandwidth" missing={miss("sourceBandwidth")}>
          {yesNotSure(a.source.bandwidthNotSure, a.source.bandwidthMbps != null ? `${fmt(a.source.bandwidthMbps)} Mbps` : "")}
        </Row>
      </Group>

      <Group step={3} onEdit={onEdit} missingCount={count(3)}>
        <Row label="Hosting model" missing={miss("hosting")}>{a.target.hosting}</Row>
        {a.target.dataCentre && <Row label="Data centre">{a.target.dataCentre}</Row>}
        {a.target.networkConnectivity && <Row label="Network connectivity">{a.target.networkConnectivity}</Row>}
        <Row label="Target site description">{a.target.description}</Row>
        <Row label="Target bandwidth">
          {yesNotSure(a.target.bandwidthNotSure, a.target.bandwidthMbps != null ? `${fmt(a.target.bandwidthMbps)} Mbps` : "")}
        </Row>
        <Row label="New environment / migrate from">{a.target.newOrMigrate}</Row>
        <Row label="Bare metal integration">{a.target.bareMetal}</Row>
        <Row label="New or existing storage">{a.target.storageNewExisting}</Row>
        <Row label="Storage personality">{a.target.storagePersonality.join(", ")}</Row>
        <Row label="Media type">{other(a.target.mediaType, a.target.mediaTypeOther)}</Row>
        <Row label="Data resiliency">{a.target.dataResiliency}</Row>
        <Row label="Storage tier" missing={miss("storageTier")}>{a.services.storageTier}</Row>
        <Row label="Object storage" missing={miss("objectStorageGb")}>{qty(a.services.objectStorageGb, "GB")}</Row>
        <Row label="Static public IPs" missing={miss("publicIps")}>{qty(a.services.publicIps)}</Row>
        <Row label="Internet" missing={miss("internetSites") || miss("bandwidthMbps")}>
          {a.services.internetSites.value != null || a.services.internetSites.notSure || a.services.bandwidthMbps.value != null || a.services.bandwidthMbps.notSure
            ? `${qty(a.services.internetSites) || "?"} site(s) at ${qty(a.services.bandwidthMbps, "Mbps") || "?"}`
            : ""}
        </Row>
        <Row label="VPN / firewalls / load balancers" missing={miss("vpn") || miss("firewalls") || miss("loadBalancers")}>
          {[qty(a.services.vpn), qty(a.services.firewalls), qty(a.services.loadBalancers)].some(Boolean)
            ? `${qty(a.services.vpn) || "?"} / ${qty(a.services.firewalls) || "?"} / ${qty(a.services.loadBalancers) || "?"}`
            : ""}
        </Row>
        <Row label="Monitoring services" missing={miss("monitoring")}>{qty(a.services.monitoring)}</Row>
        <Row label="Standby at a secondary site" missing={miss("standby")}>{a.services.standby}</Row>
      </Group>

      <Group step={4} onEdit={onEdit} missingCount={count(4)}>
        <Row label="Totals (all servers)" missing={miss("servers")}>
          {all.count
            ? `${all.count} ${all.count === 1 ? "server" : "servers"} (${servers.linux.length} Linux ${servers.linux.length === 1 ? "VM" : "VMs"}, ${servers.windows.length} Windows ${servers.windows.length === 1 ? "VM" : "VMs"}, ${servers.physical.length} physical) · ${fmt(all.cpu)} vCPU/cores · ${fmt(all.ram)} GiB RAM · ${fmt(all.storage)} GiB storage · ${fmt(all.publicIps)} public IPs`
            : a.inventory.sendSeparately
              ? "Inventory to be sent separately"
              : ""}
        </Row>
        {missing
          .filter((m) => m.field.startsWith("servers-"))
          .map((m) => (
            <Row key={m.field} label={KIND_LABELS[m.field.slice(8) as ServerKind] ?? "Backup & replication"} missing={m.label}>
              {""}
            </Row>
          ))}
        {a.inventory.notes && <Row label="Notes">{a.inventory.notes}</Row>}
        {(["linux", "windows", "physical"] as ServerKind[]).map((k) =>
          servers[k].length ? <ServerTable key={k} kind={k} rows={servers[k]} /> : null,
        )}
      </Group>
    </div>
  );
}
