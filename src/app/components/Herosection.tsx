"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useRouter } from "next/navigation";

const HEADLINES = [
  ["Enterprise Cloud", "Infrastructure."],
  ["Enterprise Cloud,", "Built for Nigeria."],
  ["Infrastructure for", "critical workloads."],
  ["Your cloud.", "Our expertise."],
] as const;

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";

function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    let frame = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let animationFrame: number | undefined;
    let cancelled = false;

    const totalFrames = 20;
    const frameDuration = 35;

    const scramble = () => {
      if (cancelled) return;

      const progress = Math.min(frame / totalFrames, 1);
      const revealedCharacters = Math.floor(progress * text.length);

      const nextText = Array.from(text)
        .map((character, index) => {
          if (character === " " || character === "," || character === ".") {
            return character;
          }

          if (index < revealedCharacters) {
            return character;
          }

          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        })
        .join("");

      setDisplayText(nextText);
      frame += 1;

      if (frame <= totalFrames) {
        timeout = setTimeout(() => {
          if (!cancelled) {
            animationFrame = requestAnimationFrame(scramble);
          }
        }, frameDuration);
      } else {
        setDisplayText(text);
      }
    };

    timeout = setTimeout(() => {
      if (!cancelled) {
        animationFrame = requestAnimationFrame(scramble);
      }
    }, 150);

    return () => {
      cancelled = true;

      if (timeout !== undefined) {
        clearTimeout(timeout);
      }

      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [text]);

  return (
    <span className="scramble-text" aria-label={text}>
      <span aria-hidden="true">{displayText}</span>
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
    >
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const routerInterface = useRouter();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setHeadlineIndex((current) => (current + 1) % HEADLINES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const headline = HEADLINES[headlineIndex];

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
            {/* Main headline */}
            <h1
              id="hero-heading"
              className="hero-reveal mx-auto max-w-5xl text-balance text-[clamp(2.65rem,6.4vw,6rem)] font-extrabold leading-[1.02] tracking-[-0.065em] text-white"
              aria-live="off"
            >
              <span className="headline-line">
                <ScrambleText
                  key={`${headlineIndex}-first`}
                  text={headline[0]}
                />
              </span>

              <span className="headline-line headline-accent">
                <ScrambleText
                  key={`${headlineIndex}-second`}
                  text={headline[1]}
                />
              </span>
            </h1>

            {/* Supporting statement */}
            <p className="hero-reveal hero-delay-1 mx-auto mt-6 max-w-xl text-pretty text-sm leading-7 text-white/80 sm:mt-7 sm:text-base sm:leading-7 lg:text-lg">
              Enterprise cloud infrastructure for Nigerian businesses, with
              practical support to help you build, deploy and manage your
              workloads.
            </p>

            {/* Current offering */}
            <div
              className="hero-reveal hero-delay-1 mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
              aria-label="Current cloud offering"
            >
              <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-wide text-white/85 sm:text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9bc0ff]/30 bg-[#9bc0ff]/10">
                  <CheckIcon />
                </span>
                Virtual Private Cloud
              </span>

              <span
                aria-hidden="true"
                className="hidden h-5 w-px bg-white/20 sm:block"
              />

              <span className="inline-flex items-center gap-2.5 text-xs font-medium tracking-wide text-white/85 sm:text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9bc0ff]/30 bg-[#9bc0ff]/10">
                  <CheckIcon />
                </span>
                Pay-as-you-go
              </span>
            </div>
            {/* Calls to action */}
            <div className="hero-reveal hero-delay-2 mt-9 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
              <button
                type="button"
                onClick={() => routerInterface.push("/onboarding")}
                className="hero-cta group inline-flex min-h-[54px] w-full max-w-[300px] cursor-pointer items-center justify-center gap-3 rounded-full bg-[#07152f] px-7 py-3.5 text-sm font-semibold !text-white shadow-lg shadow-[#07152f]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#10264b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bc0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-w-[230px]"
              >
                Talk to a Cloud Expert
              </button>

              {/* Secondary CTA */}
              <a
                href="#services"
                className="hero-cta group inline-flex min-h-[54px] w-full max-w-[300px] items-center justify-center gap-3 rounded-full border border-white bg-white px-7 py-3.5 text-sm font-semibold !text-[#07152f] transition duration-300 hover:-translate-y-0.5 hover:border-[#eaf1f9] hover:bg-[#eaf1f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9bc0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-w-[230px]"
              >
                Learn More
              </a>
            </div>

            {/* Trust statement */}
            <div className="hero-reveal hero-delay-3 mx-auto mt-10 flex max-w-xl items-center justify-center gap-3 text-xs leading-5 text-white/60 sm:mt-12 sm:text-sm">
              <span
                aria-hidden="true"
                className="h-px w-8 shrink-0 bg-white/25"
              />
              <p>Enterprise cloud infrastructure, built around your needs.</p>
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
            min-height: 1.04em;
            color: #ffffff;
          }

          .headline-accent {
            color: #9bc0ff;
          }

          .scramble-text {
            display: inline-block;
            font-variant-ligatures: none;
          }

          .hero-reveal {
            animation: heroReveal 750ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
          }

          .hero-delay-1 {
            animation-delay: 100ms;
          }

          .hero-delay-2 {
            animation-delay: 200ms;
          }

          .hero-delay-3 {
            animation-delay: 300ms;
          }

          .hero-cta {
            box-shadow: 0 8px 28px rgb(0 0 0 / 15%);
          }

          .hero-cta:hover {
            box-shadow: 0 12px 32px rgb(0 0 0 / 24%);
          }

          @keyframes heroReveal {
            from {
              opacity: 0;
              transform: translateY(12px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 639px) {
            .hero-content {
              transform: translateY(20px);
            }

            .headline-line {
              min-height: auto;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-content {
              transform: none;
            }

            .hero-reveal {
              animation: none;
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
