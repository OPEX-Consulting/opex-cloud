"use client";

import Navbar from "./Navbar";
import { useRouter } from "next/navigation";

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 shrink-0 text-[#9bc0ff]"
    >
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

export default function Herosection() {
  const routerInterface = useRouter();

  return (
    <>
      <Navbar />

      <section
        id="home"
        aria-labelledby="hero-heading"
        className="relative isolate min-h-[100svh] overflow-hidden bg-[#030916] text-white"
      >
        {/* Background video */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 overflow-hidden"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          >
            <source src="/video/brandvideo.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Readability overlays */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[#030916]/40"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-gradient-to-b from-[#030916]/55 via-[#07152f]/20 to-[#030916]/75"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_42%,rgba(49,92,170,0.18)_0%,rgba(7,21,47,0.08)_40%,transparent_72%)]"
        />

        {/* Hero content */}
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[1440px] items-center justify-center px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12">
          <div className="hero-content mx-auto w-full max-w-6xl text-center">
            {/* Static headline */}
            <h1
              id="hero-heading"
              className="mx-auto max-w-4xl text-balance text-[clamp(2rem,4.2vw,4.25rem)] font-bold leading-[1.18] tracking-[-0.035em] text-white"
            >
              <span className="headline-line">
                Nigerian cloud, billed in naira.
              </span>

              <span className="headline-line headline-accent">
                Your data stays in the country.
              </span>
            </h1>

            {/* Supporting statement */}
            <p className="mx-auto mt-7 max-w-2xl text-pretty text-sm leading-7 text-white/85 sm:mt-8 sm:text-base sm:leading-7 lg:text-lg">
              Cloud infrastructure for Nigerian businesses, with straightforward
              Naira billing and practical support to help you build, deploy and
              manage your workloads.
            </p>

            {/* Current offering */}
            <div
              className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
              aria-label="Current cloud offering"
            >
              <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-wide text-white/90 sm:text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9bc0ff]/30 bg-[#9bc0ff]/10">
                  <CheckIcon />
                </span>
                Virtual Private Cloud
              </span>

              <span
                aria-hidden="true"
                className="hidden h-5 w-px bg-white/20 sm:block"
              />

              <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-wide text-white/90 sm:text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9bc0ff]/30 bg-[#9bc0ff]/10">
                  <CheckIcon />
                </span>
                Pay-as-you-go
              </span>
            </div>

            {/* Calls to action */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
              <button
                type="button"
                onClick={() => routerInterface.push("/onboarding")}
                className="hero-cta group inline-flex min-h-[54px] w-full max-w-[300px] cursor-pointer items-center justify-center gap-3 rounded-full bg-[#07152f] px-7 py-3.5 text-sm font-semibold !text-white shadow-lg shadow-[#07152f]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#10264b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bc0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030916] sm:w-auto sm:min-w-[230px]"
              >
                Talk to a Cloud Expert
              </button>

              {/* Secondary CTA */}
              <a
                href="#services"
                className="hero-cta group inline-flex min-h-[54px] w-full max-w-[300px] items-center justify-center gap-3 rounded-full border border-white/90 bg-white px-7 py-3.5 text-sm font-semibold !text-[#07152f] transition duration-300 hover:-translate-y-0.5 hover:border-[#eaf1f9] hover:bg-[#eaf1f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bc0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030916] sm:w-auto sm:min-w-[230px]"
              >
                Explore Our Services
              </a>
            </div>

            {/* Clear value proposition */}
            <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-3 text-xs leading-5 text-white/70 sm:mt-12 sm:text-sm">
              <span
                aria-hidden="true"
                className="h-px w-8 shrink-0 bg-white/25"
              />

              <p>
                Local relevance. Flexible cloud infrastructure. Practical
                support.
              </p>

              <span
                aria-hidden="true"
                className="h-px w-8 shrink-0 bg-white/25"
              />
            </div>
          </div>
        </div>

        {/* Bottom transition into the next section */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#030916]/70 to-transparent"
        />

        <style jsx>{`
          .hero-content {
            transform: translateY(35px);
          }

          .headline-line {
            display: block;
            color: #ffffff;
          }

          .headline-line + .headline-line {
            margin-top: 0.12em;
          }

          .headline-accent {
            color: #9bc0ff;
          }

          .hero-cta {
            box-shadow: 0 8px 28px rgb(0 0 0 / 15%);
          }

          .hero-cta:hover {
            box-shadow: 0 12px 32px rgb(0 0 0 / 24%);
          }

          @media (max-width: 639px) {
            .hero-content {
              transform: translateY(20px);
            }

            .headline-line + .headline-line {
              margin-top: 0.2em;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-content {
              transform: none;
            }

            .hero-cta,
            .hero-cta:hover {
              transition: none;
              transform: none;
            }
          }
        `}</style>
      </section>
    </>
  );
}
