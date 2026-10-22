"use client";

import { useEffect, useRef, useState } from "react";

const countriesTop = [
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Rwanda", flag: "🇷🇼" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Ethiopia", flag: "🇪🇹" },
  { name: "Tanzania", flag: "🇹🇿" },
  { name: "Uganda", flag: "🇺🇬" },
];

const countriesBottom = [
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Côte d’Ivoire", flag: "🇨🇮" },
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "Zambia", flag: "🇿🇲" },
  { name: "Botswana", flag: "🇧🇼" },
  { name: "Angola", flag: "🇦🇴" },
  { name: "Namibia", flag: "🇳🇦" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Tunisia", flag: "🇹🇳" },
  { name: "Mauritius", flag: "🇲🇺" },
];

type Country = {
  name: string;
  flag: string;
};

function CountryPill({
  country,
  duplicate = false,
}: {
  country: Country;
  duplicate?: boolean;
}) {
  return (
    <div
      aria-hidden={duplicate || undefined}
      className="country-pill flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-3"
    >
      <span aria-hidden="true" className="country-flag text-xl leading-none">
        {country.flag}
      </span>

      <span className="whitespace-nowrap text-sm font-medium text-[#07152f]">
        {country.name}
      </span>
    </div>
  );
}

function MarqueeRow({
  countries,
  direction,
  label,
}: {
  countries: Country[];
  direction: "left" | "right";
  label: string;
}) {
  const items = [...countries, ...countries];

  return (
    <div
      role="group"
      aria-label={label}
      className="marquee-viewport overflow-hidden py-1"
    >
      <div
        className={`marquee-track flex w-max items-center gap-3 px-3 sm:gap-4 ${
          direction === "right" ? "marquee-right" : "marquee-left"
        }`}
      >
        {items.map((country, index) => (
          <CountryPill
            key={`${country.name}-${index}`}
            country={country}
            duplicate={index >= countries.length}
          />
        ))}
      </div>
    </div>
  );
}

export default function MarqueeSection() {
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
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="African countries connected by cloud"
      className="overflow-hidden bg-white py-10 sm:py-14"
    >
      <div
        className={`marquee-heading mx-auto mb-7 max-w-7xl px-5 text-center sm:mb-9 sm:px-8 ${
          isVisible ? "heading-visible" : ""
        }`}
      >
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#07152f] sm:text-2xl">
          Built for Nigeria. Accessible across borders.
        </h2>
      </div>

      <div
        className={`marquee-rows flex flex-col gap-3 sm:gap-4 ${
          isVisible ? "rows-visible" : ""
        }`}
      >
        <MarqueeRow
          countries={countriesTop}
          direction="left"
          label="African countries scrolling left"
        />

        <MarqueeRow
          countries={countriesBottom}
          direction="right"
          label="African countries scrolling right"
        />
      </div>

      <style jsx>{`
        .marquee-heading {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 700ms ease,
            transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .heading-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .marquee-rows {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 800ms ease 150ms,
            transform 800ms cubic-bezier(0.2, 0.7, 0.2, 1) 150ms;
        }

        .rows-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .marquee-viewport {
          width: 100%;
        }

        .marquee-track {
          flex-wrap: nowrap;
          animation-duration: 42s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        .marquee-left {
          animation-name: marquee-left;
        }

        .marquee-right {
          animation-name: marquee-right;
        }

        .marquee-viewport:hover .marquee-track {
          animation-play-state: paused;
        }

        .country-pill {
          transition: transform 250ms ease, border-color 250ms ease,
            background-color 250ms ease, box-shadow 250ms ease;
        }

        .country-pill:hover {
          transform: translateY(-3px);
          border-color: #cbd5e1;
          background-color: #f8fafc;
          box-shadow: 0 5px 16px rgb(7 21 47 / 6%);
        }

        .country-flag {
          display: inline-block;
          transition: transform 250ms ease;
        }

        .country-pill:hover .country-flag {
          transform: scale(1.12);
        }

        @keyframes marquee-left {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes marquee-right {
          from {
            transform: translateX(-50%);
          }

          to {
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-heading,
          .marquee-rows {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .marquee-track {
            animation: none;
          }

          .country-pill,
          .country-flag {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
