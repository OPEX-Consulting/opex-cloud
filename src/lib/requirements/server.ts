// Server-only module: import only from route handlers and server components.
import { db, supabaseConfigured } from "../server/db";
import { createHash } from "node:crypto";
import { ensureInvoice } from "../invoice/service";
import { DEMO_PROJECT } from "./demo";
import {
  draftSchema,
  serverSchema,
  SERVER_KINDS,
  type Draft,
  type PortalPayload,
  type PortalStatus,
  type ServerKind,
  type ServerRow,
  type Servers,
  SUBMITTED_STATUSES,
} from "./schema";

/* Server-only Supabase access for the requirements portal. Uses the service role key, never sent to the browser. */

export { supabaseConfigured };

export function isDemo(token: string) {
  return token === "demo" || !supabaseConfigured();
}

export function demoPayload(token: string): PortalPayload {
  return {
    mode: "demo",
    token,
    project: DEMO_PROJECT,
    status: "invited",
    expired: false,
    submittedAt: null,
    updatedAt: null,
    draft: null,
  };
}

export type ProjectRow = {
  id: string;
  customer_name: string | null;
  project_name: string | null;
  customer_address: string | null;
  opex_sales_contact_name: string | null;
  opex_sales_contact_email: string | null;
  opex_sales_contact_phone: string | null;
  status: PortalStatus;
  expires_at: string | null;
  submitted_at: string | null;
  updated_at: string | null;
  submit_count: number | null;
};

// Internal team fields (project_manager, lead_engineer, deployment_engineer) are deliberately NOT selected.
const PROJECT_COLUMNS =
  "id, customer_name, project_name, customer_address, opex_sales_contact_name, opex_sales_contact_email, opex_sales_contact_phone, status, expires_at, submitted_at, updated_at, submit_count";

export async function getProject(token: string): Promise<ProjectRow | null> {
  const { data, error } = await db().from("projects").select(PROJECT_COLUMNS).eq("token", token).maybeSingle();
  if (error) throw new Error(`projects lookup failed: ${error.message}`);
  return (data as ProjectRow | null) ?? null;
}

const isExpired = (p: ProjectRow) => Boolean(p.expires_at && new Date(p.expires_at).getTime() < Date.now());
const wasSubmitted = (p: ProjectRow) => SUBMITTED_STATUSES.includes(p.status) || p.status === "edited";

type DbServer = {
  kind: ServerKind;
  position: number;
  vcpu: number | null;
  ram_gib: number | null;
  boot_gib: number | null;
  os: string | null;
  os_version: string | null;
  public_ips: number | null;
  kernel: string | null;
  hostname: string | null;
  role: string | null;
  hypervisor: string | null;
  dr_protect: string | null;
  fstab: string | null;
  lsblk: string | null;
  disks: number[] | null;
  details: Record<string, string> | null;
  backup: string | null;
  replication: string | null;
  id: string;
};

function toDb(projectId: string, kind: ServerKind, r: ServerRow, position: number) {
  return {
    project_id: projectId,
    kind,
    position,
    vcpu: r.vcpu == null ? null : Math.round(r.vcpu),
    ram_gib: r.ramGib,
    boot_gib: r.bootGib,
    os: r.os || null,
    os_version: r.osVersion || null,
    public_ips: r.publicIps == null ? null : Math.round(r.publicIps),
    kernel: r.kernel || null,
    hostname: r.hostname || null,
    role: r.role || null,
    hypervisor: r.hypervisor || null,
    dr_protect: r.drProtect || null,
    fstab: r.fstab || null,
    lsblk: r.lsblk || null,
    disks: r.disks,
    backup: r.backup || null,
    replication: r.replication || null,
    details: { osOther: r.osOther, osType: r.osType, roleOther: r.roleOther, hypervisorOther: r.hypervisorOther },
  };
}

function fromDb(s: DbServer): ServerRow {
  const d = s.details ?? {};
  return serverSchema.parse({
    id: s.id,
    vcpu: s.vcpu == null ? null : Number(s.vcpu),
    ramGib: s.ram_gib == null ? null : Number(s.ram_gib),
    bootGib: s.boot_gib == null ? null : Number(s.boot_gib),
    os: s.os ?? "",
    osOther: d.osOther ?? "",
    osVersion: s.os_version ?? "",
    osType: d.osType ?? "",
    publicIps: s.public_ips == null ? null : Number(s.public_ips),
    kernel: s.kernel ?? "",
    hostname: s.hostname ?? "",
    role: s.role ?? "",
    roleOther: d.roleOther ?? "",
    hypervisor: s.hypervisor ?? "",
    hypervisorOther: d.hypervisorOther ?? "",
    drProtect: s.dr_protect ?? "",
    fstab: s.fstab ?? "",
    lsblk: s.lsblk ?? "",
    disks: (s.disks ?? []).map(Number).filter((n) => Number.isFinite(n) && n >= 0),
    backup: s.backup ?? "",
    replication: s.replication ?? "",
  });
}

export async function loadPortal(token: string): Promise<PortalPayload | null> {
  if (isDemo(token)) return demoPayload(token);
  const p = await getProject(token);
  if (!p) return null;

  const [{ data: req, error: e1 }, { data: srv, error: e2 }] = await Promise.all([
    db().from("requirements").select("answers, current_step, updated_at").eq("project_id", p.id).maybeSingle(),
    db().from("servers").select("*").eq("project_id", p.id).order("kind").order("position"),
  ]);
  if (e1) throw new Error(`requirements lookup failed: ${e1.message}`);
  if (e2) throw new Error(`servers lookup failed: ${e2.message}`);

  let draft: Draft | null = null;
  if (req || (srv && srv.length)) {
    const servers: Servers = { linux: [], windows: [], physical: [] };
    for (const s of (srv ?? []) as DbServer[]) {
      if (SERVER_KINDS.includes(s.kind)) servers[s.kind].push(fromDb(s));
    }
    const parsed = draftSchema.safeParse({
      answers: req?.answers ?? {},
      currentStep: req?.current_step ?? 0,
      servers,
    });
    draft = parsed.success ? parsed.data : draftSchema.parse({ servers });
  }

  return {
    mode: "live",
    token,
    project: {
      customerName: p.customer_name ?? "",
      projectName: p.project_name ?? "",
      customerAddress: p.customer_address ?? "",
      salesContactName: p.opex_sales_contact_name ?? "",
      salesContactEmail: p.opex_sales_contact_email ?? "",
      salesContactPhone: p.opex_sales_contact_phone ?? "",
    },
    status: p.status,
    expired: isExpired(p) && !wasSubmitted(p),
    submittedAt: p.submitted_at,
    updatedAt: req?.updated_at ?? p.updated_at,
    draft,
  };
}

export type SaveResult =
  | { ok: true; updatedAt: string; status: PortalStatus; invoice: { number: string; version: number } | null }
  | { ok: false; status: number; message: string };

/** Load the stored draft for a project (used when pricing without a client payload). */
export async function loadDraft(token: string): Promise<{ p: ProjectRow; draft: Draft } | null> {
  const payload = await loadPortal(token);
  const p = await getProject(token);
  if (!payload || !p) return null;
  return { p, draft: payload.draft ?? draftSchema.parse({}) };
}

function contentHash(draft: Draft) {
  const servers = SERVER_KINDS.map((k) => draft.servers[k].map(({ id: _id, ...r }) => (void _id, r)));
  return createHash("sha256").update(JSON.stringify([draft.answers, servers])).digest("hex").slice(0, 40);
}

/** Write the draft. Returns whether answers or servers changed (navigation-only saves just move current_step). */
async function writeDraft(p: ProjectRow, draft: Draft): Promise<{ at: string; changed: boolean }> {
  const now = new Date().toISOString();
  const hash = contentHash(draft);
  const { data: prev } = await db().from("requirements").select("content_hash").eq("project_id", p.id).maybeSingle();
  if (prev && prev.content_hash === hash) {
    const { error } = await db().from("requirements").update({ current_step: draft.currentStep }).eq("project_id", p.id);
    if (error) throw new Error(`requirements save failed: ${error.message}`);
    return { at: now, changed: false };
  }
  const { error: e1 } = await db()
    .from("requirements")
    .upsert(
      { project_id: p.id, answers: draft.answers, current_step: draft.currentStep, content_hash: hash },
      { onConflict: "project_id" },
    );
  if (e1) throw new Error(`requirements save failed: ${e1.message}`);

  const rows = SERVER_KINDS.flatMap((k) => draft.servers[k].map((r, i) => toDb(p.id, k, r, i)));
  const { error: e2 } = await db().from("servers").delete().eq("project_id", p.id);
  if (e2) throw new Error(`servers clear failed: ${e2.message}`);
  for (let i = 0; i < rows.length; i += 500) {
    const { error: e3 } = await db().from("servers").insert(rows.slice(i, i + 500));
    if (e3) throw new Error(`servers save failed: ${e3.message}`);
  }
  return { at: now, changed: true };
}

async function guard(token: string): Promise<{ p: ProjectRow } | { err: SaveResult }> {
  const p = await getProject(token);
  if (!p) return { err: { ok: false, status: 404, message: "This link is not recognised." } };
  if (isExpired(p)) return { err: { ok: false, status: 410, message: "This link has expired." } };
  return { p };
}

const inv = (row: { number: string; version: number } | null) => (row ? { number: row.number, version: row.version } : null);

/**
 * Autosave. Clients can always edit, including after submitting: the status then moves to 'edited' until they
 * submit again. Once an invoice exists (or the client is on the invoice step) the server re-prices it.
 */
export async function saveDraft(token: string, draft: Draft): Promise<SaveResult> {
  const g = await guard(token);
  if ("err" in g) return g.err;
  const p = g.p;
  const { at: updatedAt, changed } = await writeDraft(p, draft);
  let status = p.status;
  if (p.status === "invited") status = "in_progress";
  else if (changed && SUBMITTED_STATUSES.includes(p.status)) status = "edited";
  if (status !== p.status) {
    const patch: Record<string, unknown> = { status };
    if (status === "edited") patch.last_edited_at = updatedAt;
    await db().from("projects").update(patch).eq("id", p.id);
  }
  let invoice = null;
  try {
    invoice = inv(await ensureInvoice(p, draft, "save", draft.currentStep >= 6));
  } catch (e) {
    console.error("[requirements] invoice recompute failed", e);
  }
  return { ok: true, updatedAt, status, invoice };
}

export async function submitDraft(token: string, draft: Draft): Promise<SaveResult> {
  const g = await guard(token);
  if ("err" in g) return g.err;
  const p = g.p;
  await writeDraft(p, draft);
  const submittedAt = new Date().toISOString();
  const status: PortalStatus = (p.submit_count ?? 0) > 0 || p.status === "edited" ? "resubmitted" : "submitted";
  const { error } = await db()
    .from("projects")
    .update({ status, submitted_at: submittedAt, submit_count: (p.submit_count ?? 0) + 1 })
    .eq("id", p.id);
  if (error) throw new Error(`submit failed: ${error.message}`);
  let invoice = null;
  try {
    invoice = inv(await ensureInvoice(p, draft, "submit", true));
  } catch (e) {
    console.error("[requirements] invoice on submit failed", e);
  }
  return { ok: true, updatedAt: submittedAt, status, invoice };
}
