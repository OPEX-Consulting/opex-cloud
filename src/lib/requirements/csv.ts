import { emptyServer, type ServerKind, type ServerRow } from "./schema";

/* Tiny RFC 4180-style CSV helpers (no external libraries). */

type Col = { key: keyof ServerRow | "disks"; header: string; kinds: ServerKind[]; numeric?: boolean };

const ALL: ServerKind[] = ["linux", "windows", "physical"];

export const CSV_COLUMNS: Col[] = [
  { key: "vcpu", header: "vcpu_or_cores", kinds: ALL, numeric: true },
  { key: "ramGib", header: "ram_gib", kinds: ALL, numeric: true },
  { key: "bootGib", header: "boot_gib", kinds: ALL, numeric: true },
  { key: "os", header: "os", kinds: ALL },
  { key: "osVersion", header: "os_version", kinds: ["linux"] },
  { key: "osType", header: "os_type", kinds: ["physical"] },
  { key: "publicIps", header: "public_ips", kinds: ALL, numeric: true },
  { key: "kernel", header: "kernel", kinds: ["linux"] },
  { key: "hostname", header: "hostname", kinds: ALL },
  { key: "role", header: "role", kinds: ALL },
  { key: "hypervisor", header: "hypervisor", kinds: ["linux", "windows"] },
  { key: "drProtect", header: "dr_protect", kinds: ALL },
  { key: "disks", header: "extra_disks_gib", kinds: ALL },
  { key: "fstab", header: "fstab", kinds: ["linux"] },
  { key: "lsblk", header: "lsblk", kinds: ["linux"] },
];

export const columnsFor = (kind: ServerKind) => CSV_COLUMNS.filter((c) => c.kinds.includes(kind));

const EXAMPLES: Record<ServerKind, Record<string, string>> = {
  linux: {
    vcpu_or_cores: "2", ram_gib: "4", boot_gib: "160", os: "Ubuntu", os_version: "22.04",
    public_ips: "1", kernel: "5.15.0-91-generic", hostname: "app-01", role: "App",
    hypervisor: "VMware 6.x", dr_protect: "Prod site", extra_disks_gib: "100;200", fstab: "", lsblk: "",
  },
  windows: {
    vcpu_or_cores: "2", ram_gib: "4", boot_gib: "160", os: "Win Server 2016 Std Edition",
    public_ips: "1", hostname: "win-app-01", role: "App", hypervisor: "VMware 6.x",
    dr_protect: "Prod site", extra_disks_gib: "60",
  },
  physical: {
    vcpu_or_cores: "4", ram_gib: "12", boot_gib: "4200", os: "Win Server 2019 Std Edition",
    os_type: "x64", public_ips: "1", hostname: "db-phys-01", role: "DB", dr_protect: "Both",
    extra_disks_gib: "",
  },
};

const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function csvTemplate(kind: ServerKind) {
  const cols = columnsFor(kind);
  const header = cols.map((c) => c.header).join(",");
  const ex = cols.map((c) => esc(EXAMPLES[kind][c.header] ?? "")).join(",");
  return `${header}\r\n${ex}\r\n`;
}

export function rowsToCsv(kind: ServerKind, rows: ServerRow[]) {
  const cols = columnsFor(kind);
  const lines = [cols.map((c) => c.header).join(",")];
  for (const r of rows) {
    lines.push(
      cols
        .map((c) => {
          if (c.key === "disks") return esc(r.disks.join(";"));
          const v = r[c.key as keyof ServerRow];
          return esc(v == null ? "" : String(v));
        })
        .join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}

export function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQ = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQ) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      out.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    out.push(row);
  }
  return out.filter((r) => r.some((c) => c.trim() !== ""));
}

export type CsvImport = { rows: ServerRow[]; errors: string[]; skippedExample: boolean };

const toNum = (v: string): number | null | "bad" => {
  const t = v.trim().replace(/,/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : "bad";
};

export function csvToRows(kind: ServerKind, text: string, maxRows = 2000): CsvImport {
  const grid = parseCsv(text);
  const errors: string[] = [];
  if (grid.length < 2) return { rows: [], errors: ["The file has no data rows."], skippedExample: false };
  const header = grid[0].map((h) => h.trim().toLowerCase());
  const cols = columnsFor(kind);
  const idx = new Map<string, number>();
  cols.forEach((c) => {
    const i = header.indexOf(c.header);
    if (i >= 0) idx.set(c.header, i);
  });
  if (!idx.has("vcpu_or_cores") && !idx.has("ram_gib"))
    return {
      rows: [],
      errors: ["Column headings not recognised – please start from the template."],
      skippedExample: false,
    };

  const rows: ServerRow[] = [];
  let skippedExample = false;
  const ex = EXAMPLES[kind];
  grid.slice(1).forEach((cells, n) => {
    const line = n + 2;
    const get = (h: string) => {
      const i = idx.get(h);
      return i == null ? "" : (cells[i] ?? "").trim();
    };
    // Skip the template's example row if it was left in.
    if (get("hostname") === ex.hostname && get("os") === ex.os) {
      skippedExample = true;
      return;
    }
    if (rows.length >= maxRows) return;
    const r = emptyServer();
    for (const c of cols) {
      const raw = get(c.header);
      if (c.key === "disks") {
        const parts = raw.split(/[;|]/).map((p) => p.trim()).filter(Boolean);
        const nums = parts.map((p) => toNum(p));
        if (nums.some((x) => x === "bad")) errors.push(`Row ${line}: extra disks should be numbers separated by “;”.`);
        r.disks = nums.filter((x): x is number => typeof x === "number").slice(0, 64);
      } else if (c.numeric) {
        const v = toNum(raw);
        if (v === "bad") errors.push(`Row ${line}: “${raw}” in ${c.header} is not a number.`);
        else (r as Record<string, unknown>)[c.key] = v;
      } else {
        (r as Record<string, unknown>)[c.key] = raw.slice(0, c.key === "fstab" || c.key === "lsblk" ? 20000 : 250);
      }
    }
    rows.push(r);
  });
  if (grid.length - 1 > maxRows) errors.push(`Only the first ${maxRows} rows were read.`);
  return { rows, errors, skippedExample };
}
