"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCloudOff,
  FiDownload,
  FiLock,
  FiMail,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiSave,
} from "react-icons/fi";
import {
  draftSchema,
  emptyAnswers,
  emptyServers,
  type Answers,
  type Draft,
  type PortalPayload,
  type PublicProject,
  type Servers,
} from "@/lib/requirements/schema";
import { STEPS, findMissing, overallTotals } from "@/lib/requirements/logic";
import { StepContacts, StepObjectives, StepSource, StepTarget, type Patch } from "./Steps";
import { Inventory } from "./Inventory";
import { Summary } from "./Summary";

type Screen = "welcome" | "form" | "done" | "submitted" | "expired";
type SaveState = "idle" | "saving" | "saved" | "local" | "offline" | "error";

const LS_KEY = (token: string) => `opex-requirements:${token}`;

type LocalRecord = { savedAt: string; draft: Draft; submittedAt?: string };

function readLocal(token: string): LocalRecord | null {
  try {
    const raw = localStorage.getItem(LS_KEY(token));
    if (!raw) return null;
    const rec = JSON.parse(raw) as LocalRecord;
    const parsed = draftSchema.safeParse(rec.draft);
    if (!parsed.success) return null;
    return { ...rec, draft: parsed.data };
  } catch {
    return null;
  }
}

function writeLocal(token: string, rec: LocalRecord) {
  try {
    localStorage.setItem(LS_KEY(token), JSON.stringify(rec));
    return true;
  } catch {
    return false;
  }
}

function relTime(d: Date | null, now: number) {
  if (!d) return "";
  const s = Math.round((now - d.getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function todayIso() {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function initialDraft(p: PortalPayload): Draft {
  if (p.draft) return p.draft;
  const answers = emptyAnswers();
  answers.contact.customerName = p.project.customerName;
  answers.contact.customerAddress = p.project.customerAddress;
  return { answers, currentStep: 0, servers: emptyServers() };
}

/* ------------------------------------------------------------------ */

function Shell({
  project,
  mode,
  right,
  children,
}: {
  project: PublicProject;
  mode: PortalPayload["mode"];
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 bg-opex-navy text-white print:static print:bg-white print:text-opex-navy">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Image src="/images/opexwhite.webp" alt="OPEX Cloud" width={132} height={42} priority className="h-7 w-auto object-contain print:hidden" />
            <span className="hidden print:inline print:text-lg print:font-bold">OPEX Cloud</span>
            <span aria-hidden className="hidden h-6 w-px bg-white/20 sm:block print:hidden" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-[13px] font-semibold leading-4">{project.customerName || "Requirements"}</p>
              <p className="truncate text-[11px] leading-4 text-white/60 print:text-muted">
                Requirements questionnaire{project.projectName ? ` · ${project.projectName}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            {mode === "demo" && (
              <span className="rounded-full bg-[#e0a46b]/20 px-2.5 py-1 text-[11px] font-semibold text-[#ffd3a8]">Demo – saved on this device only</span>
            )}
            {right}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted print:hidden">
        © {new Date().getFullYear()} OPEX Consulting Limited · Your answers are confidential and only shared with the OPEX Cloud project team.
      </footer>
    </div>
  );
}

function ContactCard({ project }: { project: PublicProject }) {
  if (!project.salesContactName && !project.salesContactEmail && !project.salesContactPhone) return null;
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Your OPEX Cloud contact</p>
      <p className="mt-1 text-sm font-bold text-opex-navy">{project.salesContactName}</p>
      <div className="mt-1.5 grid gap-1 text-[13px] text-secondary">
        {project.salesContactEmail && (
          <a href={`mailto:${project.salesContactEmail}`} className="inline-flex items-center gap-2 break-all hover:text-opex-blue">
            <FiMail aria-hidden className="shrink-0" /> {project.salesContactEmail}
          </a>
        )}
        {project.salesContactPhone && (
          <a href={`tel:${project.salesContactPhone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-opex-blue">
            <FiPhone aria-hidden className="shrink-0" /> {project.salesContactPhone}
          </a>
        )}
      </div>
    </div>
  );
}

function SaveIndicator({ state, last, now }: { state: SaveState; last: Date | null; now: number }) {
  let icon = <FiCheck aria-hidden />;
  let text = "";
  if (state === "saving") {
    icon = <FiRefreshCw aria-hidden className="animate-spin" />;
    text = "Saving…";
  } else if (state === "saved") text = `Saved ${relTime(last, now)}`;
  else if (state === "local") {
    icon = <FiSave aria-hidden />;
    text = `Saved on this device ${relTime(last, now)}`;
  } else if (state === "offline" || state === "error") {
    icon = <FiCloudOff aria-hidden />;
    text = "Offline – saved on this device, retrying";
  } else return null;
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs text-white/70">
      {icon}
      <span className="hidden sm:inline">{text}</span>
    </span>
  );
}

function download(name: string, data: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------ */

export default function Portal({ payload }: { payload: PortalPayload }) {
  const { token, project, mode } = payload;
  const locked = payload.status === "submitted" || payload.status === "reviewed";

  const [screen, setScreen] = useState<Screen>(locked ? "submitted" : payload.expired ? "expired" : "welcome");
  const [draft, setDraft] = useState<Draft>(() => initialDraft(payload));
  const [visited, setVisited] = useState<Set<number>>(() => new Set());
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(payload.updatedAt ? new Date(payload.updatedAt) : null);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedAt, setSubmittedAt] = useState<string | null>(payload.submittedAt);
  const [hasProgress, setHasProgress] = useState(Boolean(payload.draft));

  const ready = useRef(false);
  const latest = useRef(draft);
  const timer = useRef<number | undefined>(undefined);
  const retryTimer = useRef<number | undefined>(undefined);
  const retryDelay = useRef(4000);
  const inFlight = useRef(false);
  const pending = useRef(false);
  const dirty = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const flushRef = useRef<() => void>(() => {});

  useEffect(() => {
    latest.current = draft;
  }, [draft]);

  /* ---- hydrate from localStorage (newer wins) and prefill today's date ---- */
  // Reading localStorage must happen after hydration, so state is set from an effect on purpose.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const local = readLocal(token);
    const serverTime = payload.updatedAt ? new Date(payload.updatedAt).getTime() : 0;
    let next: Draft | null = null;
    if (local && !locked) {
      if (mode === "demo" && local.submittedAt) {
        setSubmittedAt(local.submittedAt);
        setScreen("submitted");
        next = local.draft;
      } else if (new Date(local.savedAt).getTime() > serverTime) {
        next = local.draft;
        setLastSaved(new Date(local.savedAt));
        if (mode === "live") dirty.current = true; // push the newer local copy to the server
      }
    }
    if (next) setDraft(next);
    if (next || payload.draft) setHasProgress(true);
    if (!(next ?? payload.draft)?.answers.contact.date) {
      setDraft((d) => ({ ...d, answers: { ...d.answers, contact: { ...d.answers.contact, date: d.answers.contact.date || todayIso() } } }));
    }
    ready.current = true;
    const i = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* eslint-enable react-hooks/set-state-in-effect */

  /* ---- autosave ---- */
  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(retryTimer.current);
    const d = latest.current;
    const savedAt = new Date().toISOString();
    const okLocal = writeLocal(token, { savedAt, draft: d });
    if (mode === "demo") {
      dirty.current = false;
      setSaveState(okLocal ? "local" : "error");
      setLastSaved(new Date(savedAt));
      return;
    }
    if (inFlight.current) {
      pending.current = true;
      return;
    }
    inFlight.current = true;
    pending.current = false;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/requirements/${encodeURIComponent(token)}/draft`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (res.status === 409) {
        setScreen("submitted");
        return;
      }
      if (res.status === 410) {
        setScreen("expired");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { updatedAt?: string };
      dirty.current = pending.current;
      retryDelay.current = 4000;
      setSaveState("saved");
      setLastSaved(new Date(body.updatedAt ?? savedAt));
    } catch {
      setSaveState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
      setLastSaved(new Date(savedAt));
      retryTimer.current = window.setTimeout(() => flushRef.current(), retryDelay.current);
      retryDelay.current = Math.min(retryDelay.current * 2, 60_000);
    } finally {
      inFlight.current = false;
      if (pending.current) {
        pending.current = false;
        timer.current = window.setTimeout(() => flushRef.current(), 300);
      }
    }
  }, [mode, token]);

  useEffect(() => {
    flushRef.current = () => void flush();
  }, [flush]);

  useEffect(() => {
    if (!ready.current || screen === "submitted" || screen === "done" || screen === "expired") return;
    dirty.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), 1500);
  }, [draft, flush, screen]);

  useEffect(() => {
    const online = () => dirty.current && void flush();
    const hide = () => {
      if (!dirty.current) return;
      writeLocal(token, { savedAt: new Date().toISOString(), draft: latest.current });
      if (mode === "live" && navigator.sendBeacon) {
        navigator.sendBeacon(
          `/api/requirements/${encodeURIComponent(token)}/draft`,
          new Blob([JSON.stringify(latest.current)], { type: "application/json" }),
        );
      }
    };
    const vis = () => document.visibilityState === "hidden" && hide();
    window.addEventListener("online", online);
    window.addEventListener("pagehide", hide);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("pagehide", hide);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [flush, mode, token]);

  /* ---- state helpers ---- */
  const patch: Patch = useCallback((k, p) => {
    setDraft((d) => ({ ...d, answers: { ...d.answers, [k]: { ...d.answers[k], ...p } } as Answers }));
  }, []);
  const setServers = useCallback((fn: (s: Servers) => Servers) => {
    setDraft((d) => ({ ...d, servers: fn(d.servers) }));
  }, []);

  const step = draft.currentStep;
  const headerProject = { ...project, customerName: draft.answers.contact.customerName?.trim() || project.customerName };
  const missing = useMemo(() => findMissing(draft.answers, draft.servers), [draft.answers, draft.servers]);
  const errorsFor = (s: number) =>
    visited.has(s) ? Object.fromEntries(missing.filter((m) => m.step === s).map((m) => [m.field, m.label])) : {};

  const goTo = (s: number) => {
    setVisited((v) => new Set(v).add(step));
    setDraft((d) => ({ ...d, currentStep: Math.max(0, Math.min(5, s)) }));
    setScreen("form");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      mainRef.current?.focus({ preventScroll: true });
    });
  };

  const submit = async () => {
    setSubmitError("");
    setVisited(new Set([0, 1, 2, 3, 4]));
    if (missing.length) {
      setSubmitError("A few required items are still missing – they're highlighted below.");
      return;
    }
    setSubmitting(true);
    window.clearTimeout(timer.current);
    window.clearTimeout(retryTimer.current);
    try {
      if (mode === "demo") {
        const at = new Date().toISOString();
        writeLocal(token, { savedAt: at, draft: latest.current, submittedAt: at });
        setSubmittedAt(at);
      } else {
        const res = await fetch(`/api/requirements/${encodeURIComponent(token)}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(latest.current),
        });
        const body = (await res.json().catch(() => ({}))) as { submittedAt?: string; message?: string };
        if (res.status === 409) {
          setScreen("submitted");
          return;
        }
        if (!res.ok) throw new Error(body.message || "We couldn't submit just now.");
        setSubmittedAt(body.submittedAt ?? new Date().toISOString());
        writeLocal(token, { savedAt: new Date().toISOString(), draft: latest.current, submittedAt: body.submittedAt });
      }
      dirty.current = false;
      setScreen("done");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setSubmitError(
        e instanceof Error && e.message
          ? `${e.message} Your answers are saved – please try again in a moment.`
          : "We couldn't submit just now. Your answers are saved – please try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadJson = () => {
    const t = overallTotals(draft.servers);
    download(
      `opex-cloud-requirements-${(draft.answers.contact.customerName || "client").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`,
      JSON.stringify(
        { customer: project.customerName, project: project.projectName, submittedAt, answers: draft.answers, servers: draft.servers, totals: t },
        null,
        2,
      ),
      "application/json",
    );
  };

  const resetDemo = () => {
    localStorage.removeItem(LS_KEY(token));
    window.location.reload();
  };

  const printButtons = (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className="opex-button-secondary">
        <FiPrinter aria-hidden /> Print or save as PDF
      </button>
      <button type="button" onClick={downloadJson} className="opex-button-secondary">
        <FiDownload aria-hidden /> Download a copy (JSON)
      </button>
    </div>
  );

  /* ---------------- Screens ---------------- */

  if (screen === "expired") {
    return (
      <Shell project={headerProject} mode={mode}>
        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-blue text-opex-blue">
            <FiClock aria-hidden className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-opex-navy">This link has expired</h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            For security, questionnaire links are only open for a limited time. Your OPEX Cloud contact can send you a fresh link
            – anything you&apos;ve already saved will still be there.
          </p>
          <div className="mx-auto mt-6 max-w-sm text-left">
            <ContactCard project={project} />
          </div>
        </div>
      </Shell>
    );
  }

  if (screen === "submitted" || screen === "done") {
    const justDone = screen === "done";
    return (
      <Shell project={headerProject} mode={mode}>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="print:hidden">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#15803d]">
              {justDone ? <FiCheckCircle aria-hidden className="h-7 w-7" /> : <FiLock aria-hidden className="h-6 w-6" />}
            </span>
            <h1 className="mt-5 text-[28px] font-bold tracking-tight text-opex-navy">
              {justDone ? "Thank you – your requirements are with us" : "These requirements have been submitted"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              {submittedAt
                ? `Submitted on ${new Date(submittedAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}. `
                : ""}
              {justDone
                ? "Your answers are now locked so our engineers can work from a stable copy."
                : "They're now read-only. If something needs to change, please contact your OPEX Cloud team."}
            </p>
          </div>

          {justDone && (
            <section className="mt-8 rounded-[18px] border border-border bg-white p-6 print:hidden">
              <h2 className="text-[15px] font-bold text-opex-navy">What happens next</h2>
              <ol className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  ["Review", "Our solution engineers review your answers and server inventory."],
                  ["Clarify", "If anything is unclear – or you chose ‘Not sure’ – we'll contact you to fill the gaps together."],
                  ["Design", "We prepare your sizing and solution design, then walk you through it."],
                ].map(([t, d], i) => (
                  <li key={t} className="rounded-xl bg-surface-secondary p-4">
                    <p className="text-xs font-semibold text-opex-blue">Step {i + 1}</p>
                    <p className="mt-1 text-sm font-bold text-opex-navy">{t}</p>
                    <p className="mt-1 text-xs leading-5 text-secondary">{d}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
            {printButtons}
            <div className="sm:w-80">
              <ContactCard project={project} />
            </div>
          </div>
          {mode === "demo" && (
            <button type="button" onClick={resetDemo} className="mt-4 text-xs font-semibold text-opex-blue underline underline-offset-4 print:hidden">
              Start the demo again
            </button>
          )}

          <div className={`${justDone ? "hidden print:block" : "mt-10"}`}>
            <h2 className="mb-4 text-lg font-bold text-opex-navy print:text-base">
              {project.customerName} – requirements{submittedAt ? ` (submitted ${new Date(submittedAt).toLocaleDateString("en-GB")})` : ""}
            </h2>
            <Summary a={draft.answers} servers={draft.servers} />
          </div>
        </div>
      </Shell>
    );
  }

  if (screen === "welcome") {
    const checklist = [
      "A list of the servers in scope – CPU, RAM, disk sizes and operating systems (an RVTools or Hyper-V export makes this quick)",
      "Which applications run where, and which are most critical",
      "Your available internet/WAN bandwidth at each site (in Mbps)",
      "When replication can run – office hours, evenings or weekends",
      "Any recovery targets you work to (how much data you could lose, how fast you need to be back)",
    ];
    return (
      <Shell project={headerProject} mode={mode}>
        <div className="opex-hero">
          <div aria-hidden className="opex-hero-glow" />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:py-20">
            <div className="animate-opex-fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-opex-blue">Solution design & sizing</p>
              <h1 className="mt-3 text-[32px] font-bold leading-[1.15] tracking-tight text-opex-navy sm:text-[42px]">
                Welcome{project.customerName ? `, ${project.customerName}` : ""}
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-secondary">
                Thank you for choosing OPEX Cloud. This short questionnaire tells our engineers what you&apos;re running today and
                what you need, so we can size and design your {project.projectName ? <strong className="font-semibold text-opex-navy">{project.projectName}</strong> : "solution"} accurately.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2 text-[13px] font-medium text-opex-navy">
                {[
                  [<FiClock key="c" aria-hidden />, "About 20 minutes"],
                  [<FiSave key="s" aria-hidden />, "Saves automatically"],
                  [<FiRefreshCw key="r" aria-hidden />, "Return any time with this link"],
                ].map(([icon, t]) => (
                  <li key={t as string} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5">
                    {icon}
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => goTo(hasProgress ? step : 0)} className="opex-button-primary">
                  {hasProgress ? "Continue where you left off" : "Start"} <FiArrowRight aria-hidden />
                </button>
                {hasProgress && (
                  <span className="text-xs text-muted">
                    You were on step {step + 1}: {STEPS[step].title}
                  </span>
                )}
              </div>
              <p className="mt-6 max-w-xl text-xs leading-5 text-muted">
                Don&apos;t worry if you can&apos;t answer everything – every technical question has a ‘Not sure’ option, and we&apos;ll
                fill any gaps with you. Please keep this link private; anyone with it can see and edit your answers.
              </p>
            </div>
            <div className="grid content-start gap-4 animate-opex-fade-up [animation-delay:120ms]">
              <div className="rounded-[18px] border border-border bg-white p-5 shadow-[0_10px_32px_rgb(7_21_47/6%)] sm:p-6">
                <p className="text-sm font-bold text-opex-navy">Helpful to have ready</p>
                <ul className="mt-3 grid gap-2.5">
                  {checklist.map((c) => (
                    <li key={c} className="flex gap-2.5 text-[13px] leading-5 text-secondary">
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-blue text-opex-blue">
                        <FiCheck aria-hidden className="h-3 w-3" />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <ContactCard project={project} />
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------------- Form ---------------- */

  const stepState = (i: number) => {
    const done = !missing.some((m) => m.step === i);
    if (i === 5) return "todo";
    if (visited.has(i)) return done ? "done" : "warn";
    return "todo";
  };
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const errors = errorsFor(step);
  const wide = step === 4;

  return (
    <Shell project={headerProject} mode={mode} right={<SaveIndicator state={saveState} last={lastSaved} now={now} />}>
      {/* Mobile progress */}
      <div className="sticky top-16 z-30 border-b border-border bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden print:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-opex-navy">
            {step + 1}/6 · {STEPS[step].title}
          </span>
          <span className="text-muted">{progress}%</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Questionnaire progress"
        >
          <div className="h-full rounded-full bg-opex-blue transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-10">
        {/* Step rail */}
        <aside className="hidden lg:block print:hidden">
          <nav aria-label="Questionnaire steps" className="sticky top-24">
            <ol className="grid gap-1">
              {STEPS.map((s, i) => {
                const st = stepState(i);
                const active = i === step;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={active ? "step" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                        active ? "bg-white font-semibold text-opex-navy shadow-[0_2px_10px_rgb(7_21_47/6%)]" : "text-secondary hover:bg-surface-secondary"
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          st === "done"
                            ? "bg-opex-blue text-white"
                            : st === "warn"
                              ? "bg-[#fdf1ec] text-[#b4532a]"
                              : active
                                ? "bg-opex-navy text-white"
                                : "border border-border bg-white text-muted"
                        }`}
                      >
                        {st === "done" ? <FiCheck aria-hidden className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span>
                        {s.title}
                        {st === "done" && <span className="sr-only"> (complete)</span>}
                        {st === "warn" && <span className="sr-only"> (needs attention)</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6">
              <ContactCard project={project} />
            </div>
          </nav>
        </aside>

        <div ref={mainRef} tabIndex={-1} className={`min-w-0 outline-none ${wide ? "" : "max-w-3xl"}`}>
          {step === 0 && <StepContacts a={draft.answers} patch={patch} errors={errors} project={project} />}
          {step === 1 && <StepObjectives a={draft.answers} patch={patch} errors={errors} />}
          {step === 2 && <StepSource a={draft.answers} patch={patch} errors={errors} />}
          {step === 3 && <StepTarget a={draft.answers} patch={patch} errors={errors} />}
          {step === 4 && <Inventory servers={draft.servers} setServers={setServers} a={draft.answers} patch={patch} errors={errors} />}
          {step === 5 && (
            <>
              <header className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-opex-blue">Step 6 of 6</p>
                <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-opex-navy sm:text-[28px]">Review & submit</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
                  Check your answers below. Once you submit, they&apos;re locked and sent to the OPEX Cloud team.
                </p>
              </header>
              {missing.length > 0 ? (
                <div role="alert" className="mb-5 rounded-2xl border border-[#f1c9b4] bg-[#fdf6f2] p-4 sm:p-5">
                  <p className="text-sm font-bold text-[#8a3a17]">
                    {missing.length} item{missing.length === 1 ? "" : "s"} still needed before you can submit
                  </p>
                  <ul className="mt-2 grid gap-1">
                    {missing.map((m) => (
                      <li key={m.field} className="text-[13px] text-[#8a3a17]">
                        <button type="button" onClick={() => goTo(m.step)} className="text-left underline decoration-[#e7b49b] underline-offset-4 hover:text-[#5c230b]">
                          {STEPS[m.step].title}: {m.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-[#8a3a17]/80">Stuck on a technical question? Choose ‘Not sure’ – we&apos;ll work it out with you.</p>
                </div>
              ) : (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#cfe9d7] bg-[#f1faf4] p-4 text-sm font-semibold text-[#15803d]">
                  <FiCheckCircle aria-hidden /> Everything required is complete.
                </div>
              )}
              <Summary a={draft.answers} servers={draft.servers} missing={missing} onEdit={goTo} />
            </>
          )}

          {/* Navigation */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
            {step > 0 ? (
              <button type="button" onClick={() => goTo(step - 1)} className="opex-button-secondary">
                <FiArrowLeft aria-hidden /> Back
              </button>
            ) : (
              <button type="button" onClick={() => setScreen("welcome")} className="opex-button-secondary">
                <FiArrowLeft aria-hidden /> Welcome
              </button>
            )}
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {step < 5 ? (
                <button type="button" onClick={() => goTo(step + 1)} className="opex-button-primary">
                  Continue to {STEPS[step + 1].title.toLowerCase()} <FiArrowRight aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={submitting} aria-disabled={missing.length > 0} className={`opex-button-primary ${missing.length ? "opacity-60" : ""}`}>
                  {submitting ? (
                    <>
                      <FiRefreshCw aria-hidden className="animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      Submit requirements <FiCheck aria-hidden />
                    </>
                  )}
                </button>
              )}
              {submitError && (
                <p role="alert" className="max-w-sm text-xs font-medium text-[#b4532a] sm:text-right">
                  {submitError}
                </p>
              )}
              {step < 5 && <p className="text-[11px] text-muted sm:text-right">You can come back and change anything before you submit.</p>}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
