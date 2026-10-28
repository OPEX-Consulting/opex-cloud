"use client";

import { useEffect, useState } from "react";

const TRUST_AREAS = [
  {
    number: "01",
    title: "Security-aware design",
    description:
      "Access control, sensible configuration and security considerations built into infrastructure planning.",
    tag: "Security",
  },
  {
    number: "02",
    title: "Data residency considerations",
    description:
      "Understand where workloads and data are hosted, with location requirements considered before deployment.",
    tag: "Data & governance",
  },
  {
    number: "03",
    title: "Protection and recovery",
    description:
      "Plan for backups, recovery objectives and continuity based on the needs of your business.",
    tag: "Resilience",
  },
  {
    number: "04",
    title: "Clear service conversations",
    description:
      "Understand the proposed setup, service boundaries and responsibilities before you commit.",
    tag: "Transparency",
  },
];

const TRUST_DETAILS = [
  {
    title: "Security and access",
    description:
      "Review access permissions, configuration choices and security responsibilities as part of your infrastructure plan.",
  },
  {
    title: "Data and governance",
    description:
      "Discuss hosting locations, data handling requirements and relevant governance obligations before choosing a deployment.",
  },
  {
    title: "Continuity and recovery",
    description:
      "Define backup arrangements, recovery expectations and operational responsibilities around your workloads.",
  },
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 shrink-0"
    >
      {diagonal ? (
        <path
          d="M5.5 14.5 14 6m-7.5 0H14v7.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M3.5 10h12m-4.5-4.5L15.5 10 11 14.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={`h-5 w-5 shrink-0 transition-transform duration-500 ${
        open ? "rotate-45" : ""
      }`}
    >
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Trust() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualSelection, setManualSelection] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Automatically reveal each dropdown in a continuous loop.
    const interval = window.setInterval(() => {
      setManualSelection(false);
      setActiveIndex((current) => (current + 1) % TRUST_DETAILS.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  function handleAccordionClick(index: number) {
    setManualSelection(true);
    setActiveIndex(index);
  }

  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="relative overflow-hidden bg-white py-12 text-[#07152f] sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Introduction */}
        <div className="mb-7 flex flex-col gap-4 border-b border-[#07152f]/10 pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[690px]">
            <h2
              id="trust-heading"
              className="text-balance text-[clamp(2.3rem,5vw,4.1rem)] font-semibold leading-[0.99] tracking-[-0.075em]"
            >
              Cloud confidence.
              <span className="block text-[#7c8493]">
                Without the guesswork.
              </span>
            </h2>
          </div>

          <p className="max-w-[350px] text-[14px] leading-6 text-[#606b7c] sm:text-[15px]">
            The important details should be clear before your business moves to
            the cloud.
          </p>
        </div>

        {/* Main feature panel */}
        <div className="overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-white">
          <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
            <div className="flex flex-col justify-between border-b border-[#e8eaf0] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-9">
              <div>
                <h3 className="mt-5 max-w-[400px] text-[clamp(1.8rem,3vw,2.65rem)] font-semibold leading-[1.05] tracking-[-0.06em]">
                  Know what you’re building. And why.
                </h3>

                <p className="mt-4 max-w-[390px] text-[14px] leading-6 text-[#647084]">
                  Your infrastructure should fit your operations, your data
                  requirements and the way your team works. We focus on
                  understanding those needs before recommending an approach.
                </p>
              </div>

              <a
                href="/onboarding"
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#07152f] px-5 py-3 text-[13px] font-semibold !text-white transition-colors duration-200 hover:bg-[#19345a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-2"
              >
                Talk to our team
              </a>
            </div>

            {/* Self-opening animated accordion */}
            <div
              className="p-3 sm:p-5 lg:p-6"
              onMouseEnter={() => {
                // Pause the automatic rotation while the visitor explores.
                setManualSelection(true);
              }}
              onMouseLeave={() => {
                setManualSelection(false);
              }}
            >
              {TRUST_DETAILS.map((item, index) => {
                const isOpen = activeIndex === index;

                return (
                  <div
                    key={item.title}
                    className={`trust-accordion-item rounded-[15px] ${
                      isOpen ? "is-open bg-[#f7f9fc]" : "bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`trust-detail-${index}`}
                      onClick={() => handleAccordionClick(index)}
                      className="flex w-full items-center gap-4 rounded-[15px] px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3977e8] sm:px-5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-[#e1e6ee] bg-white text-[11px] font-semibold tabular-nums text-[#3977e8]">
                        0{index + 1}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold tracking-[-0.025em] text-[#07152f] sm:text-[15px]">
                          {item.title}
                        </span>

                        {!isOpen && (
                          <span className="mt-1 block text-[12px] text-[#8991a0]">
                            Explore our approach
                          </span>
                        )}
                      </span>

                      <span
                        className={isOpen ? "text-[#3977e8]" : "text-[#7a8494]"}
                      >
                        <PlusIcon open={isOpen} />
                      </span>
                    </button>

                    <div
                      id={`trust-detail-${index}`}
                      aria-hidden={!isOpen}
                      className={`trust-detail-grid ${
                        isOpen ? "trust-detail-open" : ""
                      }`}
                    >
                      <div className="trust-detail-inner">
                        <p className="max-w-[440px] pb-5 pl-[68px] pr-5 text-[13px] leading-[1.8] text-[#657084] sm:pl-[76px]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <p className="px-4 pb-2 pt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#a0a7b3] sm:px-5">
                {manualSelection
                  ? "Explore the details"
                  : "Explore our approach"}
              </p>
            </div>
          </div>
        </div>

        {/* Trust principles */}
        <div className="mt-7 grid grid-cols-1 border-y border-[#07152f]/10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_AREAS.map((area, index) => (
            <article
              key={area.number}
              className={`py-5 sm:px-5 sm:py-6 ${
                index === 0 ? "sm:pl-0" : ""
              } ${
                index < TRUST_AREAS.length - 1
                  ? "border-b border-[#07152f]/10 sm:border-r sm:border-b-0"
                  : ""
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium tabular-nums text-[#3977e8]">
                  {area.number}
                </span>

                <span className="rounded-full border border-[#e5e7eb] px-2.5 py-1 text-[10px] font-medium text-[#747e8e]">
                  {area.tag}
                </span>
              </div>

              <h3 className="text-[15px] font-semibold tracking-[-0.035em] text-[#07152f]">
                {area.title}
              </h3>

              <p className="mt-2 max-w-[260px] text-[12px] leading-[1.75] text-[#707b8c]">
                {area.description}
              </p>
            </article>
          ))}
        </div>

        {/* Closing CTA */}
        <div className="mt-7 flex flex-col gap-5 rounded-[20px] bg-[#07152f] px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="max-w-[650px]">
            <h3 className="mt-2 text-[clamp(1.45rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.055em]">
              Let’s work out what your business actually needs.
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-[#bdc9dc]">
              Discuss your workloads, requirements and next steps with the Opex
              Cloud team.
            </p>
          </div>

          <a
            href="/onboarding"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-5 py-3 text-[13px] font-semibold !text-[#07152f] transition-colors duration-200 hover:bg-[#eaf1f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bb8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07152f] sm:self-center"
          >
            Get in touch
          </a>
        </div>
      </div>

      <style jsx>{`
        .trust-detail-grid {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 650ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 450ms ease;
        }

        .trust-detail-inner {
          min-height: 0;
          overflow: hidden;
        }

        .trust-detail-open {
          grid-template-rows: 1fr;
          opacity: 1;
        }

        .trust-accordion-item.is-open .trust-detail-inner {
          animation: revealDetail 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes revealDetail {
          0% {
            transform: translateY(-12px);
          }
          65% {
            transform: translateY(2px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .trust-detail-grid,
          .trust-accordion-item.is-open .trust-detail-inner {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
