"use client";

import { useId, type ReactNode } from "react";
import { FiCheck, FiInfo } from "react-icons/fi";
import { NOT_SURE, optionLabel, type Option, type OptionGroup } from "@/lib/requirements/options";

export const inputCls =
  "block min-h-[44px] w-full min-w-0 rounded-xl border border-[#dfe3ea] bg-white px-3 py-2.5 text-base leading-5 text-opex-navy outline-none transition-colors duration-200 placeholder:text-[#9aa3b2] hover:border-[#c5cedb] focus:border-opex-blue focus:ring-2 focus:ring-opex-blue/15 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-muted sm:text-sm";

export const errorInputCls = "border-[#d97757] focus:border-[#c2410c] focus:ring-[#c2410c]/15";

export function Tooltip({ text, label = "More information" }: { text: string; label?: string }) {
  const id = useId();
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:text-opex-blue focus-visible:text-opex-blue"
      >
        <FiInfo aria-hidden className="h-3.5 w-3.5" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2 rounded-lg bg-opex-navy px-3 py-2 text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  tip,
  error,
  required,
  optional,
  children,
  as = "div",
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  tip?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  as?: "div" | "fieldset";
}) {
  const head = (
    <>
      {label}
      {required && (
        <span className="ml-0.5 text-[#b4532a]" aria-hidden>
          *
        </span>
      )}
      {optional && <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span>}
    </>
  );
  const labelCls = "text-[13px] font-semibold leading-5 text-[#27364c] sm:text-sm";
  const body = (
    <>
      {hint && <p className="mt-0.5 text-xs leading-5 text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-[#b4532a]">
          {error}
        </p>
      )}
    </>
  );
  if (as === "fieldset") {
    return (
      <fieldset className="min-w-0">
        <legend className={labelCls}>
          {head}
          {tip && <Tooltip text={tip} />}
        </legend>
        {body}
      </fieldset>
    );
  }
  return (
    <div className="min-w-0">
      <div className="flex items-center">
        <label htmlFor={htmlFor} className={labelCls}>
          {head}
        </label>
        {tip && <Tooltip text={tip} />}
      </div>
      {body}
    </div>
  );
}

export function SelectInput({
  id,
  value,
  onChange,
  options,
  groups,
  placeholder = "Choose an option",
  className = "",
  ariaLabel,
  invalid,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options?: Option[];
  groups?: OptionGroup[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} appearance-none pr-9 ${value ? "" : "text-[#9aa3b2]"} ${invalid ? errorInputCls : ""} ${className}`}
      >
        <option value="">{placeholder}</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value} className="text-opex-navy">
            {optionLabel(o)}
          </option>
        ))}
        {groups?.map((g) => (
          <optgroup key={g.group} label={g.group}>
            {g.options.map((o) => (
              <option key={`${g.group}-${o.value}`} value={o.value} className="text-opex-navy">
                {optionLabel(o)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        fill="currentColor"
      >
        <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
      </svg>
    </div>
  );
}

export function parseNum(v: string): number | null {
  const t = v.replace(/,/g, "").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function NumberInput({
  id,
  value,
  onChange,
  suffix,
  placeholder,
  disabled,
  ariaLabel,
  min = 0,
  step = "any",
  className = "",
  invalid,
}: {
  id?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  min?: number;
  step?: string;
  className?: string;
  invalid?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(parseNum(e.target.value))}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        className={`${inputCls} ${suffix ? "pr-14" : ""} ${invalid ? errorInputCls : ""} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function NotSureCheck({
  checked,
  onChange,
  label = NOT_SURE,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[#c5cedb] accent-[#315caa]"
      />
      {label}
    </label>
  );
}

/** Single-choice cards (radio group). */
export function RadioCards({
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  columns?: 1 | 2 | 3;
}) {
  const grid = columns === 1 ? "" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div role="radiogroup" className={`grid gap-2.5 ${grid}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <label
            key={o.value}
            className={`relative flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-all duration-150 focus-within:ring-2 focus-within:ring-opex-blue/30 ${
              active
                ? "border-opex-blue bg-surface-blue shadow-[0_0_0_1px_rgb(49_92_170)]"
                : "border-border bg-white hover:border-border-hover"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={active}
              onChange={() => onChange(o.value)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#315caa]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-5 text-opex-navy">{optionLabel(o)}</span>
              {o.hint && <span className="mt-0.5 block text-xs leading-5 text-secondary">{o.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Multi-select chips (checkbox group). "Not sure" is exclusive. */
export function CheckChips({
  values,
  onChange,
  options,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: Option[];
}) {
  const toggle = (v: string) => {
    if (values.includes(v)) return onChange(values.filter((x) => x !== v));
    if (v === NOT_SURE) return onChange([NOT_SURE]);
    onChange([...values.filter((x) => x !== NOT_SURE), v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = values.includes(o.value);
        return (
          <label
            key={o.value}
            title={o.hint}
            className={`inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 focus-within:ring-2 focus-within:ring-opex-blue/30 ${
              active
                ? "border-opex-blue bg-opex-navy text-white"
                : "border-border bg-white text-[#27364c] hover:border-border-hover"
            }`}
          >
            <input type="checkbox" className="sr-only" checked={active} onChange={() => toggle(o.value)} />
            {active && <FiCheck aria-hidden className="h-3.5 w-3.5" />}
            <span>
              {optionLabel(o)}
              {o.hint && <span className={`ml-1 font-normal ${active ? "text-white/70" : "text-muted"}`}>· {o.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function Section({ title, intro, children }: { title?: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[18px] border border-border bg-white p-5 shadow-[0_2px_8px_rgb(7_21_47/2%)] sm:p-6">
      {title && <h3 className="text-[15px] font-semibold tracking-tight text-opex-navy">{title}</h3>}
      {intro && <p className="mt-1 text-[13px] leading-6 text-secondary">{intro}</p>}
      <div className={`${title || intro ? "mt-5" : ""} grid gap-6`}>{children}</div>
    </section>
  );
}

export function StepHeader({ index, title, intro }: { index: number; title: string; intro: ReactNode }) {
  return (
    <header className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-opex-blue">Step {index + 1} of 7</p>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-opex-navy sm:text-[28px]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">{intro}</p>
    </header>
  );
}
