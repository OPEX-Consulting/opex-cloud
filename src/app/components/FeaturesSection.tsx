"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

const FEATURES = [
  {
    number: "01",
    title: "Virtual Private Cloud",
    description:
      "Create an isolated cloud network for your workloads, with networking controls designed to support more structured infrastructure environments.",
    icon: "network",
    theme: "light",
    label: "Networking",
  },
  {
    number: "02",
    title: "Cloud Compute",
    description:
      "Run applications, business services and workloads on virtual machines suited to your infrastructure requirements.",
    icon: "compute",
    theme: "blue",
    label: "Virtual machines",
  },
  {
    number: "03",
    title: "Cloud Storage",
    description:
      "Use persistent block storage for applications and workloads that need dedicated storage resources.",
    icon: "storage",
    theme: "dark",
    label: "Block storage",
  },
  {
    number: "04",
    title: "Security & Access",
    description:
      "Use security groups and network-level controls to help define how workloads communicate within your cloud environment.",
    icon: "security",
    theme: "light",
    label: "Security groups",
  },
  {
    number: "05",
    title: "Monitoring & Visibility",
    description:
      "Gain operational visibility through monitoring, metrics and alerts that help your team understand infrastructure activity.",
    icon: "monitoring",
    theme: "blue",
    label: "Metrics & alerts",
  },
  {
    number: "06",
    title: "Snapshots & Protection",
    description:
      "Use snapshots and protection capabilities as part of a considered approach to safeguarding workloads and planning recovery.",
    icon: "protection",
    theme: "light",
    label: "Data protection",
  },
] as const;

type ServiceIconName = (typeof FEATURES)[number]["icon"];

function ServiceIcon({ name }: { name: ServiceIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "network":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="8" y="3.5" width="8" height="5.5" rx="1.5" />
          <rect x="2.5" y="15" width="7" height="5.5" rx="1.5" />
          <rect x="14.5" y="15" width="7" height="5.5" rx="1.5" />
          <path d="M12 9v3H6v3m6-3h6v3" />
        </svg>
      );

    case "compute":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="4" y="3.5" width="16" height="7" rx="1.8" />
          <rect x="4" y="13.5" width="16" height="7" rx="1.8" />
          <path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" />
        </svg>
      );

    case "storage":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <ellipse cx="12" cy="5.5" rx="8" ry="3" />
          <path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
          <path d="M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );

    case "security":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <path d="M12 3 19 5.7v5.6c0 4.4-2.8 7.5-7 9.7-4.2-2.2-7-5.3-7-9.7V5.7L12 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "monitoring":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="3" y="4" width="18" height="15" rx="2" />
          <path d="M7 12h2.5l2-4 3.2 7 2-3H19M8 22h8M12 19v3" />
        </svg>
      );

    case "protection":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <path d="M12 3 19 6v5.2c0 4.4-2.8 7.4-7 9.8-4.2-2.4-7-5.4-7-9.8V6l7-3Z" />
          <path d="M8.5 12.2a3.5 3.5 0 0 1 6.4-1.9M15.5 8.8v2.5H13M15.5 12a3.5 3.5 0 0 1-6.4 1.9M8.5 15.4v-2.5H11" />
        </svg>
      );
  }
}

export default function FeatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>(".feature-card");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    card.style.setProperty("--rotate-x", `${(0.5 - y) * 2}deg`);
    card.style.setProperty("--rotate-y", `${(x - 0.5) * 2}deg`);
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLElement>) {
    const card = event.currentTarget;

    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  }

  return (
    <section
      ref={sectionRef}
      id="platform"
      aria-labelledby="platform-heading"
      className="feature-section relative overflow-hidden bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        {/* Section heading */}
        <div className="feature-heading mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <h2
            id="platform-heading"
            className="text-balance text-3xl font-bold leading-[1.1] tracking-[-0.055em] text-[#07152f] sm:text-4xl lg:text-5xl"
          >
            The infrastructure
            <span className="mt-1 block text-[#64748b]">
              behind your workloads.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#64748b] sm:text-base">
            Enterprise cloud infrastructure with virtual networking, compute,
            storage and operational visibility, backed by practical guidance
            from OPEX Consulting.
          </p>
        </div>

        {/* Current offering */}
        <div className="mb-8 flex flex-col gap-4 rounded-[22px] border border-[#e3eaf4] bg-[#f7f9fc] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e5edff] text-[#315caa]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8m0-12.8L5.6 18.4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-base font-semibold tracking-[-0.025em] text-[#07152f] sm:text-lg">
                Start with the essentials.
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#64748b]">
                Virtual Private Cloud and pay-as-you-go infrastructure designed
                to give your team a practical starting point.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-[#dce6f6] bg-white px-3.5 py-2 text-xs font-semibold text-[#315caa]">
              Virtual Private Cloud
            </span>
            <span className="rounded-full border border-[#dce6f6] bg-white px-3.5 py-2 text-xs font-semibold text-[#315caa]">
              Pay-as-you-go
            </span>
          </div>
        </div>

        {/* Platform capability cards */}
        <div className="feature-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.number}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className={`feature-card feature-card-${feature.theme}`}
              style={
                {
                  "--delay": `${(Number(feature.number) - 1) * 80}ms`,
                  "--rotate-x": "0deg",
                  "--rotate-y": "0deg",
                } as CSSProperties
              }
            >
              <div className="mb-8 flex items-start justify-between gap-3">
                <div className="feature-icon flex h-12 w-12 items-center justify-center rounded-[16px]">
                  <span className="h-6 w-6">
                    <ServiceIcon name={feature.icon} />
                  </span>
                </div>

                <span className="feature-number pt-1 text-xs font-semibold tracking-[0.12em]">
                  {feature.number}
                </span>
              </div>

              <h3 className="max-w-[290px] text-xl font-semibold leading-snug tracking-[-0.035em] sm:text-2xl">
                {feature.title}
              </h3>

              <p className="mt-3 max-w-[340px] text-sm leading-6">
                {feature.description}
              </p>

              <div className="mt-auto pt-7">
                <div className="feature-card-divider mb-4" />
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {feature.label}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Data residency statement */}
        <div className="mt-8 flex flex-col gap-4 rounded-[22px] border border-[#e1e8f1] bg-white p-6 sm:flex-row sm:items-center sm:gap-5 sm:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf1ff] text-[#315caa]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path
                d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold tracking-[-0.025em] text-[#07152f] sm:text-lg">
              Cloud infrastructure with local context.
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#64748b]">
              Designed for organisations operating in Nigeria, with
              consideration for local data residency, governance and
              infrastructure requirements. Specific requirements should be
              assessed for each workload.
            </p>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="mt-8 overflow-hidden rounded-[26px] bg-[#07152f] px-6 py-8 sm:px-9 sm:py-9 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-3xl">
                The right cloud setup starts with the right conversation.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#c4d1e3]">
                Discuss your workloads, infrastructure needs and next steps with
                the OPEX Cloud team.
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex min-h-[50px] shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#07152f] transition duration-200 hover:-translate-y-0.5 hover:bg-[#eaf1f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bc0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07152f]"
            >
              Talk to a Cloud Expert
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .feature-section {
          isolation: isolate;
        }

        .feature-heading {
          animation: headingReveal 650ms ease both;
        }

        .feature-grid {
          position: relative;
          isolation: auto;
          overflow: visible;
          padding: 8px 4px 24px;
        }

        .feature-card {
          --rotate-x: 0deg;
          --rotate-y: 0deg;

          position: relative;
          z-index: 0;
          display: flex;
          min-width: 0;
          min-height: 310px;
          flex-direction: column;
          overflow: hidden;
          padding: 26px;

          border: 1px solid #e5eaf1;
          border-radius: 24px;

          opacity: 0;
          transform: translateY(16px) scale(0.99);
          transform-origin: center center;

          box-shadow: 0 5px 18px rgba(7, 21, 47, 0.035);

          transition: opacity 500ms ease,
            transform 300ms cubic-bezier(0.2, 0.75, 0.25, 1),
            box-shadow 300ms ease, border-color 250ms ease;

          transition-delay: var(--delay, 0ms);
        }

        .feature-card.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .feature-card-light {
          border-color: #e5eaf1;
          background: #ffffff;
          color: #07152f;
        }

        .feature-card-blue {
          border-color: #dce7ff;
          background: #f0f5ff;
          color: #07152f;
        }

        .feature-card-dark {
          border-color: #19345a;
          background: #07152f;
          color: #ffffff;
        }

        .feature-icon {
          background: #eaf1ff;
          color: #315caa;
          transition: transform 300ms ease;
        }

        .feature-icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .feature-card-blue .feature-icon {
          background: #dce8ff;
          color: #2862cb;
        }

        .feature-card-dark .feature-icon {
          background: #193967;
          color: #b9d4ff;
        }

        .feature-number {
          color: #94a3b8;
        }

        .feature-card-blue .feature-number {
          color: #7186ad;
        }

        .feature-card-dark .feature-number {
          color: #8fa8ce;
        }

        .feature-card-light p,
        .feature-card-blue p {
          color: #64748b;
        }

        .feature-card-dark p {
          color: #c4d1e3;
        }

        .feature-card-divider {
          height: 1px;
          background: #e8edf4;
        }

        .feature-card-blue .feature-card-divider {
          background: #dce5f5;
        }

        .feature-card-dark .feature-card-divider {
          background: rgba(255, 255, 255, 0.14);
        }

        @media (hover: hover) and (pointer: fine) {
          .feature-card:hover {
            z-index: 2;
            opacity: 1;
            transform: translateY(-6px) scale(1.015) perspective(1000px)
              rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
            box-shadow: 0 22px 44px rgba(7, 21, 47, 0.12),
              0 6px 16px rgba(7, 21, 47, 0.045);
            transition-delay: 0ms;
          }

          .feature-card-light:hover,
          .feature-card-blue:hover {
            border-color: #b9cdf3;
          }

          .feature-card-dark:hover {
            border-color: #4775b9;
          }

          .feature-card:hover .feature-icon {
            transform: scale(1.06);
          }
        }

        @keyframes headingReveal {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 640px) {
          .feature-card {
            padding: 28px;
          }
        }

        @media (hover: none), (pointer: coarse) {
          .feature-card,
          .feature-card.is-visible {
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .feature-heading,
          .feature-card,
          .feature-icon {
            animation: none;
            transition: none;
          }

          .feature-card,
          .feature-card.is-visible {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
