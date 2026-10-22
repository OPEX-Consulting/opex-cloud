"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "./Navbar";

type HerosectionProps = {
  onJoinWaitlist: () => void;
};

const HEADLINES = [
  ["Cloud infrastructure,", "made simpler."],
  ["Your business,", "ready for the cloud."],
] as const;

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";

function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setDisplayText(text);
      return;
    }

    let frame = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let animationFrame: number | undefined;
    let cancelled = false;

    const totalFrames = 24;
    const frameDuration = 35;

    const scramble = () => {
      if (cancelled) return;

      const progress = Math.min(frame / totalFrames, 1);
      const revealedCharacters = Math.floor(progress * text.length);

      const nextText = Array.from(text)
        .map((character, index) => {
          if (character === " " || character === ",") return character;
          if (index < revealedCharacters) return character;

          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        })
        .join("");

      setDisplayText(nextText);
      frame++;

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
    }, 250);

    return () => {
      cancelled = true;

      if (timeout !== undefined) clearTimeout(timeout);

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

export default function Herosection({ onJoinWaitlist }: HerosectionProps) {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const interval = setInterval(() => {
      setHeadlineIndex((current) => (current + 1) % HEADLINES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const headline = HEADLINES[headlineIndex];

  return (
    <>
      {/* Pass the shared waitlist handler to the navbar */}
      <Navbar onJoinWaitlist={onJoinWaitlist} />

      <section
        id="home"
        className="relative isolate min-h-screen overflow-hidden bg-[#050505]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <Image
            src="/images/cloud.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-[1.04] object-cover object-center"
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/20"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/5 via-transparent to-black/25"
        />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 pb-16 pt-24 sm:px-8 lg:px-12">
          <div className="hero-content mx-auto w-full max-w-5xl text-center">
            <h1
              className="hero-reveal mx-auto max-w-5xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
              aria-live="off"
            >
              <span className="headline-line">
                <ScrambleText
                  key={`${headlineIndex}-first`}
                  text={headline[0]}
                />
              </span>

              <span className="headline-line">
                <ScrambleText
                  key={`${headlineIndex}-second`}
                  text={headline[1]}
                />
              </span>
            </h1>

            <p className="hero-reveal hero-delay-1 mx-auto mt-6 max-w-lg text-pretty text-sm font-medium leading-6 tracking-[-0.01em] text-white/95 sm:text-base sm:leading-7">
              Simple, reliable cloud infrastructure to help your business grow.
            </p>

            <div className="hero-reveal hero-delay-2 mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onJoinWaitlist}
                className="hero-cta inline-flex min-h-12 items-center justify-center rounded-full bg-[#07152f] px-7 py-3 text-sm font-semibold !text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#10264a] hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Join early access
              </button>

              <a
                href="#contact"
                className="hero-cta inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold !text-[#07152f] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:!text-[#07152f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Talk to us
              </a>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 to-transparent"
        />

        <style jsx>{`
          .hero-content {
            transform: translateY(-28px);
          }

          .headline-line {
            display: block;
            min-height: 1.08em;
          }

          .scramble-text {
            display: inline-block;
            white-space: pre-wrap;
            font-variant-ligatures: none;
          }

          .hero-reveal {
            animation: heroReveal 800ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
          }

          .hero-delay-1 {
            animation-delay: 120ms;
          }

          .hero-delay-2 {
            animation-delay: 240ms;
          }

          .hero-cta {
            box-shadow: 0 6px 22px rgb(0 0 0 / 14%);
          }

          .hero-cta:hover {
            box-shadow: 0 10px 28px rgb(0 0 0 / 20%);
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

          @media (prefers-reduced-motion: reduce) {
            .hero-content {
              transform: none;
            }

            .hero-reveal {
              animation: none;
            }
          }

          @media (max-width: 639px) {
            .headline-line {
              min-height: auto;
            }

            .hero-content {
              transform: translateY(-12px);
            }
          }
        `}</style>
      </section>
    </>
  );
}
