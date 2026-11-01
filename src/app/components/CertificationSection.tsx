"use client";

import type { ReactNode } from "react";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path
        d="M12 3.5 19 6v5.3c0 4.5-2.8 7.5-7 9.2-4.2-1.7-7-4.7-7-9.2V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfrastructureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <rect
        x="4"
        y="3.5"
        width="16"
        height="7"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="4"
        y="13.5"
        width="16"
        height="7"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 7h.01M8 17h.01M12 7h4M12 17h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrivacyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 12h17M12 3c2.3 2.5 3.4 5.5 3.4 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.4 5.5-3.4 9S9.7 18.5 12 21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="m5 10 3.2 3.2L15 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CertificationBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#dcebe1] bg-[#f5faf6] px-3 py-1.5 text-xs font-medium text-[#286443]">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e4f2e8]">
        <CheckIcon />
      </span>
      {children}
    </span>
  );
}

function CardIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f5fb] text-[#315caa] transition duration-300 group-hover:bg-[#e7efff]">
      {children}
    </div>
  );
}

const cardClass =
  "group flex min-h-[300px] flex-col rounded-[24px] border border-[#e9edf3] bg-white p-7 shadow-[0_2px_8px_rgba(7,21,47,0.025)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-[#d9e2ef] hover:shadow-[0_18px_40px_rgba(7,21,47,0.075)] motion-reduce:transform-none motion-reduce:transition-none sm:p-8";

export default function CertificationSection() {
  return (
    <section
      id="trust"
      aria-labelledby="certification-heading"
      className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <h2
            id="certification-heading"
            className="text-balance text-3xl font-semibold leading-tight tracking-[-0.05em] text-[#07152f] sm:text-4xl lg:text-5xl"
          >
            Built on standards.
            <span className="block text-[#315caa]">
              Designed for confidence.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#64748b] sm:text-base">
            Security, infrastructure resilience and responsible data protection
            are central to how we approach cloud services.
          </p>
        </div>

        {/* Certification cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* ISO 27001 */}
          <article className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[24px] border border-[#14294a] bg-[#07152f] p-7 shadow-[0_4px_14px_rgba(7,21,47,0.06)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(7,21,47,0.16)] motion-reduce:transform-none motion-reduce:transition-none sm:p-8 xl:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#b9d4ff] transition-colors duration-300 group-hover:bg-white/[0.15]">
                <ShieldIcon />
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9bc0ff]" />
                Certified
              </span>
            </div>

            <div className="mt-10">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#a9c4ef]">
                Information security management
              </p>

              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                ISO/IEC 27001
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#c5d1e2] sm:text-base">
                An internationally recognised standard for information security
                management, helping organisations manage information security
                risks systematically.
              </p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-8">
              {[
                "Risk management",
                "Information security",
                "Security controls",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-[#d7e2f2]"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>

          {/* Data Centre Tier III */}
          <article className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <CardIcon>
                <InfrastructureIcon />
              </CardIcon>
              <CertificationBadge>Certified</CertificationBadge>
            </div>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#718096]">
                Infrastructure resilience
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#07152f]">
                Data Centre Tier III
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#64748b]">
                Tier III facility classification focuses on concurrently
                maintainable infrastructure, supporting planned maintenance
                without requiring shutdown of critical equipment.
              </p>
            </div>

            <div className="mt-auto border-t border-[#edf0f4] pt-5">
              <p className="text-xs leading-6 text-[#718096]">
                Certification scope depends on the specific facility and
                certified provider.
              </p>
            </div>
          </article>

          {/* Data protection */}
          <article className={cardClass}>
            <CardIcon>
              <PrivacyIcon />
            </CardIcon>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#718096]">
                Data protection
              </p>

              <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[#07152f] sm:text-2xl">
                Responsible data handling
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#64748b]">
                Data protection should be considered throughout the cloud
                journey, from infrastructure choices to access management and
                operational processes.
              </p>
            </div>
          </article>

          {/* Security approach */}
          <article className={cardClass}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f5fb] text-[#315caa] transition duration-300 group-hover:bg-[#e7efff]">
              <CheckIcon />
            </div>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#718096]">
                Our approach
              </p>

              <h3 className="mt-3 max-w-sm text-xl font-semibold leading-snug tracking-[-0.035em] text-[#07152f] sm:text-2xl">
                Security deserves more than promises.
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#64748b]">
                Clear information about standards, infrastructure and
                operational practices helps businesses make informed decisions.
              </p>
            </div>

            <div className="mt-auto border-t border-[#edf0f4] pt-5">
              <p className="text-xs leading-6 text-[#718096]">
                Clear information. Thoughtful infrastructure. A
                security-conscious approach.
              </p>
            </div>
          </article>

          {/* Nigerian data protection */}
          <article className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <CardIcon>
                <PrivacyIcon />
              </CardIcon>

              <span className="rounded-full border border-[#e5eaf1] bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-[#52647e]">
                Nigeria
              </span>
            </div>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#718096]">
                Regulatory landscape
              </p>

              <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-[#07152f] sm:text-2xl">
                Nigerian data protection
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#64748b]">
                The Nigeria Data Protection Commission oversees the
                country&apos;s data protection framework. Applicable obligations
                depend on the organisation, services and processing activities
                involved.
              </p>

              <a
                href="https://ndpc.gov.ng/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#315caa] transition-colors duration-200 hover:text-[#07152f]"
              >
                Visit the NDPC website
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      d="M5 15 15 5M6 5h9v9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
