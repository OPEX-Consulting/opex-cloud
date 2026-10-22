"use client";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    label: "INFRASTRUCTURE",
    title: "A better foundation for your business.",
    description:
      "Flexible cloud infrastructure designed to support your applications today and your growth tomorrow.",
    icon: "server",
    className: "bento-infrastructure",
    accent: "accent-blue",
  },
  {
    number: "02",
    label: "BACKUP & MONITORING",
    title: "Confidence in every layer.",
    description:
      "Stay informed about your systems and prepare for unexpected disruptions with monitoring and backup strategies.",
    icon: "shield",
    className: "bento-monitoring",
    accent: "accent-navy",
  },
  {
    number: "03",
    label: "LOCAL SUPPORT",
    title: "Technology is better with people.",
    description:
      "Get practical guidance from a team that understands your environment, your challenges and your business goals.",
    icon: "support",
    className: "bento-support",
    accent: "accent-blue",
  },
  {
    number: "04",
    label: "NAIRA BILLING",
    title: "Clarity from day one.",
    description:
      "Manage your cloud spending with Naira billing designed for the needs of Nigerian businesses.",
    icon: "billing",
    className: "bento-billing",
    accent: "accent-green",
  },
  {
    number: "05",
    label: "CLOUD MIGRATION",
    title: "Move forward, with a plan.",
    description:
      "Transition your workloads with a structured approach that makes moving to the cloud more manageable.",
    icon: "migration",
    className: "bento-migration",
    accent: "accent-purple",
  },
  {
    number: "06",
    label: "DATA & COMPLIANCE",
    title: "Your data deserves attention.",
    description:
      "Build clearer practices around data protection, access and the way your cloud environment is managed.",
    icon: "lock",
    className: "bento-data",
    accent: "accent-navy",
  },
];

function FeatureIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.45,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "server":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <rect x="7" y="8" width="34" height="13" rx="3.5" />
          <rect x="7" y="27" width="34" height="13" rx="3.5" />
          <path d="M13 14.5h.01M13 33.5h.01M19 14.5h15M19 33.5h15" />
        </svg>
      );

    case "shield":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="m24 5 16 6v11c0 10-6.7 17-16 21-9.3-4-16-11-16-21V11l16-6Z" />
          <path d="m17 24 5 5 10-11" />
        </svg>
      );

    case "support":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M8 25v-4a16 16 0 0 1 32 0v4" />
          <rect x="5" y="22" width="8" height="13" rx="4" />
          <rect x="35" y="22" width="8" height="13" rx="4" />
          <path d="M35 34c-2 5-6 7-12 7h-3" />
        </svg>
      );

    case "billing":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <rect x="5" y="10" width="38" height="29" rx="5" />
          <path d="M5 19h38M32 28h.01" />
          <path d="M12 10V7a3 3 0 0 1 3-3h19" />
        </svg>
      );

    case "migration":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <rect x="5" y="6" width="15" height="15" rx="3" />
          <rect x="28" y="27" width="15" height="15" rx="3" />
          <path d="M20 13h6a5 5 0 0 1 5 5v9m-5-5 5 5 5-5" />
        </svg>
      );

    case "lock":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <rect x="7" y="20" width="34" height="23" rx="5" />
          <path d="M15 20v-7a9 9 0 0 1 18 0v7M24 29v6" />
        </svg>
      );

    default:
      return null;
  }
}

export default function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className={`cloud-features ${isVisible ? "is-visible" : ""}`}
    >
      <div className="cloud-features-container">
        <header className="cloud-features-header">
          <h2>
            Powerful cloud.
            <br />
            <span>Made simple.</span>
          </h2>

          <p>
            Everything you need to run, protect and grow your business in the
            cloud. Thoughtfully designed around the way you work.
          </p>
        </header>

        <div className="cloud-bento">
          {features.map((feature, index) => (
            <article
              key={feature.number}
              className={`cloud-card ${feature.className} ${feature.accent}`}
              style={
                {
                  "--card-index": index,
                } as React.CSSProperties
              }
            >
              <div className="cloud-card-header">
                <span>{feature.label}</span>
                <span className="cloud-card-number">{feature.number}</span>
              </div>

              <div className="cloud-card-art" aria-hidden="true">
                <FeatureIcon name={feature.icon} />
              </div>

              <div className="cloud-card-copy">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .cloud-features {
          padding: clamp(80px, 10vw, 132px) 24px;
          overflow: hidden;
          background: var(--surface, #fff);
          color: var(--text-primary, #07152f);
          font-family: var(--font-primary, var(--font-montserrat, sans-serif));
        }

        .cloud-features-container {
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
        }

        .cloud-features-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 44px;
          margin-bottom: 48px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 650ms ease, transform 650ms ease;
        }

        .is-visible .cloud-features-header {
          opacity: 1;
          transform: translateY(0);
        }

        .cloud-features-header h2 {
          max-width: 720px;
          margin: 0;
          color: var(--brand-navy, #07152f);
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 650;
          letter-spacing: -0.078em;
          line-height: 1.02;
        }

        .cloud-features-header h2 span {
          color: var(--text-secondary, #727b8c);
          font-weight: 450;
        }

        .cloud-features-header p {
          max-width: 340px;
          margin: 0 0 5px;
          color: var(--text-secondary, #687386);
          font-size: 0.95rem;
          line-height: 1.85;
        }

        .cloud-bento {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 16px;
          align-items: stretch;
        }

        .cloud-card {
          --icon-color: var(--brand-blue, #3977e8);
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 300px;
          padding: 27px;
          overflow: hidden;
          border: 1px solid var(--border, #e9edf2);
          border-radius: 24px;
          background: var(--surface-secondary, #f7f9fc);
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 600ms ease,
            transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1),
            background-color 250ms ease, border-color 250ms ease;
          transition-delay: calc(var(--card-index) * 70ms);
        }

        .is-visible .cloud-card {
          opacity: 1;
          transform: translateY(0);
        }

        .cloud-card:hover {
          border-color: var(--border-hover, #d5deeb);
          background: var(--surface, #fff);
        }

        .bento-infrastructure {
          grid-column: span 7;
          grid-row: span 2;
          min-height: 410px;
          background: var(--surface-secondary, #f3f6fb);
          --icon-color: var(--brand-blue, #3977e8);
        }

        .bento-monitoring {
          grid-column: span 5;
          min-height: 260px;
          --icon-color: var(--brand-navy, #07152f);
        }

        .bento-support {
          grid-column: span 5;
          min-height: 290px;
          --icon-color: var(--brand-blue, #3977e8);
          background: var(--surface, #fff);
        }

        .bento-billing,
        .bento-migration,
        .bento-data {
          grid-column: span 4;
          min-height: 315px;
        }

        .accent-blue {
          --icon-color: var(--brand-blue, #3977e8);
        }

        .accent-navy {
          --icon-color: var(--brand-navy, #07152f);
        }

        .accent-green {
          --icon-color: var(--success, #287a5b);
        }

        .accent-purple {
          --icon-color: var(--brand-blue, #3977e8);
        }

        .cloud-card-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: var(--text-secondary, #687386);
          font-size: 0.65rem;
          font-weight: 650;
          letter-spacing: 0.105em;
          line-height: 1.5;
        }

        .cloud-card-number {
          flex-shrink: 0;
          font-size: 0.7rem;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0;
          opacity: 0.7;
        }

        .cloud-card-art {
          position: absolute;
          top: 52px;
          right: 22px;
          display: grid;
          place-items: center;
          width: 100px;
          height: 100px;
          color: var(--icon-color);
          opacity: 0.85;
          pointer-events: none;
          transition: transform 350ms ease, opacity 350ms ease;
        }

        .cloud-card-art :global(svg) {
          display: block;
          width: 100%;
          height: 100%;
        }

        .cloud-card:hover .cloud-card-art {
          opacity: 1;
          transform: translateY(-3px) scale(1.04);
        }

        .bento-infrastructure .cloud-card-art {
          top: 54px;
          right: 28px;
          width: 175px;
          height: 175px;
          opacity: 0.9;
        }

        .bento-support .cloud-card-art {
          top: 50px;
          right: 18px;
          width: 90px;
          height: 90px;
        }

        .cloud-card-copy {
          position: relative;
          z-index: 1;
          max-width: 100%;
          margin-top: auto;
          padding-top: 120px;
        }

        .bento-infrastructure .cloud-card-copy {
          max-width: 430px;
          padding-top: 185px;
        }

        .bento-support .cloud-card-copy {
          padding-top: 100px;
        }

        .bento-billing .cloud-card-copy,
        .bento-migration .cloud-card-copy,
        .bento-data .cloud-card-copy {
          padding-top: 100px;
        }

        .cloud-card-copy h3 {
          max-width: 420px;
          margin: 0;
          color: var(--text-primary, #07152f);
          font-size: clamp(1.3rem, 2vw, 1.8rem);
          font-weight: 620;
          letter-spacing: -0.055em;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .bento-infrastructure .cloud-card-copy h3 {
          max-width: 390px;
          font-size: clamp(1.8rem, 3vw, 2.65rem);
          letter-spacing: -0.065em;
        }

        .cloud-card-copy p {
          max-width: 420px;
          margin: 12px 0 0;
          color: var(--text-secondary, #687386);
          font-size: 0.84rem;
          line-height: 1.75;
          overflow-wrap: anywhere;
        }

        .bento-billing .cloud-card-copy h3,
        .bento-migration .cloud-card-copy h3,
        .bento-data .cloud-card-copy h3 {
          font-size: clamp(1.28rem, 1.65vw, 1.55rem);
        }

        @media (max-width: 900px) {
          .cloud-features-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 20px;
          }

          .cloud-features-header p {
            max-width: 550px;
          }

          .cloud-bento {
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 14px;
          }

          .bento-infrastructure {
            grid-column: span 6;
            grid-row: auto;
            min-height: 350px;
          }

          .bento-monitoring,
          .bento-support {
            grid-column: span 3;
            min-height: 320px;
          }

          .bento-billing,
          .bento-migration,
          .bento-data {
            grid-column: span 3;
            min-height: 300px;
          }

          .bento-infrastructure .cloud-card-copy {
            max-width: 430px;
          }

          .bento-infrastructure .cloud-card-art {
            width: 145px;
            height: 145px;
          }

          .bento-support .cloud-card-copy {
            padding-top: 110px;
          }
        }

        @media (max-width: 600px) {
          .cloud-features {
            padding: 76px 18px;
          }

          .cloud-features-header {
            margin-bottom: 30px;
          }

          .cloud-features-header h2 {
            font-size: clamp(2.5rem, 11vw, 3.4rem);
            letter-spacing: -0.075em;
          }

          .cloud-features-header p {
            font-size: 0.91rem;
          }

          .cloud-bento {
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }

          .cloud-card,
          .bento-infrastructure,
          .bento-monitoring,
          .bento-support,
          .bento-billing,
          .bento-migration,
          .bento-data {
            grid-column: 1;
            grid-row: auto;
            min-height: 290px;
            padding: 23px;
            border-radius: 20px;
          }

          .bento-infrastructure {
            min-height: 340px;
          }

          .bento-infrastructure .cloud-card-art {
            top: 47px;
            right: 18px;
            width: 125px;
            height: 125px;
          }

          .bento-infrastructure .cloud-card-copy {
            padding-top: 155px;
          }

          .cloud-card-art {
            top: 48px;
            right: 17px;
            width: 78px;
            height: 78px;
          }

          .bento-support .cloud-card-art {
            top: 45px;
            right: 15px;
            width: 78px;
            height: 78px;
          }

          .cloud-card-copy,
          .bento-support .cloud-card-copy,
          .bento-billing .cloud-card-copy,
          .bento-migration .cloud-card-copy,
          .bento-data .cloud-card-copy {
            padding-top: 110px;
          }

          .cloud-card-copy h3 {
            font-size: 1.55rem;
          }

          .bento-infrastructure .cloud-card-copy h3 {
            font-size: 1.9rem;
          }

          .cloud-card-copy p {
            font-size: 0.82rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud-features-header,
          .cloud-card,
          .cloud-card-art {
            transition: none !important;
          }

          .cloud-features-header,
          .cloud-card {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
