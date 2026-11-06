// Server-only module: import only from route handlers and server components.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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
} from "./schema";

/* Server-only Supabase access for the requirements portal. Uses the service role key, never sent to the browser. */

let client: SupabaseClient | null = null;

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isDemo(token: string) {
  return token === "demo" || !supabaseConfigured();
}

function db() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
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

type ProjectRow = {
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
};

// Internal team fields (project_manager, lead_engineer, deployment_engineer) are deliberately NOT selected.
const PROJECT_COLUMNS =
  "id, customer_name, project_name, customer_address, opex_sales_contact_name, opex_sales_contact_email, opex_sales_contact_phone, status, expires_at, submitted_at, updated_at";

async function getProject(token: string): Promise<ProjectRow | null> {
  const { data, error } = await db().from("projects").select(PROJECT_COLUMNS).eq("token", token).maybeSingle();
  if (error) throw new Error(`projects lookup failed: ${error.message}`);
  return (data as ProjectRow | null) ?? null;
}

const isExpired = (p: ProjectRow) => Boolean(p.expires_at && new Date(p.expires_at).getTime() < Date.now());
const isLocked = (p: ProjectRow) => p.status === "submitted" || p.status === "reviewed";

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
    expired: isExpired(p) && !isLocked(p),
    submittedAt: p.submitted_at,
    updatedAt: req?.updated_at ?? p.updated_at,
    draft,
  };
}

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; status: number; message: string };

async function writeDraft(p: ProjectRow, draft: Draft): Promise<string> {
  const now = new Date().toISOString();
  const { error: e1 } = await db()
    .from("requirements")
    .upsert(
      { project_id: p.id, answers: draft.answers, current_step: draft.currentStep },
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
  return now;
}

async function guard(token: string): Promise<{ p: ProjectRow } | { err: SaveResult }> {
  const p = await getProject(token);
  if (!p) return { err: { ok: false, status: 404, message: "This link is not recognised." } };
  if (isLocked(p)) return { err: { ok: false, status: 409, message: "These requirements have already been submitted." } };
  if (isExpired(p)) return { err: { ok: false, status: 410, message: "This link has expired." } };
  return { p };
}

export async function saveDraft(token: string, draft: Draft): Promise<SaveResult> {
  const g = await guard(token);
  if ("err" in g) return g.err;
  const updatedAt = await writeDraft(g.p, draft);
  if (g.p.status === "invited") {
    await db().from("projects").update({ status: "in_progress" }).eq("id", g.p.id);
  }
  return { ok: true, updatedAt };
}

export async function submitDraft(token: string, draft: Draft): Promise<SaveResult> {
  const g = await guard(token);
  if ("err" in g) return g.err;
  await writeDraft(g.p, draft);
  const submittedAt = new Date().toISOString();
  const { error } = await db()
    .from("projects")
    .update({ status: "submitted", submitted_at: submittedAt })
    .eq("id", g.p.id)
    .in("status", ["invited", "in_progress"]);
  if (error) throw new Error(`submit failed: ${error.message}`);
  return { ok: true, updatedAt: submittedAt };
}
