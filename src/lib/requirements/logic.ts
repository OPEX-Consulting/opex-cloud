import type { Answers, ServerKind, ServerRow, Servers } from "./schema";
import { NOT_SURE, OTHER } from "./options";

export const STEPS = [
  { id: "contacts", title: "Project & contacts", short: "Contacts" },
  { id: "objectives", title: "Objectives", short: "Objectives" },
  { id: "source", title: "Use case & source", short: "Source" },
  { id: "target", title: "Target & hosting", short: "Target" },
  { id: "inventory", title: "Server inventory", short: "Servers" },
  { id: "review", title: "Review & submit", short: "Review" },
] as const;

export const KIND_LABELS: Record<ServerKind, string> = {
  linux: "Linux VMs",
  windows: "Windows VMs",
  physical: "Physical servers",
};

export type Totals = {
  cpu: number;
  ram: number;
  storage: number;
  count: number;
  publicIps: number;
};

export function rowStorage(r: ServerRow) {
  return (r.bootGib ?? 0) + r.disks.reduce((a, b) => a + (b || 0), 0);
}

export function totalsFor(rows: ServerRow[]): Totals {
  return rows.reduce<Totals>(
    (t, r) => ({
      cpu: t.cpu + (r.vcpu ?? 0),
      ram: t.ram + (r.ramGib ?? 0),
      storage: t.storage + rowStorage(r),
      count: t.count + 1,
      publicIps: t.publicIps + (r.publicIps ?? 0),
    }),
    { cpu: 0, ram: 0, storage: 0, count: 0, publicIps: 0 },
  );
}

export function overallTotals(s: Servers): Totals {
  const parts = [totalsFor(s.linux), totalsFor(s.windows), totalsFor(s.physical)];
  return parts.reduce((a, b) => ({
    cpu: a.cpu + b.cpu,
    ram: a.ram + b.ram,
    storage: a.storage + b.storage,
    count: a.count + b.count,
    publicIps: a.publicIps + b.publicIps,
  }));
}

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(n);

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export type Missing = { step: number; field: string; label: string };

/** Required items for submission. Pure, shared by the client (review screen) and the submit API. */
export function findMissing(a: Answers, s: Servers): Missing[] {
  const m: Missing[] = [];
  const add = (step: number, field: string, label: string) => m.push({ step, field, label });

  // Step 1
  if (!a.contact.customerName.trim()) add(0, "customerName", "Customer name");
  if (!a.contact.contactName.trim()) add(0, "contactName", "Your name");
  if (!a.contact.contactEmail.trim()) add(0, "contactEmail", "Your email address");
  else if (!isEmail(a.contact.contactEmail)) add(0, "contactEmail", "A valid email address");

  // Step 2
  if (!a.objectives.requirement) add(1, "requirement", "Which requirement best describes the project");
  else if (a.objectives.requirement === OTHER && !a.objectives.requirementOther.trim())
    add(1, "requirementOther", "A short description of your requirement");
  if (!a.objectives.challenges.some((c) => c.trim()))
    add(1, "challenges", "At least one challenge");

  // Step 3
  if (a.useCase.useCases.length === 0) add(2, "useCases", "At least one use case");
  if (a.useCase.useCases.includes("managed_dr") && !a.useCase.managedDrYears)
    add(2, "managedDrYears", "Number of years for Managed DR");
  if (a.source.platforms.length === 0) add(2, "platforms", "Your source platform(s)");
  if (!a.source.afterHours) add(2, "afterHours", "Whether after-hours or weekend work is needed");
  if (a.source.bandwidthMbps == null && !a.source.bandwidthNotSure)
    add(2, "sourceBandwidth", "Source bandwidth (or tick ‘Not sure’)");

  // Step 4
  if (!a.target.hosting) add(3, "hosting", "Hosting model");

  // Step 5
  const all: [ServerKind, ServerRow[]][] = [
    ["linux", s.linux],
    ["windows", s.windows],
    ["physical", s.physical],
  ];
  const count = all.reduce((n, [, rows]) => n + rows.length, 0);
  if (count === 0 && !a.inventory.sendSeparately)
    add(4, "servers", "At least one server (or tick ‘I'll send the inventory separately’)");
  for (const [kind, rows] of all) {
    const incomplete = rows.filter((r) => r.vcpu == null || r.ramGib == null || r.bootGib == null || !r.os);
    if (incomplete.length)
      add(
        4,
        `servers-${kind}`,
        `${incomplete.length} ${KIND_LABELS[kind].toLowerCase()} missing CPU, RAM, boot volume or OS`,
      );
  }
  return m;
}

export function stepComplete(step: number, a: Answers, s: Servers) {
  return !findMissing(a, s).some((x) => x.step === step);
}

/** Human-friendly rendering of a list answer with an "Other" free-text. */
export function listWithOther(list: string[], other: string) {
  return list
    .map((v) => (v === OTHER && other.trim() ? `Other: ${other.trim()}` : v))
    .join(", ");
}

export const notSureOr = (flag: boolean, v: string) => (flag ? NOT_SURE : v);
