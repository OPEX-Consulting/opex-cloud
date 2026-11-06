"use client";

import { useId } from "react";
import { FiPlus, FiX, FiCheck } from "react-icons/fi";
import type { Answers, DataSize, PublicProject } from "@/lib/requirements/schema";
import {
  APPLICATIONS,
  BARE_METAL,
  DATA_RESILIENCY,
  HOSTING_MODELS,
  MEDIA_TYPES,
  MULTISITE_MODES,
  NETWORK_CONNECTIVITY,
  NEW_OR_MIGRATE,
  NOT_SURE,
  OPEX_DATA_CENTRES,
  OTHER,
  PUBLIC_CLOUD_HOSTING,
  REQUIREMENT_OPTIONS,
  SOURCE_CLOUDS,
  SOURCE_PLATFORMS,
  STORAGE_NEW_EXISTING,
  STORAGE_PERSONALITY,
  USE_CASES,
  YES_NO_NOT_SURE,
  isOpexDcHosting,
} from "@/lib/requirements/options";
import { isEmail } from "@/lib/requirements/logic";
import {
  CheckChips,
  Field,
  NotSureCheck,
  NumberInput,
  RadioCards,
  Section,
  SelectInput,
  StepHeader,
  inputCls,
  errorInputCls,
} from "./ui";

export type Patch = <K extends keyof Answers>(k: K, p: Partial<Answers[K]>) => void;
export type StepProps = { a: Answers; patch: Patch; errors: Record<string, string> };

/* ------------------------------------------------------------------ */
/* Step 1: Project & contacts                                          */
/* ------------------------------------------------------------------ */

export function StepContacts({ a, patch, errors, project }: StepProps & { project: PublicProject }) {
  const id = useId();
  const c = a.contact;
  const emailBad = c.contactEmail.trim() !== "" && !isEmail(c.contactEmail);
  return (
    <>
      <StepHeader
        index={0}
        title="Project & contacts"
        intro="Confirm who we're working with. We've pre-filled what we already know – please correct anything that's out of date."
      />
      <div className="grid gap-5">
        <Section title="Your organisation">
          <Field label="Customer name" htmlFor={`${id}-cn`} required error={errors.customerName}>
            <input
              id={`${id}-cn`}
              className={`${inputCls} ${errors.customerName ? errorInputCls : ""}`}
              value={c.customerName}
              onChange={(e) => patch("contact", { customerName: e.target.value })}
              autoComplete="organization"
            />
          </Field>
          <Field label="Customer address & details" htmlFor={`${id}-ca`} optional hint="Registered or main office address.">
            <textarea
              id={`${id}-ca`}
              rows={3}
              className={inputCls}
              value={c.customerAddress}
              onChange={(e) => patch("contact", { customerAddress: e.target.value })}
              autoComplete="street-address"
            />
          </Field>
          {project.projectName && (
            <p className="text-xs text-muted">
              Project: <span className="font-semibold text-secondary">{project.projectName}</span>
            </p>
          )}
        </Section>

        <Section title="Main contact" intro="The person we should speak to about these requirements.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor={`${id}-n`} required error={errors.contactName}>
              <input
                id={`${id}-n`}
                className={`${inputCls} ${errors.contactName ? errorInputCls : ""}`}
                value={c.contactName}
                onChange={(e) => patch("contact", { contactName: e.target.value })}
                autoComplete="name"
              />
            </Field>
            <Field
              label="Email address"
              htmlFor={`${id}-e`}
              required
              error={emailBad ? "That email address doesn't look quite right." : errors.contactEmail}
            >
              <input
                id={`${id}-e`}
                type="email"
                className={`${inputCls} ${emailBad || errors.contactEmail ? errorInputCls : ""}`}
                value={c.contactEmail}
                onChange={(e) => patch("contact", { contactEmail: e.target.value })}
                autoComplete="email"
              />
            </Field>
            <Field label="Phone number" htmlFor={`${id}-p`} optional>
              <input
                id={`${id}-p`}
                type="tel"
                className={inputCls}
                value={c.contactPhone}
                onChange={(e) => patch("contact", { contactPhone: e.target.value })}
                autoComplete="tel"
                placeholder="+234 …"
              />
            </Field>
            <Field label="Date" htmlFor={`${id}-d`} optional>
              <input
                id={`${id}-d`}
                type="date"
                className={inputCls}
                value={c.date}
                onChange={(e) => patch("contact", { date: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        {(project.salesContactName || project.salesContactEmail) && (
          <Section title="Your OPEX Cloud contact">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted">Name</dt>
                <dd className="font-semibold text-opex-navy">{project.salesContactName || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="break-all font-semibold text-opex-navy">
                  {project.salesContactEmail ? (
                    <a className="underline decoration-border underline-offset-4 hover:text-opex-blue" href={`mailto:${project.salesContactEmail}`}>
                      {project.salesContactEmail}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="font-semibold text-opex-navy">{project.salesContactPhone || "—"}</dd>
              </div>
            </dl>
          </Section>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2: Objectives                                                  */
/* ------------------------------------------------------------------ */

export function StepObjectives({ a, patch, errors }: StepProps) {
  const id = useId();
  const o = a.objectives;
  const challenges = o.challenges.length ? o.challenges : [""];
  const setChallenge = (i: number, v: string) => {
    const next = [...challenges];
    next[i] = v;
    patch("objectives", { challenges: next });
  };
  return (
    <>
      <StepHeader
        index={1}
        title="Objectives"
        intro="Help us understand what you're trying to achieve, so the design solves the right problem."
      />
      <div className="grid gap-5">
        <Section>
          <Field
            as="fieldset"
            label="Which best describes your requirement?"
            required
            error={errors.requirement}
            tip="DRaaS (Disaster Recovery as a Service) keeps a ready-to-run copy of your servers in OPEX Cloud so you can recover quickly after an outage."
          >
            <RadioCards
              name={`${id}-req`}
              value={o.requirement}
              onChange={(v) => patch("objectives", { requirement: v })}
              options={REQUIREMENT_OPTIONS}
              columns={1}
            />
          </Field>
          {o.requirement === OTHER && (
            <Field label="Tell us about your requirement" htmlFor={`${id}-ro`} required error={errors.requirementOther}>
              <textarea
                id={`${id}-ro`}
                rows={3}
                className={`${inputCls} ${errors.requirementOther ? errorInputCls : ""}`}
                value={o.requirementOther}
                onChange={(e) => patch("objectives", { requirementOther: e.target.value })}
              />
            </Field>
          )}
        </Section>

        <Section
          title="Top challenges"
          intro="List the 3–5 biggest challenges behind this project – one per line. A sentence each is plenty."
        >
          <div className="grid gap-2.5" aria-describedby={errors.challenges ? `${id}-ch-err` : undefined}>
            {challenges.map((ch, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-right text-xs font-semibold text-muted">{i + 1}.</span>
                <input
                  aria-label={`Challenge ${i + 1}`}
                  className={inputCls}
                  value={ch}
                  placeholder={i === 0 ? "e.g. Our current hardware is end of support next year" : ""}
                  onChange={(e) => setChallenge(i, e.target.value)}
                />
                {challenges.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove challenge ${i + 1}`}
                    onClick={() => patch("objectives", { challenges: challenges.filter((_, j) => j !== i) })}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-secondary hover:text-opex-navy"
                  >
                    <FiX aria-hidden />
                  </button>
                )}
              </div>
            ))}
            {challenges.length < 5 && (
              <button
                type="button"
                onClick={() => patch("objectives", { challenges: [...challenges, ""] })}
                className="ml-7 inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-opex-blue hover:bg-surface-blue"
              >
                <FiPlus aria-hidden /> Add another challenge
              </button>
            )}
            {errors.challenges && (
              <p id={`${id}-ch-err`} role="alert" className="ml-7 text-xs font-medium text-[#b4532a]">
                Please add at least one challenge.
              </p>
            )}
          </div>
        </Section>

        <Section>
          <Field
            label="What would success look like?"
            htmlFor={`${id}-sc`}
            optional
            hint="e.g. “All 40 servers running in OPEX Cloud by March with under 4 hours of downtime”, or a recovery time target."
            tip="If you have targets for RPO (how much data you can afford to lose) or RTO (how quickly you need to be back up), include them here."
          >
            <textarea
              id={`${id}-sc`}
              rows={4}
              className={inputCls}
              value={o.successCriteria}
              onChange={(e) => patch("objectives", { successCriteria: e.target.value })}
            />
          </Field>
        </Section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3: Use case & source                                           */
/* ------------------------------------------------------------------ */

function DataSizeInput({ label, value, onChange, tip }: { label: string; value: DataSize; onChange: (v: DataSize) => void; tip?: string }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} optional tip={tip}>
      <div className="flex gap-2">
        <NumberInput
          id={id}
          className="flex-1"
          value={value.value}
          disabled={value.notSure}
          placeholder="e.g. 500"
          onChange={(v) => onChange({ ...value, value: v })}
        />
        <div role="group" aria-label={`${label} unit`} className="inline-flex shrink-0 rounded-xl border border-border bg-surface-secondary p-1">
          {(["GB", "TB"] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={value.unit === u}
              disabled={value.notSure}
              onClick={() => onChange({ ...value, unit: u })}
              className={`min-w-[44px] rounded-lg px-2 text-xs font-semibold transition-colors ${
                value.unit === u ? "bg-white text-opex-navy shadow-sm" : "text-muted hover:text-opex-navy"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <NotSureCheck checked={value.notSure} onChange={(v) => onChange({ ...value, notSure: v, value: v ? null : value.value })} />
    </Field>
  );
}

function TimeRange({
  label,
  start,
  end,
  onStart,
  onEnd,
  disabled,
}: {
  label: string;
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <p className="text-[13px] font-semibold text-[#27364c]">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <label htmlFor={`${id}-s`} className="sr-only">{`${label} start time`}</label>
        <input id={`${id}-s`} type="time" disabled={disabled} className={inputCls} value={start} onChange={(e) => onStart(e.target.value)} />
        <span className="text-xs text-muted">to</span>
        <label htmlFor={`${id}-e`} className="sr-only">{`${label} end time`}</label>
        <input id={`${id}-e`} type="time" disabled={disabled} className={inputCls} value={end} onChange={(e) => onEnd(e.target.value)} />
      </div>
    </div>
  );
}

export function StepSource({ a, patch, errors }: StepProps) {
  const id = useId();
  const u = a.useCase;
  const s = a.source;
  const toggleUseCase = (v: string) =>
    patch("useCase", {
      useCases: u.useCases.includes(v) ? u.useCases.filter((x) => x !== v) : [...u.useCases, v],
    });
  return (
    <>
      <StepHeader
        index={2}
        title="Use case & source"
        intro="Tell us what we're protecting or moving, and what it runs on today."
      />
      <div className="grid gap-5">
        <Section title="What do you need?" intro="Choose all that apply.">
          <div role="group" aria-label="Use cases" className="grid gap-3 sm:grid-cols-2">
            {USE_CASES.map((uc) => {
              const active = u.useCases.includes(uc.value);
              return (
                <label
                  key={uc.value}
                  className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-all duration-150 focus-within:ring-2 focus-within:ring-opex-blue/30 sm:p-5 ${
                    active
                      ? "border-opex-blue bg-surface-blue shadow-[0_0_0_1px_rgb(49_92_170)]"
                      : "border-border bg-white hover:-translate-y-0.5 hover:border-border-hover hover:shadow-[0_10px_32px_rgb(7_21_47/6%)]"
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={active} onChange={() => toggleUseCase(uc.value)} />
                  <span
                    aria-hidden
                    className={`absolute right-4 top-4 inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                      active ? "border-opex-blue bg-opex-blue text-white" : "border-[#c5cedb] bg-white"
                    }`}
                  >
                    {active && <FiCheck className="h-3.5 w-3.5" />}
                  </span>
                  <span className="pr-8 text-[15px] font-bold text-opex-navy">{uc.title}</span>
                  <span className="mt-0.5 text-[13px] font-medium text-secondary">{uc.subtitle}</span>
                  <span className="mt-2 text-xs leading-5 text-muted">{uc.hint}</span>
                </label>
              );
            })}
          </div>
          {errors.useCases && (
            <p role="alert" className="text-xs font-medium text-[#b4532a]">
              Please choose at least one.
            </p>
          )}
          {u.useCases.includes("multisite_dr") && (
            <Field as="fieldset" label="Multi-site replication" optional>
              <RadioCards
                name={`${id}-ms`}
                value={u.multiSiteMode}
                onChange={(v) => patch("useCase", { multiSiteMode: v })}
                options={MULTISITE_MODES}
                columns={3}
              />
            </Field>
          )}
          {u.useCases.includes("managed_dr") && (
            <Field label="How many years of Managed DR?" htmlFor={`${id}-y`} required error={errors.managedDrYears}>
              <NumberInput
                id={`${id}-y`}
                className="max-w-[180px]"
                value={u.managedDrYears}
                step="1"
                min={1}
                suffix="years"
                placeholder="e.g. 3"
                invalid={Boolean(errors.managedDrYears)}
                onChange={(v) => patch("useCase", { managedDrYears: v })}
              />
            </Field>
          )}
        </Section>

        <Section title="Your source environment" intro="Where your servers and data live today.">
          <Field
            as="fieldset"
            label="Source platforms"
            required
            error={errors.platforms}
            tip="A hypervisor is the software that runs your virtual machines, e.g. VMware ESXi or Hyper-V. Physical servers run directly on hardware."
          >
            <CheckChips values={s.platforms} onChange={(v) => patch("source", { platforms: v })} options={SOURCE_PLATFORMS} />
          </Field>
          {s.platforms.includes(OTHER) && (
            <Field label="Other platform" htmlFor={`${id}-po`}>
              <input id={`${id}-po`} className={inputCls} value={s.platformOther} onChange={(e) => patch("source", { platformOther: e.target.value })} />
            </Field>
          )}
          <Field label="Describe your source site(s)" htmlFor={`${id}-sd`} optional hint="Locations, how many sites, on-premises hypervisors or physical servers – whatever helps.">
            <textarea id={`${id}-sd`} rows={3} className={inputCls} value={s.description} onChange={(e) => patch("source", { description: e.target.value })} />
          </Field>
          <Field as="fieldset" label="Is any source data hosted in a public or private cloud?" optional>
            <CheckChips values={s.clouds} onChange={(v) => patch("source", { clouds: v })} options={SOURCE_CLOUDS} />
          </Field>
          {s.clouds.includes("Other private cloud") && (
            <Field label="Which private cloud?" htmlFor={`${id}-co`}>
              <input id={`${id}-co`} className={inputCls} value={s.cloudOther} onChange={(e) => patch("source", { cloudOther: e.target.value })} />
            </Field>
          )}
          <Field as="fieldset" label="Applications hosted on the servers" optional>
            <CheckChips values={s.applications} onChange={(v) => patch("source", { applications: v })} options={APPLICATIONS} />
          </Field>
          <Field label="Anything specific about your applications?" htmlFor={`${id}-ao`} optional hint="e.g. Oracle 19c cluster, SAP ECC, an in-house loan system.">
            <textarea id={`${id}-ao`} rows={2} className={inputCls} value={s.applicationsOther} onChange={(e) => patch("source", { applicationsOther: e.target.value })} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <DataSizeInput
              label="Total data on VMware VMs"
              value={s.vmwareDataSize}
              onChange={(v) => patch("source", { vmwareDataSize: v })}
              tip="Approximate used storage across the VMware VMs in scope. We'll also total the disks you list in the server inventory."
            />
            <DataSizeInput
              label="Total data on non-VMware VMs & physical servers"
              value={s.nonVmwareDataSize}
              onChange={(v) => patch("source", { nonVmwareDataSize: v })}
              tip="Servers on other hypervisors or bare metal, where a data-sync agent will be installed."
            />
          </div>
          <p className="rounded-xl bg-surface-secondary px-4 py-3 text-xs leading-5 text-secondary">
            You don&apos;t need to count your servers here – we work out the number of VMs and physical servers from the
            inventory in step 5.
          </p>
        </Section>

        <Section
          title="Replication window & bandwidth"
          intro="When we're allowed to copy data, and how much network capacity is available."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TimeRange
              label="Weekdays"
              disabled={s.windowNotSure}
              start={s.weekdayStart}
              end={s.weekdayEnd}
              onStart={(v) => patch("source", { weekdayStart: v })}
              onEnd={(v) => patch("source", { weekdayEnd: v })}
            />
            <TimeRange
              label="Weekends"
              disabled={s.windowNotSure}
              start={s.weekendStart}
              end={s.weekendEnd}
              onStart={(v) => patch("source", { weekendStart: v })}
              onEnd={(v) => patch("source", { weekendEnd: v })}
            />
          </div>
          <div className="-mt-3">
            <NotSureCheck checked={s.windowNotSure} onChange={(v) => patch("source", { windowNotSure: v })} label="Not sure – discuss with OPEX" />
            <p className="mt-1 text-xs text-muted">For example: weekdays 09:00–17:00, weekends 00:00–23:59.</p>
          </div>
          <Field as="fieldset" label="Is work outside office hours or at weekends required?" required error={errors.afterHours}>
            <RadioCards name={`${id}-ah`} value={s.afterHours} onChange={(v) => patch("source", { afterHours: v })} options={YES_NO_NOT_SURE} columns={3} />
          </Field>
          <Field
            label="Available replication bandwidth at the source"
            htmlFor={`${id}-bw`}
            required
            error={errors.sourceBandwidth}
            tip="The upload capacity your source site can dedicate to replication, in megabits per second (Mbps). Your ISP contract or network team will know."
          >
            <NumberInput
              id={`${id}-bw`}
              className="max-w-[240px]"
              suffix="Mbps"
              placeholder="e.g. 100"
              disabled={s.bandwidthNotSure}
              invalid={Boolean(errors.sourceBandwidth)}
              value={s.bandwidthMbps}
              onChange={(v) => patch("source", { bandwidthMbps: v })}
            />
            <NotSureCheck checked={s.bandwidthNotSure} onChange={(v) => patch("source", { bandwidthNotSure: v, bandwidthMbps: v ? null : s.bandwidthMbps })} />
          </Field>
        </Section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4: Target & hosting                                            */
/* ------------------------------------------------------------------ */

export function StepTarget({ a, patch, errors }: StepProps) {
  const id = useId();
  const t = a.target;
  const isPublic = t.hosting === PUBLIC_CLOUD_HOSTING;
  const atOpexDc = isOpexDcHosting(t.hosting);
  return (
    <>
      <StepHeader
        index={3}
        title="Target & hosting"
        intro="Where your workloads will run, and how the target storage and network should look. If you're unsure about anything technical, choose ‘Not sure’ and we'll advise."
      />
      <div className="grid gap-5">
        <Section title="Hosting model">
          <Field as="fieldset" label="Where should the target environment be hosted?" required error={errors.hosting}>
            <RadioCards
              name={`${id}-h`}
              value={t.hosting}
              onChange={(v) => patch("target", { hosting: v, ...(v !== PUBLIC_CLOUD_HOSTING ? { networkConnectivity: "" } : {}) })}
              options={HOSTING_MODELS}
              columns={1}
            />
          </Field>
          {atOpexDc && OPEX_DATA_CENTRES.length > 0 && (
            <Field label="Preferred OPEX Cloud data centre" htmlFor={`${id}-dc`} optional>
              <SelectInput
                id={`${id}-dc`}
                value={t.dataCentre}
                onChange={(v) => patch("target", { dataCentre: v })}
                options={[...OPEX_DATA_CENTRES.map((d) => ({ value: d })), { value: NOT_SURE }]}
              />
            </Field>
          )}
          {isPublic && (
            <Field
              label="Network connectivity"
              htmlFor={`${id}-nc`}
              optional
              tip="How your users and offices reach the cloud: OPEX Cloud-provided internet, or your own SD-WAN (software-defined WAN) link."
            >
              <SelectInput id={`${id}-nc`} value={t.networkConnectivity} onChange={(v) => patch("target", { networkConnectivity: v })} options={NETWORK_CONNECTIVITY} />
            </Field>
          )}
          <Field label="Describe your target site(s)" htmlFor={`${id}-td`} optional hint="Hypervisors, cloud platforms, locations and the role of each site (e.g. production, DR).">
            <textarea id={`${id}-td`} rows={3} className={inputCls} value={t.description} onChange={(e) => patch("target", { description: e.target.value })} />
          </Field>
          <Field label="Available replication bandwidth at the target" htmlFor={`${id}-tbw`} optional tip="Download capacity at the target site in Mbps. For OPEX Cloud data centres you can leave this as ‘Not sure’.">
            <NumberInput
              id={`${id}-tbw`}
              className="max-w-[240px]"
              suffix="Mbps"
              placeholder="e.g. 200"
              disabled={t.bandwidthNotSure}
              value={t.bandwidthMbps}
              onChange={(v) => patch("target", { bandwidthMbps: v })}
            />
            <NotSureCheck checked={t.bandwidthNotSure} onChange={(v) => patch("target", { bandwidthNotSure: v, bandwidthMbps: v ? null : t.bandwidthMbps })} />
          </Field>
        </Section>

        <Section title="Environment">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New environment or migration?" htmlFor={`${id}-nm`} optional>
              <SelectInput id={`${id}-nm`} value={t.newOrMigrate} onChange={(v) => patch("target", { newOrMigrate: v })} options={NEW_OR_MIGRATE} />
            </Field>
            <Field
              label="Bare metal integration"
              htmlFor={`${id}-bm`}
              optional
              tip="Will any of your own physical equipment (servers, GPUs, firewalls/WAF/VPN, routers) need to connect into the OPEX Cloud environment?"
            >
              <SelectInput id={`${id}-bm`} value={t.bareMetal} onChange={(v) => patch("target", { bareMetal: v })} options={BARE_METAL} />
            </Field>
          </div>
        </Section>

        <Section title="Storage" intro="Leave these as ‘Not sure’ if you'd like us to recommend the right set-up.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New or existing OPEX Cloud storage" htmlFor={`${id}-ne`} optional>
              <SelectInput id={`${id}-ne`} value={t.storageNewExisting} onChange={(v) => patch("target", { storageNewExisting: v })} options={STORAGE_NEW_EXISTING} />
            </Field>
            <Field
              label="Media type"
              htmlFor={`${id}-mt`}
              optional
              tip="SSD is fastest; HDD is cheapest per GB; Tiered/Hybrid mix the two, keeping busy data on SSD."
            >
              <SelectInput id={`${id}-mt`} value={t.mediaType} onChange={(v) => patch("target", { mediaType: v })} options={MEDIA_TYPES} />
            </Field>
            {t.mediaType === OTHER && (
              <Field label="Other media type" htmlFor={`${id}-mto`}>
                <input id={`${id}-mto`} className={inputCls} value={t.mediaTypeOther} onChange={(e) => patch("target", { mediaTypeOther: e.target.value })} />
              </Field>
            )}
            <Field
              label="Data resiliency"
              htmlFor={`${id}-dr`}
              optional
              tip="How data is protected against disk failure. RAID mirrors or stripes disks with parity; EC (erasure coding), e.g. 4+2, splits data into 4 pieces plus 2 parity pieces across nodes."
            >
              <SelectInput id={`${id}-dr`} value={t.dataResiliency} onChange={(v) => patch("target", { dataResiliency: v })} options={DATA_RESILIENCY} />
            </Field>
          </div>
          <Field
            as="fieldset"
            label="Storage personality"
            optional
            hint="Choose all that apply."
            tip="Block storage behaves like a disk attached to a server; File storage is shared folders; Object storage is S3-style buckets."
          >
            <CheckChips values={t.storagePersonality} onChange={(v) => patch("target", { storagePersonality: v })} options={STORAGE_PERSONALITY} />
          </Field>
        </Section>
      </div>
    </>
  );
}
