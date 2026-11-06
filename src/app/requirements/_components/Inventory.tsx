"use client";

import { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import {
  FiChevronDown,
  FiCopy,
  FiDownload,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  DR_PROTECT,
  BACKUP_OPTIONS,
  REPLICATION_OPTIONS,
  HYPERVISORS,
  LINUX_OS,
  OS_TYPES,
  OTHER,
  PHYSICAL_OS_GROUPS,
  SERVER_ROLES,
  WINDOWS_OS,
  optionLabel,
} from "@/lib/requirements/options";
import {
  MAX_SERVERS_PER_KIND,
  emptyServer,
  newServerId,
  type Answers,
  type ServerKind,
  type ServerRow,
  type Servers,
} from "@/lib/requirements/schema";
import { KIND_LABELS, fmt, overallTotals, totalsFor, type Totals } from "@/lib/requirements/logic";
import { csvTemplate, csvToRows, columnsFor, type CsvImport } from "@/lib/requirements/csv";
import { NotSureCheck, NumberInput, SelectInput, StepHeader, Tooltip, inputCls } from "./ui";
import type { Patch } from "./Steps";
import { isDrUseCase } from "@/lib/pricing/fromRequirements";

const KINDS: ServerKind[] = ["linux", "windows", "physical"];

const EXAMPLE_ROWS: Record<ServerKind, string[][]> = {
  linux: [
    ["2", "4", "160", "Ubuntu", "1", "Example server 1", "App", "VMware 6.x", "Prod site"],
    ["2", "4", "60", "CentOS", "0", "Example server 2", "App", "VMware 6.x", "Prod site"],
  ],
  windows: [
    ["2", "4", "160", "Win Server 2016", "1", "Example server 1", "App", "VMware 6.x", "Prod site"],
    ["2", "4", "60", "Win Server 2016", "0", "Example server 2", "App", "VMware 6.x", "Prod site"],
  ],
  physical: [
    ["4", "12", "4,200", "Windows", "1", "Example server 1", "DB", "—", "Both"],
    ["4", "12", "4,200", "Windows", "0", "Example server 2", "App", "—", "Prod site"],
  ],
};

const cellCls =
  "h-9 w-full min-w-0 rounded-lg border border-transparent bg-transparent px-2 text-[13px] text-opex-navy outline-none transition-colors placeholder:text-[#b6bfcc] hover:border-border focus:border-opex-blue focus:bg-white focus:ring-2 focus:ring-opex-blue/15";

const osOptions = (kind: ServerKind) => (kind === "linux" ? LINUX_OS : kind === "windows" ? WINDOWS_OS : undefined);
const cpuLabel = (kind: ServerKind) => (kind === "physical" ? "CPU cores" : "vCPU");

function CellNum({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      aria-label={label}
      placeholder={placeholder}
      value={value ?? ""}
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      onChange={(e) => {
        const t = e.target.value.trim();
        const n = t === "" ? null : Number(t);
        onChange(n == null || !Number.isFinite(n) || n < 0 ? null : n);
      }}
      className={`${cellCls} text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
    />
  );
}

function CellSelect({
  value,
  onChange,
  label,
  kind,
  field,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  kind: ServerKind;
  field: "os" | "role" | "hypervisor" | "drProtect" | "backup" | "replication";
}) {
  const opts =
    field === "os"
      ? osOptions(kind)
      : field === "role"
        ? SERVER_ROLES
        : field === "hypervisor"
          ? HYPERVISORS
          : field === "backup"
            ? BACKUP_OPTIONS
            : field === "replication"
              ? REPLICATION_OPTIONS
              : DR_PROTECT;
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${cellCls} cursor-pointer pr-1 ${value ? "" : "text-[#b6bfcc]"}`}
    >
      <option value="">Select…</option>
      {opts?.map((o) => (
        <option key={o.value} value={o.value} className="text-opex-navy">
          {optionLabel(o)}
        </option>
      ))}
      {field === "os" &&
        kind === "physical" &&
        PHYSICAL_OS_GROUPS.map((g) => (
          <optgroup key={g.group} label={g.group}>
            {g.options.map((o) => (
              <option key={`${g.group}-${o.value}`} value={o.value} className="text-opex-navy">
                {optionLabel(o)}
              </option>
            ))}
          </optgroup>
        ))}
    </select>
  );
}

function roleHint(role: string) {
  return SERVER_ROLES.find((r) => r.value === role)?.hint;
}

/* ---------------- Row details (disks, Linux extras, "other" text) ---------------- */

function RowDetails({ kind, row, update }: { kind: ServerKind; row: ServerRow; update: (p: Partial<ServerRow>) => void }) {
  const id = useId();
  const smallLabel = "text-xs font-semibold text-[#27364c]";
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <p className={smallLabel}>
          Extra disks (GiB)
          <Tooltip text="Data disks in addition to the boot volume, e.g. a 500 GiB data drive. Add one per disk." />
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {row.disks.map((d, i) => (
            <div key={i} className="flex items-center rounded-lg border border-border bg-white pr-1">
              <span className="pl-2 text-[11px] font-semibold text-muted">D{i + 1}</span>
              <input
                type="number"
                min={0}
                aria-label={`Disk ${i + 1} size in GiB`}
                value={d}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  const next = [...row.disks];
                  next[i] = Number.isFinite(n) && n >= 0 ? n : 0;
                  update({ disks: next });
                }}
                className="h-9 w-20 bg-transparent px-2 text-right text-[13px] tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label={`Remove disk ${i + 1}`}
                onClick={() => update({ disks: row.disks.filter((_, j) => j !== i) })}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-secondary hover:text-opex-navy"
              >
                <FiX aria-hidden className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {row.disks.length < 64 && (
            <button
              type="button"
              onClick={() => update({ disks: [...row.disks, 0] })}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-dashed border-border-hover px-3 text-xs font-semibold text-opex-blue hover:bg-surface-blue"
            >
              <FiPlus aria-hidden /> Add disk
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {row.os === OTHER || row.os.endsWith("(other)") ? (
          <label className="block">
            <span className={smallLabel}>Which operating system?</span>
            <input className={`${inputCls} mt-1.5`} value={row.osOther} onChange={(e) => update({ osOther: e.target.value })} />
          </label>
        ) : null}
        {row.role === OTHER && (
          <label className="block">
            <span className={smallLabel}>Describe the role</span>
            <input className={`${inputCls} mt-1.5`} value={row.roleOther} onChange={(e) => update({ roleOther: e.target.value })} />
          </label>
        )}
        {row.hypervisor === OTHER && (
          <label className="block">
            <span className={smallLabel}>Which hypervisor?</span>
            <input className={`${inputCls} mt-1.5`} value={row.hypervisorOther} onChange={(e) => update({ hypervisorOther: e.target.value })} />
          </label>
        )}
        {kind === "physical" && (
          <label className="block">
            <span className={smallLabel}>
              Architecture
              <Tooltip text="Most servers are x64. GPU and ARM servers need special hardware – let us know early." />
            </span>
            <SelectInput value={row.osType} onChange={(v) => update({ osType: v })} options={OS_TYPES} className="mt-1.5" />
          </label>
        )}
      </div>

      {kind === "linux" && (
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
          <label className="block">
            <span className={smallLabel}>
              Kernel version <span className="font-normal text-muted">(optional)</span>
            </span>
            <span className="mt-0.5 block text-[11px] text-muted">
              Run <code className="rounded bg-surface-secondary px-1 font-mono">uname -r</code>
            </span>
            <input className={`${inputCls} mt-1.5 font-mono`} placeholder="5.15.0-91-generic" value={row.kernel} onChange={(e) => update({ kernel: e.target.value })} />
          </label>
          <label className="block" htmlFor={`${id}-fs`}>
            <span className={smallLabel}>
              fstab <span className="font-normal text-muted">(optional – paste command output)</span>
            </span>
            <span className="mt-0.5 block text-[11px] text-muted">
              Run <code className="rounded bg-surface-secondary px-1 font-mono">cat /etc/fstab</code>
            </span>
            <textarea id={`${id}-fs`} rows={4} spellCheck={false} className={`${inputCls} mt-1.5 font-mono text-xs`} value={row.fstab} onChange={(e) => update({ fstab: e.target.value })} />
          </label>
          <label className="block" htmlFor={`${id}-ls`}>
            <span className={smallLabel}>
              lsblk <span className="font-normal text-muted">(optional – paste command output)</span>
            </span>
            <span className="mt-0.5 block text-[11px] text-muted">
              Run <code className="rounded bg-surface-secondary px-1 font-mono">lsblk</code>
            </span>
            <textarea id={`${id}-ls`} rows={4} spellCheck={false} className={`${inputCls} mt-1.5 font-mono text-xs`} value={row.lsblk} onChange={(e) => update({ lsblk: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );
}

/* ---------------- Duplicate control ---------------- */

function DuplicateButton({ onDuplicate, label }: { onDuplicate: (n: number) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Duplicate ${label}`}
        aria-expanded={open}
        title="Duplicate"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-secondary hover:text-opex-navy"
      >
        <FiCopy aria-hidden className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-9 z-30 w-56 rounded-xl border border-border bg-white p-3 shadow-[0_12px_40px_rgb(7_21_47/14%)]"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <label className="block text-xs font-semibold text-[#27364c]">
            How many identical copies?
            <input
              type="number"
              min={1}
              max={200}
              autoFocus
              value={n}
              onChange={(e) => setN(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className={`${inputCls} mt-1.5`}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              onDuplicate(n);
              setOpen(false);
              setN(1);
            }}
            className="mt-2 w-full rounded-lg bg-opex-navy py-2 text-xs font-semibold text-white hover:bg-opex-navy-light"
          >
            Add {n} {n === 1 ? "copy" : "copies"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Desktop row ---------------- */

type RowProps = {
  kind: ServerKind;
  row: ServerRow;
  index: number;
  update: (id: string, p: Partial<ServerRow>) => void;
  remove: (id: string) => void;
  duplicate: (id: string, n: number) => void;
};

const TableRow = memo(function TableRow({ kind, row, index, update, remove, duplicate }: RowProps) {
  const [open, setOpen] = useState(false);
  const u = (p: Partial<ServerRow>) => update(row.id, p);
  const name = row.hostname || `server ${index + 1}`;
  const incomplete = row.vcpu == null || row.ramGib == null || row.bootGib == null || !row.os;
  const colCount = kind === "linux" ? 15 : kind === "windows" ? 14 : 13;
  const noProtection = !row.backup || !row.replication;
  const detailCount = row.disks.length;
  return (
    <>
      <tr className="group border-t border-border hover:bg-[#fbfcfe]">
        <td className="px-2 py-1 text-center text-xs tabular-nums text-muted">
          <span className="inline-flex items-center gap-1">
            {incomplete && <span className="h-1.5 w-1.5 rounded-full bg-[#e0a46b]" title="Some details missing" />}
            {index + 1}
          </span>
        </td>
        <td className="w-[72px] px-1 py-1">
          <CellNum label={`${cpuLabel(kind)} for ${name}`} value={row.vcpu} onChange={(v) => u({ vcpu: v })} placeholder={kind === "physical" ? "4" : "2"} />
        </td>
        <td className="w-[80px] px-1 py-1">
          <CellNum label={`RAM GiB for ${name}`} value={row.ramGib} onChange={(v) => u({ ramGib: v })} placeholder={kind === "physical" ? "12" : "4"} />
        </td>
        <td className="w-[88px] px-1 py-1">
          <CellNum label={`Boot volume GiB for ${name}`} value={row.bootGib} onChange={(v) => u({ bootGib: v })} placeholder="160" />
        </td>
        <td className="min-w-[150px] px-1 py-1">
          <CellSelect kind={kind} field="os" label={`Operating system for ${name}`} value={row.os} onChange={(v) => u({ os: v })} />
        </td>
        {kind === "linux" && (
          <td className="min-w-[90px] px-1 py-1">
            <input aria-label={`OS version for ${name}`} className={cellCls} placeholder="22.04" value={row.osVersion} onChange={(e) => u({ osVersion: e.target.value })} />
          </td>
        )}
        <td className="w-[64px] px-1 py-1">
          <CellNum label={`Public IPs for ${name}`} value={row.publicIps} onChange={(v) => u({ publicIps: v })} placeholder="1" />
        </td>
        <td className="min-w-[130px] px-1 py-1">
          <input aria-label={`Hostname for server ${index + 1}`} className={cellCls} placeholder="optional" value={row.hostname} onChange={(e) => u({ hostname: e.target.value })} />
        </td>
        <td className="min-w-[120px] px-1 py-1" title={roleHint(row.role)}>
          <CellSelect kind={kind} field="role" label={`Role for ${name}`} value={row.role} onChange={(v) => u({ role: v })} />
        </td>
        {kind !== "physical" && (
          <td className="min-w-[130px] px-1 py-1">
            <CellSelect kind={kind} field="hypervisor" label={`Current hypervisor for ${name}`} value={row.hypervisor} onChange={(v) => u({ hypervisor: v })} />
          </td>
        )}
        <td className="min-w-[110px] px-1 py-1">
          <CellSelect kind={kind} field="drProtect" label={`DR protect for ${name}`} value={row.drProtect} onChange={(v) => u({ drProtect: v })} />
        </td>
        <td className={`min-w-[78px] px-1 py-1 ${noProtection && !row.backup ? "bg-[#fdf6f2]" : ""}`}>
          <CellSelect kind={kind} field="backup" label={`Managed backup for ${name}`} value={row.backup} onChange={(v) => u({ backup: v })} />
        </td>
        <td className={`min-w-[128px] px-1 py-1 ${noProtection && !row.replication ? "bg-[#fdf6f2]" : ""}`}>
          <CellSelect kind={kind} field="replication" label={`Replication for ${name}`} value={row.replication} onChange={(v) => u({ replication: v })} />
        </td>
        <td className="px-1 py-1">
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} disks and details for ${name}`}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-opex-blue hover:bg-surface-blue"
          >
            {detailCount ? `${detailCount} disk${detailCount === 1 ? "" : "s"}` : "Disks"}
            {kind === "linux" ? " & more" : ""}
            <FiChevronDown aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </td>
        <td className="px-1 py-1">
          <div className="flex items-center justify-end gap-0.5">
            <DuplicateButton label={name} onDuplicate={(n) => duplicate(row.id, n)} />
            <button
              type="button"
              aria-label={`Delete ${name}`}
              title="Delete"
              onClick={() => remove(row.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-[#fdf1ec] hover:text-[#b4532a]"
            >
              <FiTrash2 aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr className="bg-surface-secondary/60">
          <td />
          <td colSpan={colCount - 1} className="px-2 pb-4 pt-3">
            <RowDetails kind={kind} row={row} update={u} />
          </td>
        </tr>
      )}
    </>
  );
});

/* ---------------- Mobile card ---------------- */

const RowCard = memo(function RowCard({ kind, row, index, update, remove, duplicate }: RowProps) {
  const [open, setOpen] = useState(false);
  const u = (p: Partial<ServerRow>) => update(row.id, p);
  const name = row.hostname || `Server ${index + 1}`;
  const lbl = "text-[11px] font-semibold uppercase tracking-wide text-muted";
  return (
    <li className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-bold text-opex-navy">
          <span className="mr-1.5 text-xs font-semibold text-muted">#{index + 1}</span>
          {name}
        </p>
        <div className="flex items-center">
          <DuplicateButton label={name} onDuplicate={(n) => duplicate(row.id, n)} />
          <button
            type="button"
            aria-label={`Delete ${name}`}
            onClick={() => remove(row.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-[#fdf1ec] hover:text-[#b4532a]"
          >
            <FiTrash2 aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <label>
          <span className={lbl}>{cpuLabel(kind)}</span>
          <NumberInput value={row.vcpu} onChange={(v) => u({ vcpu: v })} placeholder={kind === "physical" ? "4" : "2"} />
        </label>
        <label>
          <span className={lbl}>RAM GiB</span>
          <NumberInput value={row.ramGib} onChange={(v) => u({ ramGib: v })} placeholder="4" />
        </label>
        <label>
          <span className={lbl}>Boot GiB</span>
          <NumberInput value={row.bootGib} onChange={(v) => u({ bootGib: v })} placeholder="160" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="col-span-2">
          <span className={lbl}>Operating system</span>
          <SelectInput
            value={row.os}
            onChange={(v) => u({ os: v })}
            options={osOptions(kind)}
            groups={kind === "physical" ? PHYSICAL_OS_GROUPS : undefined}
          />
        </label>
        {kind === "linux" && (
          <label>
            <span className={lbl}>OS version</span>
            <input className={inputCls} placeholder="22.04" value={row.osVersion} onChange={(e) => u({ osVersion: e.target.value })} />
          </label>
        )}
        <label>
          <span className={lbl}>Public IPs</span>
          <NumberInput value={row.publicIps} onChange={(v) => u({ publicIps: v })} placeholder="1" />
        </label>
        <label className={kind === "linux" ? "col-span-2" : ""}>
          <span className={lbl}>Hostname (optional)</span>
          <input className={inputCls} value={row.hostname} onChange={(e) => u({ hostname: e.target.value })} />
        </label>
        <label className="col-span-2">
          <span className={lbl}>Role</span>
          <SelectInput value={row.role} onChange={(v) => u({ role: v })} options={SERVER_ROLES} />
          {roleHint(row.role) && <span className="mt-1 block text-[11px] text-muted">e.g. {roleHint(row.role)}</span>}
        </label>
        {kind !== "physical" && (
          <label>
            <span className={lbl}>Hypervisor</span>
            <SelectInput value={row.hypervisor} onChange={(v) => u({ hypervisor: v })} options={HYPERVISORS} />
          </label>
        )}
        <label className={kind === "physical" ? "col-span-2" : ""}>
          <span className={lbl}>DR protect</span>
          <SelectInput value={row.drProtect} onChange={(v) => u({ drProtect: v })} options={DR_PROTECT} />
        </label>
        <label>
          <span className={lbl}>Managed backup</span>
          <SelectInput value={row.backup} onChange={(v) => u({ backup: v })} options={BACKUP_OPTIONS} invalid={!row.backup} />
        </label>
        <label>
          <span className={lbl}>Replication</span>
          <SelectInput value={row.replication} onChange={(v) => u({ replication: v })} options={REPLICATION_OPTIONS} invalid={!row.replication} />
        </label>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-opex-blue"
      >
        {row.disks.length ? `${row.disks.length} extra disk${row.disks.length === 1 ? "" : "s"}` : "Extra disks"}
        {kind === "linux" ? ", kernel, fstab & lsblk" : " & details"}
        <FiChevronDown aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 border-t border-border pt-3">
          <RowDetails kind={kind} row={row} update={u} />
        </div>
      )}
    </li>
  );
});

/* ---------------- CSV import preview ---------------- */

function CsvPreview({
  kind,
  result,
  fileName,
  onCancel,
  onImport,
  existing,
}: {
  kind: ServerKind;
  result: CsvImport;
  fileName: string;
  onCancel: () => void;
  onImport: (mode: "append" | "replace") => void;
  existing: number;
}) {
  const cols = columnsFor(kind).filter((c) => c.key !== "fstab" && c.key !== "lsblk");
  const t = totalsFor(result.rows);
  return (
    <div role="region" aria-label="CSV import preview" className="rounded-2xl border border-opex-blue/40 bg-surface-blue p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-opex-navy">Preview: {fileName}</p>
          <p className="mt-0.5 text-xs text-secondary">
            {result.rows.length} server{result.rows.length === 1 ? "" : "s"} found · {fmt(t.cpu)} {kind === "physical" ? "cores" : "vCPU"} · {fmt(t.ram)} GiB RAM ·{" "}
            {fmt(t.storage)} GiB storage
            {result.skippedExample && " · the template's example row was skipped"}
          </p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Cancel import" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white">
          <FiX aria-hidden />
        </button>
      </div>
      {result.errors.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-[#fdf6ec] px-4 py-3 text-xs text-[#8a4b12]">
          {result.errors.slice(0, 8).map((e) => (
            <li key={e}>{e}</li>
          ))}
          {result.errors.length > 8 && <li>…and {result.errors.length - 8} more.</li>}
        </ul>
      )}
      {result.rows.length > 0 && (
        <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-border bg-white">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-surface-secondary">
              <tr>
                <th className="px-2 py-2 font-semibold text-muted">#</th>
                {cols.map((c) => (
                  <th key={c.header} className="whitespace-nowrap px-2 py-2 font-semibold text-muted">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, 100).map((r, i) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-2 py-1.5 text-muted">{i + 1}</td>
                  {cols.map((c) => {
                    const v = c.key === "disks" ? r.disks.join("; ") : r[c.key as keyof ServerRow];
                    return (
                      <td key={c.header} className="whitespace-nowrap px-2 py-1.5 text-opex-navy">
                        {v == null || v === "" ? <span className="text-[#b6bfcc]">—</span> : String(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {result.rows.length > 100 && <p className="px-3 py-2 text-xs text-muted">Showing the first 100 rows.</p>}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={!result.rows.length} onClick={() => onImport("append")} className="opex-button-primary !min-h-[40px] disabled:opacity-50">
          Add {result.rows.length} server{result.rows.length === 1 ? "" : "s"}
        </button>
        {existing > 0 && result.rows.length > 0 && (
          <button type="button" onClick={() => onImport("replace")} className="opex-button-secondary !min-h-[40px]">
            Replace the {existing} existing
          </button>
        )}
        <button type="button" onClick={onCancel} className="px-3 text-sm font-semibold text-secondary hover:text-opex-navy">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------------- Totals bar ---------------- */

function TotalsLine({ t, kind }: { t: Totals; kind?: ServerKind }) {
  const items: [string, string][] = [
    [kind === "physical" ? "Cores" : kind ? "vCPU" : "vCPU/cores", fmt(t.cpu)],
    ["RAM", `${fmt(t.ram)} GiB`],
    ["Storage", `${fmt(t.storage)} GiB`],
    ["Servers", fmt(t.count)],
    ["Public IPs", fmt(t.publicIps)],
  ];
  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-1">
      {items.map(([k, v]) => (
        <div key={k} className="flex items-baseline gap-1.5">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-white/60">{k}</dt>
          <dd className="text-sm font-bold tabular-nums text-white">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- Main ---------------- */

export function Inventory({
  servers,
  setServers,
  a,
  patch,
  errors,
}: {
  servers: Servers;
  setServers: (fn: (s: Servers) => Servers) => void;
  a: Answers;
  patch: Patch;
  errors: Record<string, string>;
}) {
  const [kind, setKind] = useState<ServerKind>("linux");
  const [addQty, setAddQty] = useState(1);
  const [toast, setToast] = useState<{ row: ServerRow; kind: ServerKind; index: number } | null>(null);
  const [csv, setCsv] = useState<{ result: CsvImport; fileName: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tabsId = useId();
  const rows = servers[kind];
  const cap = (n: number) => Math.max(0, Math.min(n, MAX_SERVERS_PER_KIND - rows.length));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const update = useCallback(
    (id: string, p: Partial<ServerRow>) =>
      setServers((s) => ({ ...s, [kind]: s[kind].map((r) => (r.id === id ? { ...r, ...p } : r)) })),
    [kind, setServers],
  );

  const remove = useCallback(
    (id: string) => {
      const index = rowsRef.current.findIndex((r) => r.id === id);
      if (index < 0) return;
      const row = rowsRef.current[index];
      setServers((s) => ({ ...s, [kind]: s[kind].filter((r) => r.id !== id) }));
      setToast({ row, kind, index });
    },
    [kind, setServers],
  );

  const undo = () => {
    if (!toast) return;
    const { row, kind: k, index } = toast;
    setServers((s) => {
      const list = [...s[k]];
      list.splice(Math.min(index, list.length), 0, row);
      return { ...s, [k]: list };
    });
    setToast(null);
  };

  const duplicate = useCallback(
    (id: string, n: number) => {
      setServers((s) => {
        const list = s[kind];
        const i = list.findIndex((r) => r.id === id);
        if (i < 0) return s;
        const copies = Array.from({ length: Math.max(0, Math.min(n, MAX_SERVERS_PER_KIND - list.length)) }, () => ({
          ...list[i],
          disks: [...list[i].disks],
          hostname: "",
          id: newServerId(),
        }));
        return { ...s, [kind]: [...list.slice(0, i + 1), ...copies, ...list.slice(i + 1)] };
      });
    },
    [kind, setServers],
  );

  const dr = isDrUseCase(a);
  const add = () => {
    const n = cap(addQty);
    // Smart default: a DR use case pre-selects Active-passive replication for new servers.
    const fresh = () => ({ ...emptyServer(), replication: dr ? "Active-passive" : "" });
    setServers((s) => ({ ...s, [kind]: [...s[kind], ...Array.from({ length: n }, fresh)] }));
    setAddQty(1);
  };

  const [bulkBackup, setBulkBackup] = useState("");
  const [bulkRep, setBulkRep] = useState(dr ? "Active-passive" : "");
  const totalServers = servers.linux.length + servers.windows.length + servers.physical.length;
  const applyToAll = () => {
    if (!bulkBackup && !bulkRep) return;
    const patchRow = (r: ServerRow) => ({ ...r, ...(bulkBackup ? { backup: bulkBackup } : {}), ...(bulkRep ? { replication: bulkRep } : {}) });
    setServers((s) => ({ linux: s.linux.map(patchRow), windows: s.windows.map(patchRow), physical: s.physical.map(patchRow) }));
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate(kind)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `opex-cloud-${kind}-servers-template.csv`;
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 3_000_000) {
      setCsv({ fileName: f.name, result: { rows: [], errors: ["That file is larger than 3 MB."], skippedExample: false } });
      return;
    }
    const text = await f.text();
    setCsv({ fileName: f.name, result: csvToRows(kind, text, MAX_SERVERS_PER_KIND) });
    if (fileRef.current) fileRef.current.value = "";
  };

  const doImport = (mode: "append" | "replace") => {
    if (!csv) return;
    setServers((s) => ({
      ...s,
      [kind]:
        mode === "replace"
          ? csv.result.rows.slice(0, MAX_SERVERS_PER_KIND)
          : [...s[kind], ...csv.result.rows].slice(0, MAX_SERVERS_PER_KIND),
    }));
    setCsv(null);
  };

  const tabTotals = totalsFor(rows);
  const all = overallTotals(servers);
  const headers: { label: string; tip?: string; right?: boolean }[] = [
    { label: "#" },
    { label: cpuLabel(kind), right: true, tip: kind === "physical" ? "Physical CPU cores." : "Virtual CPUs allocated to the VM." },
    { label: "RAM GiB", right: true },
    { label: "Boot GiB", right: true, tip: "Size of the boot/system volume (Disk 0). Add data disks under ‘Disks’." },
    { label: kind === "physical" ? "O/S" : "Guest O/S", tip: "Operating system determines licensing on the target." },
    ...(kind === "linux" ? [{ label: "OS version" }] : []),
    { label: "Public IPs", right: true, tip: "How many internet-facing IP addresses this server needs." },
    { label: "Hostname" },
    { label: "Role" },
    ...(kind !== "physical" ? [{ label: "Hypervisor", tip: "Where this VM runs today." }] : []),
    { label: "DR protect", tip: "Where the server should run: production site, DR site, or both." },
    { label: "Backup", tip: "Managed backup of this server (priced per protected server)." },
    { label: "Replication", tip: "None, Active-passive (a standby copy at a second site) or Active-active (both sites live)." },
    { label: "Disks" },
    { label: "" },
  ];

  return (
    <>
      <StepHeader
        index={4}
        title="Server inventory"
        intro="List the servers in scope – this is what we size the environment from. Totals update as you type. Use ‘Duplicate’ for identical servers, or import a spreadsheet."
      />

      <div role="tablist" aria-label="Server types" className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-white p-1">
        {KINDS.map((k) => (
          <button
            key={k}
            role="tab"
            id={`${tabsId}-${k}`}
            aria-selected={kind === k}
            aria-controls={`${tabsId}-panel`}
            onClick={() => {
              setKind(k);
              setCsv(null);
            }}
            className={`flex min-h-[42px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-[13px] font-semibold transition-colors ${
              kind === k ? "bg-opex-navy text-white" : "text-secondary hover:bg-surface-secondary hover:text-opex-navy"
            }`}
          >
            {KIND_LABELS[k]}
            <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${kind === k ? "bg-white/15" : "bg-surface-secondary"}`}>
              {servers[k].length}
            </span>
          </button>
        ))}
      </div>

      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${kind}`} className="mt-4 grid gap-4">
        <p className="text-xs leading-5 text-muted">
          {kind === "physical"
            ? "Physical servers that may move to virtual machines. Disks, roles and DR choices are optional but helpful."
            : `${kind === "linux" ? "Linux" : "Windows"} virtual machines. First priority: CPU, RAM, storage, OS and public IPs. Names, roles and hypervisor help us plan.`}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-border bg-white">
            <label htmlFor={`${tabsId}-qty`} className="sr-only">
              Number of servers to add
            </label>
            <input
              id={`${tabsId}-qty`}
              type="number"
              min={1}
              max={200}
              value={addQty}
              onChange={(e) => setAddQty(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className="h-10 w-14 rounded-l-xl bg-transparent text-center text-sm font-semibold tabular-nums outline-none focus:ring-2 focus:ring-opex-blue/20"
            />
            <button type="button" onClick={add} className="inline-flex h-10 items-center gap-1.5 rounded-r-xl bg-opex-navy px-4 text-[13px] font-semibold text-white hover:bg-opex-navy-light">
              <FiPlus aria-hidden /> Add {addQty === 1 ? "server" : `${addQty} servers`}
            </button>
          </div>
          <button type="button" onClick={downloadTemplate} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-[13px] font-semibold text-opex-navy hover:border-border-hover">
            <FiDownload aria-hidden /> CSV template
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-[13px] font-semibold text-opex-navy hover:border-border-hover">
            <FiUpload aria-hidden /> Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Upload a CSV file of servers" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>

        {totalServers > 0 && (
          <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-white p-3">
            <p className="w-full text-xs font-semibold text-opex-navy">
              Backup &amp; replication for all {totalServers} server{totalServers === 1 ? "" : "s"}
              <span className="ml-1 font-normal text-muted">
                {dr ? "· You chose disaster recovery, so Active-passive is suggested." : "· Set once here, then adjust individual servers below."}
              </span>
            </p>
            <label className="min-w-[140px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Managed backup</span>
              <SelectInput value={bulkBackup} onChange={setBulkBackup} options={BACKUP_OPTIONS} placeholder="Leave as is" />
            </label>
            <label className="min-w-[180px]">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Replication</span>
              <SelectInput value={bulkRep} onChange={setBulkRep} options={REPLICATION_OPTIONS} placeholder="Leave as is" />
            </label>
            <button
              type="button"
              onClick={applyToAll}
              disabled={!bulkBackup && !bulkRep}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-opex-navy px-4 text-[13px] font-semibold text-white hover:bg-opex-navy-light disabled:opacity-50"
            >
              Apply to all servers
            </button>
          </div>
        )}

        {errors["servers-protection"] && (
          <p role="alert" className="text-xs font-medium text-[#b4532a]">
            {errors["servers-protection"]}. Use ‘Apply to all servers’ above, or choose per server (highlighted).
          </p>
        )}

        {csv && (
          <CsvPreview kind={kind} result={csv.result} fileName={csv.fileName} existing={rows.length} onCancel={() => setCsv(null)} onImport={doImport} />
        )}

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-hover bg-white p-4 sm:p-5">
            <p className="text-sm font-semibold text-opex-navy">No {KIND_LABELS[kind].toLowerCase()} yet</p>
            <p className="mt-0.5 text-xs text-muted">Add a server above, or upload a CSV. Here&apos;s what a completed row looks like:</p>
            <div aria-hidden className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs text-[#b0b9c6]">
                <thead>
                  <tr>
                    {[cpuLabel(kind), "RAM GiB", "Boot GiB", "O/S", "Public IPs", "Hostname", "Role", "Hypervisor", "DR protect"].map((h) => (
                      <th key={h} className="px-2 py-1.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="italic">
                  {EXAMPLE_ROWS[kind].map((r, i) => (
                    <tr key={i} className="border-t border-dashed border-border">
                      {r.map((c, j) => (
                        <td key={j} className="px-2 py-1.5">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-border bg-white lg:block">
              <table className="w-full text-left">
                <thead className="bg-surface-secondary">
                  <tr>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        scope="col"
                        className={`whitespace-nowrap px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted ${h.right ? "text-right" : ""}`}
                      >
                        {h.label}
                        {h.tip && <Tooltip text={h.tip} label={`About ${h.label}`} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <TableRow key={r.id} kind={kind} row={r} index={i} update={update} remove={remove} duplicate={duplicate} />
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="grid gap-3 lg:hidden">
              {rows.map((r, i) => (
                <RowCard key={r.id} kind={kind} row={r} index={i} update={update} remove={remove} duplicate={duplicate} />
              ))}
            </ul>
          </>
        )}

        {errors.servers && (
          <p role="alert" className="text-xs font-medium text-[#b4532a]">
            {errors.servers}
          </p>
        )}
        {errors[`servers-${kind}`] && (
          <p role="alert" className="text-xs font-medium text-[#b4532a]">
            Rows marked with an orange dot are missing CPU, RAM, boot volume or OS. Choose ‘Not sure’ for the OS if you don&apos;t know it.
          </p>
        )}

        <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
          <NotSureCheck
            checked={a.inventory.sendSeparately}
            onChange={(v) => patch("inventory", { sendSeparately: v })}
            label="I'll send the server inventory separately (e.g. an RVTools export) – I can't complete it here"
          />
          <label className="mt-4 block">
            <span className="text-[13px] font-semibold text-[#27364c]">
              Notes about your servers <span className="text-xs font-normal text-muted">(optional)</span>
            </span>
            <textarea
              rows={3}
              className={`${inputCls} mt-2`}
              value={a.inventory.notes}
              onChange={(e) => patch("inventory", { notes: e.target.value })}
              placeholder="e.g. clustered database pairs, licensing you'll bring yourself, servers to retire"
            />
          </label>
        </div>
      </div>

      {/* Sticky live totals */}
      <div className="sticky bottom-3 z-20 mt-6 rounded-2xl bg-opex-navy px-4 py-3 shadow-[0_12px_40px_rgb(7_21_47/25%)] sm:px-5">
        <div className="grid gap-2 md:grid-cols-[auto_1fr] md:items-center md:gap-x-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-opex-blue-light">{KIND_LABELS[kind]}</p>
          <TotalsLine t={tabTotals} kind={kind} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-opex-blue-light">All servers</p>
          <TotalsLine t={all} />
        </div>
        <p className="mt-1.5 text-[11px] text-white/50">Storage includes boot volumes and extra disks.</p>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-[#1b2333] px-4 py-3 text-sm text-white shadow-xl">
          <span>
            Deleted {toast.row.hostname || "server"}.
          </span>
          <button type="button" onClick={undo} className="font-semibold text-opex-blue-light underline-offset-4 hover:underline">
            Undo
          </button>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="text-white/60 hover:text-white">
            <FiX aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}

