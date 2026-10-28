"use client";

import { useState } from "react";
import Link from "next/link";

type Solution = {
  id: string;
  number: string;
  title: string;
  description: string;
  detail: string;
  features: string[];
  icon: "enterprise" | "finance" | "government" | "technology" | "workloads";
};

const SOLUTIONS: Solution[] = [
  {
    id: "enterprise",
    number: "01",
    title: "Enterprise",
    description:
      "Infrastructure designed for business applications and evolving operational needs.",
    detail:
      "Build a flexible foundation for your business with cloud infrastructure suited to your applications, teams, and changing requirements.",
    features: [
      "Business application hosting",
      "Scalable infrastructure",
      "Backup and recovery planning",
    ],
    icon: "enterprise",
  },
  {
    id: "financial",
    number: "02",
    title: "Financial services",
    description:
      "A practical cloud foundation for financial platforms and digital services.",
    detail:
      "Support financial products and digital operations with infrastructure planning that considers security, availability, and operational requirements.",
    features: [
      "Application infrastructure",
      "Security-conscious configuration",
      "Monitoring and support",
    ],
    icon: "finance",
  },
  {
    id: "government",
    number: "03",
    title: "Government",
    description:
      "Cloud infrastructure for public services and digital transformation.",
    detail:
      "Plan and operate infrastructure for digital public services with attention to access controls, data protection, and operational visibility.",
    features: [
      "Digital service hosting",
      "Access control considerations",
      "Backup planning",
    ],
    icon: "government",
  },
  {
    id: "technology",
    number: "04",
    title: "Technology",
    description:
      "Flexible infrastructure for software teams building and shipping products.",
    detail:
      "Give developers a practical environment for applications, APIs, deployment workflows, and growing workloads without unnecessary complexity.",
    features: [
      "Application and API hosting",
      "Development environments",
      "Infrastructure monitoring",
    ],
    icon: "technology",
  },
  {
    id: "workloads",
    number: "05",
    title: "Specialised workloads",
    description:
      "Infrastructure planned around the specific needs of your applications.",
    detail:
      "Discuss your workload requirements with our team so the infrastructure approach can be shaped around performance, capacity, and operational needs.",
    features: [
      "Workload assessment",
      "Capacity planning",
      "Deployment guidance",
    ],
    icon: "workloads",
  },
];

function SolutionIcon({ type }: { type: Solution["icon"] }) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "enterprise":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...commonProps}>
          <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
          <path d="M9 8h2M9 12h2M9 16h2M15 8h.01M15 12h.01M15 16h.01" />
        </svg>
      );

    case "finance":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...commonProps}>
          <path d="M3.5 9h17L12 4 3.5 9Z" />
          <path d="M5.5 10v7M9.8 10v7M14.2 10v7M18.5 10v7M3.5 20h17M4.5 17h15" />
        </svg>
      );

    case "government":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...commonProps}>
          <path d="m12 3 8 4v2H4V7l8-4Z" />
          <path d="M6 10v7M10 10v7M14 10v7M18 10v7M4 20h16M3 17h18" />
        </svg>
      );

    case "technology":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...commonProps}>
          <rect x="3.5" y="4" width="17" height="12" rx="2" />
          <path d="M8 20h8M12 16v4M9 8l-2 2 2 2M15 8l2 2-2 2" />
        </svg>
      );

    case "workloads":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...commonProps}>
          <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" />
          <path d="m4.5 8.3 7.5 4.4 7.5-4.4M12 12.7v7.5M8 5.8l8 4.6" />
        </svg>
      );
  }
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px] shrink-0"
    >
      <path
        d="m5 10 3.2 3.2L15 6.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Solution() {
  const [activeSolution, setActiveSolution] = useState(SOLUTIONS[0].id);

  const selected =
    SOLUTIONS.find((solution) => solution.id === activeSolution) ??
    SOLUTIONS[0];

  return (
    <section
      id="solutions"
      className="overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
    >
      {/* Heading */}
      <div className="mx-auto mb-10 w-full max-w-[1240px] px-5 sm:mb-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.055em] text-[#07152f] sm:text-4xl lg:text-[48px]">
            Infrastructure for
            <span className="block text-[#7b8798]">what comes next.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#667085] sm:text-base">
            Explore cloud infrastructure approaches designed around your
            applications, your team, and where you want to go next.
          </p>
        </div>
      </div>

      {/* Continuous card marquee */}
      <div className="solution-marquee relative mb-12 sm:mb-14">
        <div className="solution-marquee-track flex w-max gap-4 py-4 sm:gap-5">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 gap-4 sm:gap-5"
              aria-hidden={copy === 1}
            >
              {SOLUTIONS.map((solution) => (
                <button
                  key={`${copy}-${solution.id}`}
                  type="button"
                  aria-label={`View ${solution.title} solution`}
                  aria-pressed={activeSolution === solution.id}
                  tabIndex={copy === 1 ? -1 : 0}
                  onClick={() => setActiveSolution(solution.id)}
                  className={`group flex h-[270px] w-[280px] shrink-0 flex-col rounded-[22px] border bg-white p-5 text-left transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-4 sm:h-[290px] sm:w-[310px] sm:p-6 ${
                    activeSolution === solution.id
                      ? "border-[#b9d0ff] shadow-[0_12px_32px_rgba(7,21,47,0.08)]"
                      : "border-[#e8ebf0] shadow-[0_2px_8px_rgba(7,21,47,0.025)] hover:-translate-y-1 hover:border-[#cbd5e1] hover:shadow-[0_12px_30px_rgba(7,21,47,0.06)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-[15px] transition-colors duration-300 ${
                        activeSolution === solution.id
                          ? "bg-[#eaf1ff] text-[#2862cb]"
                          : "bg-[#f5f7fa] text-[#344966] group-hover:bg-[#edf3ff] group-hover:text-[#2862cb]"
                      }`}
                    >
                      <span className="h-[23px] w-[23px]">
                        <SolutionIcon type={solution.icon} />
                      </span>
                    </span>

                    <span className="pt-1 text-[11px] font-medium tabular-nums tracking-[0.08em] text-[#a0a8b5]">
                      {solution.number}
                    </span>
                  </div>

                  <div className="mt-7">
                    <h3 className="text-[17px] font-semibold leading-6 tracking-[-0.035em] text-[#07152f]">
                      {solution.title}
                    </h3>

                    <p className="mt-3 text-[13px] leading-[1.8] text-[#667085]">
                      {solution.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center pt-5">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeSolution === solution.id
                          ? "w-8 bg-[#3977e8]"
                          : "w-4 bg-[#e0e5ed] group-hover:w-6 group-hover:bg-[#a8bce0]"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Selected solution details */}
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div
          key={selected.id}
          className="grid overflow-hidden rounded-[24px] border border-[#e8ebf0] bg-white shadow-[0_8px_28px_rgba(7,21,47,0.035)] md:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#07152f] sm:text-3xl">
              {selected.title}
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#667085] sm:text-[15px]">
              {selected.detail}
            </p>

            <Link
              href="/onboarding"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#07152f] px-5 py-3 text-sm font-semibold !text-white transition duration-200 hover:bg-[#10264b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-2"
            >
              Discuss your requirements
            </Link>
          </div>

          <div className="border-t border-[#edf0f4] bg-[#fafbfc] p-6 sm:p-8 md:border-l md:border-t-0 lg:p-10">
            <h4 className="text-sm font-semibold text-[#07152f]">
              What we can help with
            </h4>

            <ul className="mt-5 space-y-4">
              {selected.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf1ff] text-[#2862cb]">
                    <CheckIcon />
                  </span>

                  <span className="text-sm leading-6 text-[#475467]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-[#e8ebf0] pt-8 sm:mt-16 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#07152f] sm:text-2xl">
              Let’s find the right fit.
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Tell us what you’re building and what your infrastructure needs.
            </p>
          </div>

          <Link
            href="/support"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[#d8dee8] bg-white px-5 py-3 text-sm font-semibold text-[#07152f] transition duration-200 hover:border-[#07152f] hover:bg-[#07152f] hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-2"
          >
            Contact us
          </Link>
        </div>
      </div>

      <style jsx>{`
        .solution-marquee {
          width: 100%;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            #000 4%,
            #000 96%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            #000 4%,
            #000 96%,
            transparent
          );
        }

        .solution-marquee-track {
          width: max-content;
          animation: solution-scroll 45s linear infinite;
          will-change: transform;
        }

        .solution-marquee:hover .solution-marquee-track,
        .solution-marquee:focus-within .solution-marquee-track {
          animation-play-state: paused;
        }

        @keyframes solution-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .solution-marquee-track {
            animation: none;
          }

          .solution-marquee {
            overflow-x: auto;
            -webkit-mask-image: none;
            mask-image: none;
          }
        }
      `}</style>
    </section>
  );
}
