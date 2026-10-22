"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

const FEATURES = [
  {
    number: "01",
    title: "Local Data Residency",
    description:
      "Keep your business data closer to home with infrastructure designed around local requirements and reliable access.",
    icon: "residency",
    theme: "light",
  },
  {
    number: "02",
    title: "Data Colocation",
    description:
      "Place your servers in a professionally managed environment built for dependable power, connectivity, and security.",
    icon: "colocation",
    theme: "blue",
  },
  {
    number: "03",
    title: "Infrastructure as a Service",
    description:
      "Scale computing, storage, and networking resources to match your business needs without unnecessary complexity.",
    icon: "infrastructure",
    theme: "dark",
  },
  {
    number: "04",
    title: "Cloud Hosting Services",
    description:
      "Host your websites, applications, and workloads on infrastructure designed for performance and availability.",
    icon: "hosting",
    theme: "light",
  },
  {
    number: "05",
    title: "Managed Cloud Services",
    description:
      "Get practical support with cloud operations, monitoring, maintenance, and the everyday work of keeping systems running.",
    icon: "managed",
    theme: "blue",
  },
  {
    number: "06",
    title: "Cloud Consulting",
    description:
      "Make informed infrastructure decisions with guidance on cloud adoption, migration, architecture, and optimisation.",
    icon: "consulting",
    theme: "light",
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
    case "residency":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21" />
        </svg>
      );

    case "colocation":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="4" y="3.5" width="16" height="7" rx="1.8" />
          <rect x="4" y="13.5" width="16" height="7" rx="1.8" />
          <path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" />
        </svg>
      );

    case "infrastructure":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <rect x="8" y="3.5" width="8" height="6" rx="1.5" />
          <rect x="3" y="15" width="7" height="5.5" rx="1.5" />
          <rect x="14" y="15" width="7" height="5.5" rx="1.5" />
          <path d="M12 9.5v2.5M6.5 15v-3h11v3" />
        </svg>
      );

    case "hosting":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <path d="M7.2 18.5h10.1a4.1 4.1 0 0 0 .3-8.2 5.8 5.8 0 0 0-11.2-1.1 4.6 4.6 0 0 0 .8 9.3Z" />
          <path d="M9 14.5h6M12 12v5" />
        </svg>
      );

    case "managed":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 12.2 11 14.7l5-5.4" />
        </svg>
      );

    case "consulting":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
          <circle cx="10.8" cy="10.8" r="6.3" />
          <path d="m15.5 15.5 4.2 4.2M8.5 9.5h4.6M8.5 12.2h3" />
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
      id="features"
      className="feature-section relative bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="feature-heading mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <h2 className="text-balance text-3xl font-bold leading-[1.1] tracking-[-0.055em] text-[#07152f] sm:text-4xl lg:text-5xl">
            Everything you need.
            <span className="mt-1 block text-[#64748b]">
              Nothing you don’t.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#64748b] sm:text-base">
            Practical cloud infrastructure and expert support to help your
            business operate, grow, and move forward with confidence.
          </p>
        </div>

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
              <div className="mb-8 flex items-start justify-between">
                <div className="feature-icon flex h-12 w-12 items-center justify-center rounded-[16px]">
                  <span className="h-6 w-6">
                    <ServiceIcon name={feature.icon} />
                  </span>
                </div>

                <span className="feature-number text-xs font-semibold tracking-[0.12em]">
                  {feature.number}
                </span>
              </div>

              <h3 className="max-w-[280px] text-xl font-semibold leading-snug tracking-[-0.035em] sm:text-2xl">
                {feature.title}
              </h3>

              <p className="mt-3 max-w-[340px] text-sm leading-6">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[22px] border border-[#e0e6ee] bg-white px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#07152f]">
                Not sure what your business needs?
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#64748b]">
                Let’s work together to find the right cloud solution.
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex min-h-11 items-center justify-center self-start rounded-full bg-[#07152f] px-5 py-3 text-sm font-semibold !text-white transition-colors duration-200 hover:bg-[#19345a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-2 sm:self-auto"
            >
              Talk to our team
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .feature-section {
          position: relative;
          isolation: isolate;
        }

        .feature-heading {
          animation: headingReveal 650ms ease both;
        }

        .feature-grid {
          position: relative;
          isolation: auto;
          overflow: visible;
          padding: 16px 8px 28px;
        }

        .feature-card {
          --rotate-x: 0deg;
          --rotate-y: 0deg;

          position: relative;
          z-index: 0;
          min-width: 0;
          min-height: 290px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 26px;

          border: 1px solid #e5eaf1;
          border-radius: 24px;

          opacity: 0;
          transform: translateY(16px) scale(0.985);
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
          background: #eaf1ff;
          color: #07152f;
        }

        .feature-card-dark {
          border-color: #19345a;
          background: #07152f;
          color: #ffffff;
        }

        @media (hover: hover) and (pointer: fine) {
          .feature-card:hover {
            z-index: 10;
            opacity: 1;
            transform: translateY(-10px) scale(1.035) perspective(1000px)
              rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
            box-shadow: 0 24px 48px rgba(7, 21, 47, 0.16),
              0 8px 18px rgba(7, 21, 47, 0.07);
            transition-delay: 0ms;
          }

          .feature-card-light:hover,
          .feature-card-blue:hover {
            border-color: #b9cdf3;
          }

          .feature-card-dark:hover {
            border-color: #4775b9;
          }
        }

        .feature-icon {
          background: #eaf1ff;
          color: #3977e8;
          transition: transform 300ms ease;
        }

        .feature-icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .feature-card-blue .feature-icon {
          background: #d7e5ff;
          color: #2862cb;
        }

        .feature-card-dark .feature-icon {
          background: #193967;
          color: #b9d4ff;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.08);
        }

        .feature-number {
          color: #94a3b8;
        }

        .feature-card-blue .feature-number {
          color: #6b83ad;
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
