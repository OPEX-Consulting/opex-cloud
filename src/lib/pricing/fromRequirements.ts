/**
 * Map portal answers (requirements questionnaire) to pricing-engine inputs (the sheet's "Quote Builder" tab).
 * Pure: safe on client and server.
 *
 * - Linux VMs, Windows VMs and physical servers become server rows. Physical servers use CPU cores as vCPU and
 *   count as Windows when their OS is a Windows Server edition, otherwise Linux.
 * - Identical rows (same role label, OS, CPU, RAM, disks, backup and replication) are grouped into one row with a qty.
 * - Storage: boot + extra disks, split into SSD / HDD by the storage tier answer.
 * - Blank or "Not sure" answers are priced on ASSUMPTION_DEFAULTS and flagged as assumed.
 */
import { DR_USE_CASES, NOT_SURE, OTHER } from "../requirements/options";
import type { Answers, QtyAnswer, ServerKind, ServerRow, Servers } from "../requirements/schema";
import { ASSUMPTION_DEFAULTS as D } from "./policy";
import type { EngineInputs, PartnerChoice, Replication, ServerInput } from "./types";

export type MapOptions = { margin: number; partner: PartnerChoice; termMonths: number };

const KIND_NAME: Record<ServerKind, string> = { linux: "Linux VM", windows: "Windows VM", physical: "Physical server" };

export function isDrUseCase(a: Answers) {
  return a.useCase.useCases.some((u) => DR_USE_CASES.includes(u));
}

function roleLabel(kind: ServerKind, r: ServerRow) {
  if (r.role === OTHER && r.roleOther.trim()) return r.roleOther.trim();
  if (r.role && r.role !== OTHER && r.role !== NOT_SURE) return r.role === "Domain Ctl" ? "Domain controller" : r.role;
  return KIND_NAME[kind];
}

function osOf(kind: ServerKind, r: ServerRow): "Linux" | "Windows" {
  if (kind === "windows") return "Windows";
  if (kind === "linux") return "Linux";
  return /^win/i.test(r.os) ? "Windows" : "Linux";
}

/** Effective storage tier: the explicit answer, else derived from the step-4 media type, else the default. */
export function storageTierOf(a: Answers): { tier: "SSD" | "HDD" | "Mixed"; assumed: boolean } {
  const t = a.services.storageTier;
  if (t === "SSD" || t === "HDD" || t === "Mixed") return { tier: t, assumed: false };
  const m = a.target.mediaType;
  if (!t || t === NOT_SURE) {
    if (m === "SSD" || m === "HDD") return { tier: m, assumed: t === NOT_SURE };
    if (m === "Tiered" || m === "Hybrid") return { tier: "Mixed", assumed: t === NOT_SURE };
  }
  return { tier: D.storageTier, assumed: true };
}

function qty(q: QtyAnswer, fallback: number): { v: number; assumed: boolean } {
  if (q.value != null && !q.notSure) return { v: Math.round(q.value * 100) / 100, assumed: false };
  return { v: fallback, assumed: true };
}

/** Bandwidth implied by the step-4 "network connectivity" choice, e.g. "… internet 200 Mbps …" -> 200. */
export function bandwidthFromConnectivity(a: Answers): number | null {
  const m = a.target.networkConnectivity.match(/([\d,]+)\s*Mbps/i);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

export function defaultReplication(a: Answers): Replication {
  return isDrUseCase(a) ? D.replicationWithDr : D.replicationWithoutDr;
}

export type MappedInputs = { inputs: EngineInputs; assumptions: string[] };

export function engineInputsFromRequirements(a: Answers, s: Servers, o: MapOptions): MappedInputs {
  const assumptions: string[] = [];
  const tier = storageTierOf(a);
  if (tier.assumed) assumptions.push(`Storage tier assumed: ${tier.tier === "Mixed" ? "SSD boot, HDD data" : tier.tier}`);

  const groups = new Map<string, ServerInput>();
  const kinds: ServerKind[] = ["linux", "windows", "physical"];
  for (const kind of kinds) {
    for (const r of s[kind]) {
      const why: string[] = [];
      const vcpu = r.vcpu ?? (why.push(`${kind === "physical" ? "CPU cores" : "vCPU"} assumed`), D.vcpu);
      const ramGb = r.ramGib ?? (why.push("RAM assumed"), D.ramGb);
      const boot = r.bootGib ?? (why.push("boot disk assumed"), D.bootGb);
      const data = r.disks.reduce((x, y) => x + (y || 0), 0);
      const ssdGb = tier.tier === "SSD" ? boot + data : tier.tier === "Mixed" ? boot : 0;
      const hddGb = tier.tier === "HDD" ? boot + data : tier.tier === "Mixed" ? data : 0;
      let backup: boolean;
      if (r.backup === "Yes") backup = true;
      else if (r.backup === "No") backup = false;
      else {
        backup = D.backup;
        why.push("backup assumed");
      }
      let replication: Replication;
      if (r.replication === "None" || r.replication === "Active-passive" || r.replication === "Active-active") replication = r.replication;
      else {
        replication = defaultReplication(a);
        why.push(`replication assumed (${replication})`);
      }
      const row: ServerInput = {
        role: roleLabel(kind, r),
        os: osOf(kind, r),
        qty: 1,
        vcpu: Math.round(vcpu),
        ramGb: Math.round(ramGb * 100) / 100,
        ssdGb: Math.round(ssdGb * 100) / 100,
        hddGb: Math.round(hddGb * 100) / 100,
        backup,
        replication,
        assumed: why,
      };
      const key = JSON.stringify([row.role, row.os, row.vcpu, row.ramGb, row.ssdGb, row.hddGb, backup, replication, why]);
      const g = groups.get(key);
      if (g) g.qty += 1;
      else groups.set(key, row);
    }
  }
  const servers = [...groups.values()];
  const assumedServers = servers.filter((x) => x.assumed?.length).reduce((n, x) => n + x.qty, 0);
  if (assumedServers) assumptions.push(`${assumedServers} server(s) priced with assumed values`);

  const sv = a.services;
  const assumed: Record<string, string> = {};
  const flag = (key: string, label: string, r: { v: number; assumed: boolean }) => {
    if (r.assumed) {
      assumed[key] = `${label} assumed`;
      assumptions.push(`${label} assumed: ${r.v}`);
    }
    return r.v;
  };
  if (tier.assumed) assumed.storage = "Storage tier assumed";

  const objectTicked = a.target.storagePersonality.includes("Object");
  const serverIps = kinds.reduce((n, k) => n + s[k].reduce((m, r) => m + (r.publicIps ?? 0), 0), 0);

  const objectGb = flag("object", "Object storage", qty(sv.objectStorageGb, objectTicked ? D.objectGbIfObjectTicked : D.objectGbOtherwise));
  const publicIps = flag("public_ip", "Public IPs", qty(sv.publicIps, Math.max(serverIps, D.minPublicIps)));
  const sites = qty(sv.internetSites, D.internetSites);
  const mbps = qty(sv.bandwidthMbps, bandwidthFromConnectivity(a) ?? D.bandwidthMbps);
  if (sites.assumed || mbps.assumed) {
    assumed.internet = "Internet sites or bandwidth assumed";
    assumptions.push(`Internet assumed: ${sites.v} site(s) at ${mbps.v} Mbps`);
  }
  const vpn = flag("vpn", "VPN appliances", qty(sv.vpn, D.vpn));
  const firewalls = flag("firewall", "Firewalls", qty(sv.firewalls, D.firewalls));
  const loadBalancers = flag("load_balancer", "Load balancers", qty(sv.loadBalancers, D.loadBalancers));
  const monitoring = flag("monitoring", "Monitoring services", qty(sv.monitoring, D.monitoring));

  let standby: boolean;
  if (sv.standby === "Yes") standby = true;
  else if (sv.standby === "No") standby = false;
  else {
    standby = D.standby;
    assumed.standby = "Standby capacity assumed";
    assumptions.push(`Standby compute at a secondary site assumed: ${standby ? "Yes" : "No"}`);
  }

  return {
    inputs: {
      servers,
      objectGb,
      publicIps,
      sites: sites.v,
      mbps: mbps.v,
      vpn,
      firewalls,
      loadBalancers,
      monitoring,
      standby,
      margin: o.margin,
      partner: o.partner,
      termMonths: o.termMonths,
      assumed,
    },
    assumptions,
  };
}

/** True when the answers produce at least one priced line. */
export function isPriceable(i: EngineInputs) {
  return (
    i.servers.length > 0 ||
    i.objectGb > 0 ||
    i.publicIps > 0 ||
    i.sites > 0 ||
    i.vpn > 0 ||
    i.firewalls > 0 ||
    i.loadBalancers > 0 ||
    i.monitoring > 0
  );
}
