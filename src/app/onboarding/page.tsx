"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";

type FormData = {
  fullName: string;
  organisation: string;
  email: string;
  phone: string;
  jobTitle: string;
  industry: string;
  infrastructure: string;
  workload: string;
  migration: string;
  workloadSize: string;
  dataResidency: string;
  managedService: string;
  timeline: string;
  message: string;
};

type OnboardingResponse = {
  success?: boolean;
  message?: string;
  submissionId?: string;
  submittedAt?: string;
};

const initialFormData: FormData = {
  fullName: "",
  organisation: "",
  email: "",
  phone: "",
  jobTitle: "",
  industry: "",
  infrastructure: "",
  workload: "",
  migration: "",
  workloadSize: "",
  dataResidency: "",
  managedService: "",
  timeline: "",
  message: "",
};

const industries = [
  "Financial services",
  "Technology",
  "Healthcare",
  "Retail and e-commerce",
  "Manufacturing",
  "Professional services",
  "Education",
  "Government",
  "Other",
];

const inputClass =
  "mt-1.5 block min-h-[44px] w-full min-w-0 box-border rounded-xl border border-[#dfe3ea] bg-white px-3 py-2.5 text-base leading-5 text-[#07152f] outline-none transition-colors duration-200 placeholder:text-[#9aa3b2] hover:border-[#c5cedb] focus:border-[#3977e8] focus:ring-2 focus:ring-[#3977e8]/10 sm:text-sm";

const labelClass =
  "block text-[13px] font-medium leading-5 text-[#27364c] sm:text-sm";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs leading-4 text-[#7d899b]">{hint}</p>}
    </div>
  );
}

function SelectField({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      className={`${inputClass} appearance-none`}
    >
      <option value="">Choose an option</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function OnboardingPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [consent, setConsent] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false);

  function LoadingSpinner() {
    return (
      <svg
        className="h-5 w-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>
    );
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setNotice("");
    setSubmissionSucceeded(false);
  };

  const goToStep = (nextStep: number) => {
    setNotice("");
    setCurrentStep(nextStep);

    if (typeof window !== "undefined") {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        window.requestAnimationFrame(() => {
          document
            .getElementById("onboarding-form")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  };

  function validateCurrentStep() {
    const form = document.getElementById(
      "onboarding-form"
    ) as HTMLFormElement | null;

    if (!form) return false;

    const fields = Array.from(
      form.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("[data-step-field]")
    );

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }

    return true;
  }

  function handleContinue() {
    if (!validateCurrentStep()) return;
    goToStep(currentStep + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    if (!validateCurrentStep()) return;

    if (!consent) {
      setNotice(
        "Please confirm that OPEX Cloud may use your information to respond to your enquiry."
      );
      return;
    }

    setSubmitting(true);
    setNotice("");
    setSubmissionSucceeded(false);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          consent,
        }),
      });
      let result: OnboardingResponse;
      try {
        result = (await response.json()) as OnboardingResponse;
      } catch {
        throw new Error(
          "The server returned an unexpected response. Please try again."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "We couldn't submit your details. Please try again."
        );
      }

      setSubmissionSucceeded(true);

      const reference = result.submissionId
        ? ` Your reference is ${result.submissionId}.`
        : "";

      setNotice(
        `Your requirements have been submitted successfully. Thank you for contacting OPEX Cloud.${reference}`
      );

      setFormData({ ...initialFormData });
      setConsent(false);
      setCurrentStep(0);
    } catch (error) {
      console.error("OPEX Cloud onboarding submission error:", error);

      setNotice(
        error instanceof Error
          ? error.message
          : "We couldn't submit your details. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const reviewItems: { label: string; value: string }[] = [
    { label: "Full name", value: formData.fullName },
    { label: "Organisation", value: formData.organisation },
    { label: "Business email", value: formData.email },
    { label: "Phone number", value: formData.phone },
    { label: "Job title", value: formData.jobTitle },
    { label: "Industry", value: formData.industry },
    { label: "Infrastructure", value: formData.infrastructure },
    { label: "Primary workload", value: formData.workload },
    { label: "Migration", value: formData.migration },
    { label: "Workload size", value: formData.workloadSize },
    { label: "Data location", value: formData.dataResidency },
    { label: "Management", value: formData.managedService },
    { label: "Expected timeline", value: formData.timeline },
  ];

  return (
    <main className="min-h-dvh bg-white text-[#07152f] lg:h-dvh lg:overflow-hidden">
      <div className="grid min-h-dvh grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[36%_64%]">
        {/* Desktop sidebar */}
        <aside className="relative hidden min-h-0 overflow-hidden bg-[#07152f] lg:block">
          <Image
            src="/images/lagos.jpeg"
            alt=""
            fill
            priority
            sizes="36vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-[#07152f]/55" />

          <div className="relative z-10 flex h-full min-h-0 flex-col px-9 py-8 xl:px-12 xl:py-10">
            <a
              href="/"
              aria-label="OPEX Cloud home"
              className="inline-flex w-fit"
            >
              <Image
                src="/images/opexwhite.webp"
                alt="OPEX"
                width={120}
                height={38}
                priority
                className="h-auto w-[88px] object-contain object-left"
              />
            </a>

            <div className="flex-1" />

            <p className="mb-10 max-w-sm text-3xl font-medium leading-[1.3] tracking-[-0.04em] text-white xl:text-4xl">
              Enterprise cloud infrastructure.
              <span className="mt-1 block text-white/65">
                Built for your business.
              </span>
            </p>

            <p className="mt-auto text-[11px] text-white/60">
              OPEX Cloud · A service from OPEX Consulting
            </p>
          </div>
        </aside>

        {/* Main panel */}
        <section className="flex min-h-0 min-w-0 flex-col bg-white lg:h-full">
          {/* Mobile header */}
          <header className="sticky top-0 z-20 flex shrink-0 items-center border-b border-[#edf0f4] bg-white px-4 py-3 sm:px-8 lg:hidden">
            <a href="/" aria-label="OPEX Cloud home" className="inline-flex">
              <Image
                src="/images/opexwhite.webp"
                alt="OPEX"
                width={100}
                height={32}
                className="h-auto w-[72px] object-contain brightness-0"
              />
            </a>
          </header>

          <div className="flex w-full flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6 lg:min-h-0 lg:overflow-hidden lg:px-10 lg:py-7 xl:px-14">
            <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col lg:min-h-0">
              {/* Intro */}
              <div className="mb-5 shrink-0 sm:mb-6">
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#07152f] sm:mt-3 sm:text-3xl lg:text-4xl">
                  Tell us what you need.
                </h1>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-[#778397] sm:text-sm sm:leading-6">
                  Share your organisation&apos;s details and cloud requirements
                  so our team can better understand your needs.
                </p>
              </div>

              <form
                id="onboarding-form"
                onSubmit={handleSubmit}
                noValidate
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Step content */}
                <div className="min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                  {/* Step 1 */}
                  {currentStep === 0 && (
                    <section>
                      <div className="mb-4 sm:mb-5">
                        <h2 className="text-base font-semibold tracking-tight text-[#07152f] sm:text-lg">
                          Your details
                        </h2>
                        <p className="mt-1 text-xs text-[#778397] sm:text-sm">
                          Tell us about yourself and your organisation.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 sm:gap-y-4">
                        <Field label="Full name">
                          <input
                            data-step-field
                            autoComplete="name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={(event) =>
                              updateField("fullName", event.target.value)
                            }
                            placeholder="e.g. Alex Johnson"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Organisation">
                          <input
                            data-step-field
                            autoComplete="organization"
                            name="organisation"
                            value={formData.organisation}
                            onChange={(event) =>
                              updateField("organisation", event.target.value)
                            }
                            placeholder="Company name"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Business email">
                          <input
                            data-step-field
                            autoComplete="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(event) =>
                              updateField("email", event.target.value)
                            }
                            placeholder="you@company.com"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Phone number">
                          <input
                            data-step-field
                            autoComplete="tel"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(event) =>
                              updateField("phone", event.target.value)
                            }
                            placeholder="+234 800 000 0000"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Job title">
                          <input
                            data-step-field
                            autoComplete="organization-title"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={(event) =>
                              updateField("jobTitle", event.target.value)
                            }
                            placeholder="e.g. IT Manager"
                            required
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Industry">
                          <SelectField
                            name="industry"
                            value={formData.industry}
                            onChange={(value) => updateField("industry", value)}
                            options={industries}
                          />
                        </Field>
                      </div>
                    </section>
                  )}

                  {/* Step 2 */}
                  {currentStep === 1 && (
                    <section>
                      <div className="mb-4 sm:mb-5">
                        <h2 className="text-base font-semibold tracking-tight text-[#07152f] sm:text-lg">
                          Infrastructure
                        </h2>
                        <p className="mt-1 text-xs text-[#778397] sm:text-sm">
                          Help us understand your current technology
                          environment.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 sm:gap-y-4">
                        <Field label="Current infrastructure">
                          <SelectField
                            name="infrastructure"
                            value={formData.infrastructure}
                            onChange={(value) =>
                              updateField("infrastructure", value)
                            }
                            options={[
                              "On-premises servers",
                              "Public cloud",
                              "Private cloud",
                              "Hybrid infrastructure",
                              "No existing infrastructure",
                              "Other",
                            ]}
                          />
                        </Field>

                        <Field label="Primary workload">
                          <SelectField
                            name="workload"
                            value={formData.workload}
                            onChange={(value) => updateField("workload", value)}
                            options={[
                              "Business applications",
                              "Websites and APIs",
                              "Databases",
                              "Development and testing",
                              "Storage and backup",
                              "Enterprise workloads",
                              "Other",
                            ]}
                          />
                        </Field>

                        <Field label="Migration requirement">
                          <SelectField
                            name="migration"
                            value={formData.migration}
                            onChange={(value) =>
                              updateField("migration", value)
                            }
                            options={[
                              "Migrate existing systems",
                              "Build a new environment",
                              "Expand existing capacity",
                              "Still exploring options",
                            ]}
                          />
                        </Field>

                        <Field label="Estimated workload size">
                          <SelectField
                            name="workloadSize"
                            value={formData.workloadSize}
                            onChange={(value) =>
                              updateField("workloadSize", value)
                            }
                            options={[
                              "Small — 1 to 5 workloads",
                              "Medium — 6 to 20 workloads",
                              "Large — 21 or more workloads",
                              "Not sure yet",
                            ]}
                          />
                        </Field>
                      </div>
                    </section>
                  )}

                  {/* Step 3 */}
                  {currentStep === 2 && (
                    <section>
                      <div className="mb-4 sm:mb-5">
                        <h2 className="text-base font-semibold tracking-tight text-[#07152f] sm:text-lg">
                          Cloud requirements
                        </h2>
                        <p className="mt-1 text-xs text-[#778397] sm:text-sm">
                          Tell us how you want your cloud environment to work.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 sm:gap-y-4">
                        <Field label="Data location preference">
                          <SelectField
                            name="dataResidency"
                            value={formData.dataResidency}
                            onChange={(value) =>
                              updateField("dataResidency", value)
                            }
                            options={[
                              "Nigeria preferred",
                              "Nigeria required",
                              "Open to other locations",
                              "Need guidance",
                            ]}
                          />
                        </Field>

                        <Field label="Management preference">
                          <SelectField
                            name="managedService"
                            value={formData.managedService}
                            onChange={(value) =>
                              updateField("managedService", value)
                            }
                            options={[
                              "Fully managed",
                              "Shared management",
                              "Self-managed",
                              "Need guidance",
                            ]}
                          />
                        </Field>

                        <Field label="Expected timeline">
                          <SelectField
                            name="timeline"
                            value={formData.timeline}
                            onChange={(value) => updateField("timeline", value)}
                            options={[
                              "Immediately",
                              "Within 1 month",
                              "Within 3 months",
                              "Within 6 months",
                              "Just researching",
                            ]}
                          />
                        </Field>

                        <Field label="Additional requirements">
                          <textarea
                            name="message"
                            rows={3}
                            value={formData.message}
                            onChange={(event) =>
                              updateField("message", event.target.value)
                            }
                            placeholder="Optional project details..."
                            className={`${inputClass} min-h-[88px] resize-y`}
                          />
                        </Field>
                      </div>
                    </section>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 3 && (
                    <section>
                      <div className="mb-5">
                        <h2 className="text-lg font-semibold tracking-tight text-[#07152f] sm:text-xl">
                          Review your details
                        </h2>
                        <p className="mt-1 text-sm leading-5 text-[#778397]">
                          Check your information before submitting.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                        {reviewItems.map(({ label, value }) => (
                          <div
                            key={label}
                            className="min-w-0 border-b border-[#edf0f4] py-2.5"
                          >
                            <p className="text-xs text-[#8994a5]">{label}</p>
                            <p className="mt-1 break-words text-sm font-medium leading-5 text-[#27364c]">
                              {value || "—"}
                            </p>
                          </div>
                        ))}
                      </div>

                      {formData.message && (
                        <div className="mt-4 rounded-xl bg-[#f7f9fc] p-3 sm:p-4">
                          <p className="text-xs font-medium text-[#66748a]">
                            Additional requirements
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-[#27364c]">
                            {formData.message}
                          </p>
                        </div>
                      )}

                      <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#66748a] sm:text-sm">
                        <input
                          type="checkbox"
                          name="consent"
                          checked={consent}
                          onChange={(event) => {
                            setConsent(event.target.checked);
                            setNotice("");
                          }}
                          required
                          className="mt-1 h-4 w-4 shrink-0 accent-[#3977e8]"
                        />
                        <span>
                          I confirm that these details are accurate and agree to
                          be contacted by OPEX Cloud about my requirements.
                        </span>
                      </label>
                    </section>
                  )}
                </div>

                {/* Footer and navigation */}
                <div className="mt-5 shrink-0 border-t border-[#edf0f4] pt-4 sm:mt-6 sm:pt-5">
                  {notice && (
                    <div
                      role={submissionSucceeded ? "status" : "alert"}
                      aria-live="polite"
                      className={`mb-3 rounded-xl border p-3 text-xs leading-5 sm:text-sm ${
                        submissionSucceeded
                          ? "border-[#cce8d5] bg-[#f0faf3] text-[#21643b]"
                          : "border-[#dfe5ed] bg-[#f7f9fc] text-[#52647e]"
                      }`}
                    >
                      {notice}
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        if (currentStep === 0) {
                          window.location.href = "/";
                        } else {
                          goToStep(currentStep - 1);
                        }
                      }}
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 text-sm font-medium text-[#66748a] transition-colors hover:bg-[#f7f9fc] hover:text-[#07152f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {currentStep === 0 ? "Cancel" : "Back"}
                    </button>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#07152f] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#10264b] sm:w-auto sm:min-w-[140px]"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        aria-busy={submitting}
                        className="inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#07152f] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#10264b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[170px]"
                      >
                        {submitting ? (
                          <>
                            <LoadingSpinner />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          "Submit requirements"
                        )}
                      </button>
                    )}
                  </div>

                  <p className="mt-3 text-center text-[10px] leading-4 text-[#9aa4b3] sm:text-xs">
                    Your information will be used to respond to your cloud
                    enquiry.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
