"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Partnership() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="partners"
      aria-labelledby="partnership-heading"
      className="relative overflow-hidden bg-[#eaf1f9] px-5 py-24 text-[#07152f] sm:px-8 sm:py-28 lg:px-12 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`mx-auto max-w-4xl text-center transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2
            id="partnership-heading"
            className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.065em] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Better together.
            <span className="mt-2 block text-[#3977e8]">Built on trust.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#52647e] sm:mt-8 sm:text-lg sm:leading-8">
            Building a simpler cloud experience through the right partnerships,
            shared expertise, and a commitment to helping businesses move
            forward.
          </p>
        </div>

        <div
          className={`mx-auto mt-16 max-w-5xl transition-all delay-150 duration-1000 ease-out sm:mt-20 lg:mt-24 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <article
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden rounded-[28px] border bg-white transition-all duration-500 ease-out sm:rounded-[36px] ${
              isHovered
                ? "scale-[1.005] border-[#c7d8ee] shadow-[0_32px_100px_rgba(7,21,47,0.12)]"
                : "border-white/90 shadow-[0_20px_70px_rgba(7,21,47,0.055)]"
            }`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#eaf1f9] transition-transform duration-1000 ease-out ${
                isHovered ? "scale-125" : "scale-100"
              }`}
            />

            <div className="relative grid min-h-[340px] md:grid-cols-[1fr_0.85fr]">
              <div className="flex flex-col justify-center p-7 sm:p-10 md:p-12 lg:p-16">
                <h3 className="text-3xl font-semibold tracking-[-0.055em] sm:text-4xl lg:text-5xl">
                  Unitellas
                </h3>

                <p className="mt-5 max-w-md text-sm leading-7 text-[#52647e] sm:text-base sm:leading-8">
                  Together, we’re working towards a more accessible and
                  dependable digital infrastructure for Nigerian businesses.
                </p>

                <div className="mt-8 h-px w-full max-w-xs bg-[#e5ebf3]" />

                <p className="mt-5 max-w-sm text-xs leading-6 text-[#718096] sm:text-sm">
                  Shared expertise. Stronger foundations. More possibilities.
                </p>
              </div>

              <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden border-t border-[#e8edf4] bg-[#f7faff] p-8 md:min-h-full md:border-l md:border-t-0">
                <div
                  aria-hidden="true"
                  className={`absolute h-44 w-44 rounded-full border border-[#dce7f5] transition-transform duration-1000 ease-out sm:h-56 sm:w-56 ${
                    isHovered ? "scale-110" : "scale-100"
                  }`}
                />

                <div
                  aria-hidden="true"
                  className={`absolute h-32 w-32 rounded-full border border-[#dce7f5] transition-transform duration-700 ease-out ${
                    isHovered ? "scale-110" : "scale-100"
                  }`}
                />

                <div
                  className={`relative flex min-h-28 min-w-48 items-center justify-center rounded-2xl border border-white bg-white/90 p-7 shadow-[0_12px_40px_rgba(7,21,47,0.06)] transition-all duration-500 sm:min-h-32 sm:min-w-60 ${
                    isHovered
                      ? "-translate-y-1 shadow-[0_20px_50px_rgba(7,21,47,0.10)]"
                      : "translate-y-0"
                  }`}
                >
                  <Image
                    src="/images/unitellas.webp"
                    alt="Unitellas logo"
                    width={220}
                    height={100}
                    sizes="(max-width: 640px) 180px, 220px"
                    className="h-auto max-h-16 w-auto max-w-full object-contain sm:max-h-20"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          section *,
          section *::before,
          section *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
