"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type AboutSectionProps = {
  onJoinWaitlist: () => void;
};

const COLOR_BARS = [
  "#07152f",
  "#16376d",
  "#2859a7",
  "#3977e8",
  "#79a7f7",
  "#b7d0ff",
];

export default function AboutSection({ onJoinWaitlist }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      setReduceMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    const section = sectionRef.current;

    if (!section) {
      return () => {
        mediaQuery.removeEventListener("change", updateMotionPreference);
      };
    }

    if (mediaQuery.matches) {
      setVisible(true);

      return () => {
        mediaQuery.removeEventListener("change", updateMotionPreference);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  const revealClass = `${visible ? "is-visible" : ""} ${
    reduceMotion ? "reduce-motion" : ""
  }`;

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`about-section ${revealClass}`}
      aria-labelledby="about-heading"
    >
      <div className="about-container">
        <div
          className="about-intro reveal-item"
          style={{ "--reveal-delay": "0ms" } as CSSProperties}
        >
          <h2 id="about-heading">
            Good advice.
            <br />
            <span>Better cloud decisions.</span>
          </h2>

          <p>
            Moving to the cloud should make business easier, not more
            complicated. Opex Cloud helps you understand your options and build
            a setup that works for your business.
          </p>
        </div>

        <div className="about-grid">
          {/* Card 1: Clear advice */}
          <article
            className="about-card advice-card reveal-item"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <div className="card-topline">
              <span className="card-index">01</span>
              <span className="card-label">A clearer direction</span>
            </div>

            <div className="advice-visual" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orbit orbit-three" />

              <div className="orbit-center">
                <div className="orbit-center-inner">
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 4L27 10V22L16 28L5 22V10L16 4Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 16L14 20L22 12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <span className="orbit-dot orbit-dot-one" />
              <span className="orbit-dot orbit-dot-two" />
              <span className="orbit-dot orbit-dot-three" />
            </div>

            <div className="card-copy">
              <h3>Advice before technology.</h3>
              <p>
                Understand what your business needs before investing in
                technology. Make informed decisions with a clearer plan.
              </p>
            </div>
          </article>

          {/* Card 2: Flexible cloud solutions */}
          <article
            className="about-card built-card reveal-item"
            style={{ "--reveal-delay": "260ms" } as CSSProperties}
          >
            <div className="card-topline">
              <span className="card-index">02</span>
              <span className="card-label">Made around you</span>
            </div>

            <div className="built-visual" aria-hidden="true">
              <div className="built-glow built-glow-one" />
              <div className="built-glow built-glow-two" />

              <div className="built-window">
                <div className="window-header">
                  <div className="window-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="window-status">
                    <span className="status-dot" />
                    <span>Flexible by design</span>
                  </div>
                </div>

                <div className="window-body">
                  <div className="window-sidebar">
                    <span className="sidebar-line sidebar-line-active" />
                    <span className="sidebar-line" />
                    <span className="sidebar-line sidebar-line-short" />
                    <span className="sidebar-line" />
                  </div>

                  <div className="window-content">
                    <div className="content-heading" />
                    <div className="content-subheading" />

                    <div className="content-chart">
                      {COLOR_BARS.map((color, index) => (
                        <span
                          key={color}
                          className="chart-bar"
                          style={
                            {
                              "--bar-color": color,
                              "--bar-height": `${30 + ((index * 17) % 55)}%`,
                              "--bar-delay": `${index * 110}ms`,
                            } as CSSProperties
                          }
                        />
                      ))}
                    </div>

                    <div className="content-footer">
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-copy">
              <h3>Built for you.</h3>
              <p>
                Every business is different. Your cloud approach should reflect
                your goals, your team, and where you want to go next.
              </p>
            </div>
          </article>

          {/* Card 3: Support */}
          <article
            className="about-card support-card reveal-item"
            style={{ "--reveal-delay": "400ms" } as CSSProperties}
          >
            <div className="card-topline">
              <span className="card-index">03</span>
              <span className="card-label">People who understand</span>
            </div>

            <div className="support-visual" aria-hidden="true">
              <div className="support-halo" />

              <div className="support-message message-one">
                <span className="message-avatar avatar-one">O</span>
                <span className="message-lines">
                  <span />
                  <span />
                </span>
                <span className="message-check">✓</span>
              </div>

              <div className="support-message message-two">
                <span className="message-avatar avatar-two">Y</span>
                <span className="message-lines">
                  <span />
                  <span />
                </span>
                <span className="message-check">✓</span>
              </div>

              <div className="support-message message-three">
                <span className="message-avatar avatar-three">O</span>
                <span className="message-lines">
                  <span />
                  <span />
                </span>
                <span className="message-check">✓</span>
              </div>

              <div className="support-status">
                <span className="support-status-dot" />
                Here to help
              </div>
            </div>

            <div className="card-copy">
              <h3>Support that feels local.</h3>
              <p>
                Get guidance from people who understand your business
                environment, with a focus on making technology easier to use.
              </p>
            </div>
          </article>
        </div>

        {/* Closing CTA */}
        <div
          className="about-closing reveal-item"
          style={{ "--reveal-delay": "540ms" } as CSSProperties}
        >
          <div className="closing-decoration" aria-hidden="true">
            <span className="closing-ring closing-ring-one" />
            <span className="closing-ring closing-ring-two" />
            <span className="closing-ring closing-ring-three" />
            <span className="closing-star">✳</span>
          </div>

          <div className="closing-copy">
            <h3>Less complexity. More room to grow.</h3>
            <p>
              Start with a conversation about your business and where cloud
              technology could take it.
            </p>
          </div>

          <button type="button" className="about-cta" onClick={onJoinWaitlist}>
            Join early access
          </button>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          color: #07152f;
          padding: 120px 24px;
        }

        .about-container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .about-intro {
          max-width: 760px;
          margin-bottom: 54px;
        }

        .about-intro h2 {
          margin: 0;
          color: #07152f;
          font-size: clamp(2.6rem, 5.6vw, 5rem);
          line-height: 1.04;
          letter-spacing: -0.075em;
          font-weight: 650;
        }

        .about-intro h2 span {
          color: #3977e8;
        }

        .about-intro p {
          max-width: 590px;
          margin: 25px 0 0;
          color: #69758a;
          font-size: 16px;
          line-height: 1.85;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 18px;
        }

        .about-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 22px;
          border: 1px solid #e9edf3;
          border-radius: 28px;
          background: #ffffff;
          transition: border-color 250ms ease, box-shadow 250ms ease,
            transform 250ms ease;
        }

        .about-card:hover {
          transform: translateY(-4px);
          border-color: #d5e2f7;
          box-shadow: 0 20px 55px rgba(7, 21, 47, 0.055);
        }

        .advice-card {
          grid-row: span 2;
          min-height: 460px;
          background: radial-gradient(
              circle at 50% 46%,
              rgba(57, 119, 232, 0.07),
              transparent 46%
            ),
            #ffffff;
        }

        .built-card,
        .support-card {
          min-height: 235px;
        }

        .card-topline {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .card-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          border: 1px solid #e7ebf2;
          border-radius: 50%;
          color: #64738a;
          font-size: 11px;
          font-weight: 600;
        }

        .card-label {
          color: #7d899d;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .advice-visual {
          position: relative;
          display: grid;
          flex: 1;
          min-height: 240px;
          place-items: center;
          margin: 8px 0;
        }

        .orbit {
          position: absolute;
          border: 1px solid rgba(57, 119, 232, 0.16);
          border-radius: 50%;
          animation: orbitFloat 8s ease-in-out infinite;
        }

        .orbit-one {
          width: 190px;
          height: 190px;
        }

        .orbit-two {
          width: 275px;
          height: 275px;
          animation-delay: -2s;
        }

        .orbit-three {
          width: 355px;
          height: 355px;
          border-style: dashed;
          border-color: rgba(57, 119, 232, 0.12);
          animation-delay: -4s;
        }

        .orbit-center {
          position: relative;
          z-index: 2;
          display: grid;
          width: 104px;
          height: 104px;
          place-items: center;
          border: 1px solid #dce7fa;
          border-radius: 31px;
          background: #ffffff;
          box-shadow: 0 18px 55px rgba(35, 82, 157, 0.12),
            inset 0 0 0 7px #f7faff;
          animation: centerFloat 5s ease-in-out infinite;
        }

        .orbit-center-inner {
          display: grid;
          width: 54px;
          height: 54px;
          place-items: center;
          border-radius: 18px;
          background: #07152f;
          color: #ffffff;
        }

        .orbit-center-inner svg {
          width: 30px;
          height: 30px;
        }

        .orbit-dot {
          position: absolute;
          z-index: 3;
          width: 10px;
          height: 10px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          background: #3977e8;
          box-shadow: 0 0 0 5px rgba(57, 119, 232, 0.1);
        }

        .orbit-dot-one {
          top: 24%;
          left: 27%;
        }

        .orbit-dot-two {
          right: 18%;
          top: 43%;
          width: 13px;
          height: 13px;
          background: #07152f;
        }

        .orbit-dot-three {
          bottom: 19%;
          left: 39%;
          width: 7px;
          height: 7px;
        }

        .card-copy {
          position: relative;
          z-index: 2;
          margin-top: auto;
        }

        .card-copy h3 {
          margin: 0;
          color: #07152f;
          font-size: clamp(1.3rem, 2.1vw, 1.7rem);
          line-height: 1.25;
          letter-spacing: -0.045em;
          font-weight: 650;
        }

        .card-copy p {
          max-width: 420px;
          margin: 12px 0 0;
          color: #748096;
          font-size: 13px;
          line-height: 1.8;
        }

        .built-visual {
          position: relative;
          display: grid;
          flex: 1;
          min-height: 120px;
          place-items: center;
          margin: 8px 0 12px;
        }

        .built-glow {
          position: absolute;
          width: 190px;
          height: 100px;
          border-radius: 50%;
          filter: blur(35px);
          opacity: 0.6;
          animation: glowDrift 7s ease-in-out infinite;
        }

        .built-glow-one {
          background: rgba(57, 119, 232, 0.17);
        }

        .built-glow-two {
          background: rgba(111, 166, 255, 0.15);
          animation-delay: -3.5s;
        }

        .built-window {
          position: relative;
          z-index: 1;
          width: min(100%, 360px);
          overflow: hidden;
          border: 1px solid #e0e8f5;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 40px rgba(7, 21, 47, 0.07);
          transform: perspective(900px) rotateX(3deg);
          transition: transform 300ms ease;
        }

        .built-card:hover .built-window {
          transform: perspective(900px) rotateX(0deg) translateY(-3px);
        }

        .window-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-bottom: 1px solid #edf1f7;
        }

        .window-dots {
          display: flex;
          gap: 4px;
        }

        .window-dots span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d1d9e6;
        }

        .window-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #738097;
          font-size: 8px;
        }

        .status-dot,
        .support-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3977e8;
          box-shadow: 0 0 0 3px rgba(57, 119, 232, 0.1);
          animation: livePulse 2s ease-in-out infinite;
        }

        .window-body {
          display: grid;
          grid-template-columns: 76px 1fr;
          min-height: 94px;
        }

        .window-sidebar {
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding: 14px 10px;
          border-right: 1px solid #edf1f7;
        }

        .sidebar-line {
          display: block;
          width: 100%;
          height: 4px;
          border-radius: 4px;
          background: #e8edf5;
        }

        .sidebar-line-active {
          background: #3977e8;
        }

        .sidebar-line-short {
          width: 65%;
        }

        .window-content {
          padding: 13px 15px 11px;
        }

        .content-heading {
          width: 45%;
          height: 5px;
          border-radius: 5px;
          background: #07152f;
        }

        .content-subheading {
          width: 29%;
          height: 3px;
          margin-top: 5px;
          border-radius: 5px;
          background: #dce5f3;
        }

        .content-chart {
          display: flex;
          height: 43px;
          align-items: flex-end;
          gap: 6px;
          margin-top: 9px;
          padding: 0 2px;
        }

        .chart-bar {
          flex: 1;
          height: var(--bar-height);
          min-width: 3px;
          border-radius: 3px 3px 1px 1px;
          background: var(--bar-color);
          transform-origin: bottom;
          animation: barPulse 2.8s ease-in-out infinite,
            barBlueShift 7s ease-in-out infinite;
          animation-delay: var(--bar-delay), calc(var(--bar-delay) * -1);
        }

        .content-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .content-footer span {
          display: block;
          width: 28%;
          height: 3px;
          border-radius: 4px;
          background: #e8edf5;
        }

        .support-visual {
          position: relative;
          display: flex;
          flex: 1;
          min-height: 120px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 8px 0 12px;
        }

        .support-halo {
          position: absolute;
          width: 210px;
          height: 120px;
          border: 1px solid rgba(57, 119, 232, 0.12);
          border-radius: 50%;
          background: radial-gradient(
            ellipse,
            rgba(57, 119, 232, 0.07),
            transparent 70%
          );
        }

        .support-message {
          position: relative;
          z-index: 1;
          display: flex;
          width: min(100%, 280px);
          align-items: center;
          gap: 10px;
          padding: 9px 11px;
          border: 1px solid #e8edf5;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 22px rgba(7, 21, 47, 0.045);
          animation: avatarFloat 5s ease-in-out infinite;
        }

        .message-two {
          margin-left: 18px;
          animation-delay: -1.6s;
        }

        .message-three {
          margin-left: -12px;
          animation-delay: -3.2s;
        }

        .message-avatar {
          display: grid;
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
        }

        .avatar-one {
          background: #07152f;
        }

        .avatar-two {
          background: #3977e8;
        }

        .avatar-three {
          background: #7d9fd9;
        }

        .message-lines {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
        }

        .message-lines span {
          display: block;
          width: 80%;
          height: 4px;
          border-radius: 5px;
          background: #dfe6f1;
        }

        .message-lines span + span {
          width: 52%;
          background: #edf1f7;
        }

        .message-check {
          display: grid;
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 50%;
          background: #eaf1ff;
          color: #3977e8;
          font-size: 10px;
        }

        .support-status {
          position: absolute;
          right: 0;
          bottom: -2px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid #e5ebf5;
          border-radius: 999px;
          background: #ffffff;
          color: #64738a;
          font-size: 10px;
          box-shadow: 0 6px 18px rgba(7, 21, 47, 0.04);
        }

        .about-closing {
          position: relative;
          display: flex;
          min-height: 180px;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          overflow: hidden;
          margin-top: 20px;
          padding: 34px 40px;
          border-radius: 28px;
          background: #07152f;
          color: #ffffff;
          isolation: isolate;
        }

        .closing-decoration {
          position: absolute;
          top: 50%;
          right: 19%;
          z-index: -1;
          width: 270px;
          height: 270px;
          pointer-events: none;
          transform: translateY(-50%);
        }

        .closing-ring {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: closingWave 9s ease-in-out infinite;
        }

        .closing-ring-two {
          inset: 24px;
          animation-delay: -3s;
        }

        .closing-ring-three {
          inset: 48px;
          animation-delay: -6s;
        }

        .closing-star {
          position: absolute;
          top: 36%;
          left: 42%;
          color: rgba(255, 255, 255, 0.75);
          font-size: 30px;
          animation: sparkleTurn 18s linear infinite;
        }

        .closing-copy {
          position: relative;
          z-index: 1;
          max-width: 560px;
        }

        .closing-copy h3 {
          margin: 0;
          color: #ffffff;
          font-size: clamp(1.8rem, 3.3vw, 2.8rem);
          line-height: 1.12;
          letter-spacing: -0.06em;
          font-weight: 650;
        }

        .closing-copy p {
          max-width: 460px;
          margin: 14px 0 0;
          color: #b5c1d6;
          font-size: 13px;
          line-height: 1.8;
        }

        .about-cta {
          position: relative;
          z-index: 2;
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          padding: 14px 22px;
          border: 1px solid #ffffff;
          border-radius: 999px;
          background: #ffffff;
          color: #07152f;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition: background-color 200ms ease, border-color 200ms ease,
            color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
        }

        .about-cta:hover {
          transform: translateY(-2px);
          border-color: #eaf1ff;
          background: #eaf1ff;
          color: #07152f;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.14);
        }

        .about-cta:focus-visible {
          outline: 3px solid #3977e8;
          outline-offset: 4px;
        }

        .reveal-item {
          opacity: 0;
          transform: translateY(30px) scale(0.965);
          transition: opacity 750ms cubic-bezier(0.2, 0.7, 0.2, 1),
            transform 750ms cubic-bezier(0.2, 0.7, 0.2, 1);
          transition-delay: var(--reveal-delay, 0ms);
        }

        .is-visible .reveal-item {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .reduce-motion .reveal-item {
          opacity: 1;
          transform: none;
          transition: none;
        }

        @keyframes orbitFloat {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }

          50% {
            transform: rotate(5deg) scale(1.025);
          }
        }

        @keyframes centerFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes barPulse {
          0%,
          100% {
            transform: scaleY(0.94);
          }

          50% {
            transform: scaleY(1.05);
          }
        }

        @keyframes barBlueShift {
          0%,
          100% {
            filter: saturate(0.9);
          }

          50% {
            filter: saturate(1.2);
          }
        }

        @keyframes glowDrift {
          0%,
          100% {
            transform: translate(-12px, 0) scale(1);
          }

          50% {
            transform: translate(12px, -5px) scale(1.1);
          }
        }

        @keyframes livePulse {
          0%,
          100% {
            box-shadow: 0 0 0 3px rgba(57, 119, 232, 0.1);
          }

          50% {
            box-shadow: 0 0 0 5px rgba(57, 119, 232, 0.04);
          }
        }

        @keyframes sparkleTurn {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes avatarFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes closingWave {
          0%,
          100% {
            transform: scale(0.97);
            opacity: 0.7;
          }

          50% {
            transform: scale(1.03);
            opacity: 1;
          }
        }

        @media (max-width: 1100px) {
          .about-section {
            padding: 100px 24px;
          }

          .advice-card {
            min-height: 430px;
          }

          .orbit-three {
            width: 310px;
            height: 310px;
          }

          .orbit-two {
            width: 245px;
            height: 245px;
          }

          .orbit-one {
            width: 175px;
            height: 175px;
          }

          .about-closing {
            padding: 30px;
          }

          .closing-decoration {
            right: 14%;
          }
        }

        @media (max-width: 800px) {
          .about-section {
            padding: 82px 20px;
          }

          .about-intro {
            margin-bottom: 38px;
          }

          .about-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          .advice-card {
            grid-column: 1 / -1;
            grid-row: auto;
            min-height: 390px;
          }

          .built-card,
          .support-card {
            min-height: 280px;
            padding: 18px;
          }

          .about-closing {
            align-items: flex-start;
            flex-direction: column;
            gap: 26px;
            padding: 30px 26px;
          }

          .closing-decoration {
            right: -45px;
            opacity: 0.65;
          }
        }

        @media (max-width: 520px) {
          .about-section {
            padding: 68px 16px;
          }

          .about-intro h2 {
            font-size: clamp(2.35rem, 11vw, 3.5rem);
          }

          .about-intro p {
            margin-top: 18px;
            font-size: 14px;
            line-height: 1.8;
          }

          .about-grid {
            grid-template-columns: 1fr;
          }

          .about-card {
            padding: 20px;
            border-radius: 23px;
          }

          .advice-card {
            min-height: 380px;
          }

          .built-card,
          .support-card {
            min-height: 260px;
          }

          .orbit-three {
            width: 290px;
            height: 290px;
          }

          .orbit-two {
            width: 225px;
            height: 225px;
          }

          .orbit-one {
            width: 160px;
            height: 160px;
          }

          .about-closing {
            min-height: 0;
            padding: 28px 20px;
            border-radius: 23px;
          }

          .closing-copy h3 {
            font-size: 2rem;
          }

          .closing-copy p {
            font-size: 13px;
          }

          .closing-decoration {
            top: 28%;
            right: -105px;
          }

          .about-cta {
            width: 100%;
            min-height: 48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-item {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .orbit,
          .orbit-center,
          .chart-bar,
          .built-glow,
          .status-dot,
          .support-status-dot,
          .support-message,
          .closing-ring,
          .closing-star {
            animation: none !important;
          }

          .about-card,
          .built-window,
          .about-cta {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
