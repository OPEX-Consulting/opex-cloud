"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

type CtaSectionProps = {
  onJoinWaitlist: () => void;
};

const pills = [
  "Cloud infrastructure",
  "Built to scale",
  "Secure by design",
  "Ready for growth",
  "Simpler operations",
];

type PillPosition = {
  x: number;
  y: number;
  rotation: number;
};

const initialPositions: PillPosition[] = [
  { x: 5, y: 12, rotation: -9 },
  { x: 72, y: 8, rotation: 7 },
  { x: 10, y: 72, rotation: 5 },
  { x: 78, y: 72, rotation: -6 },
  { x: 49, y: 4, rotation: 3 },
];

export default function CtaSection({ onJoinWaitlist }: CtaSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const dragRef = useRef<{
    index: number;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [positions, setPositions] = useState<PillPosition[]>(initialPositions);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(section);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLSpanElement>,
    index: number
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const stage = stageRef.current;

    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    const pillRect = event.currentTarget.getBoundingClientRect();

    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pillRect.left - stageRect.left,
      originY: pillRect.top - stageRect.top,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingIndex(index);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;
    const stage = stageRef.current;

    if (!drag || !stage || drag.pointerId !== event.pointerId) {
      return;
    }

    const pill = pillRefs.current[drag.index];

    if (!pill) return;

    const stageRect = stage.getBoundingClientRect();
    const maxX = Math.max(0, stageRect.width - pill.offsetWidth);
    const maxY = Math.max(0, stageRect.height - pill.offsetHeight);

    const left = Math.max(
      0,
      Math.min(maxX, drag.originX + event.clientX - drag.startX)
    );

    const top = Math.max(
      0,
      Math.min(maxY, drag.originY + event.clientY - drag.startY)
    );

    setPositions((current) =>
      current.map((position, index) =>
        index === drag.index
          ? {
              ...position,
              x: maxX ? (left / maxX) * 100 : 0,
              y: maxY ? (top / maxY) * 100 : 0,
            }
          : position
      )
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    setDraggingIndex(null);
  };

  return (
    <section
      ref={sectionRef}
      className={`cta-section ${isVisible ? "is-visible" : ""}`}
      aria-labelledby="cta-heading"
    >
      <div className="cta-container">
        <div className="cta-stage" ref={stageRef}>
          <div className="cta-pill-layer" aria-label="Platform benefits">
            {pills.map((pill, index) => (
              <span
                key={pill}
                ref={(element) => {
                  pillRefs.current[index] = element;
                }}
                className={`cta-pill ${
                  draggingIndex === index ? "is-dragging" : ""
                }`}
                style={
                  {
                    "--pill-index": index,
                    "--pill-x": `${positions[index].x}%`,
                    "--pill-y": `${positions[index].y}%`,
                    "--pill-rotation": `${positions[index].rotation}deg`,
                  } as CSSProperties
                }
                onPointerDown={(event) => handlePointerDown(event, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="cta-content">
            <h2 id="cta-heading">
              Ready to build
              <br />
              <span>without limits?</span>
            </h2>

            <p>
              Give your business the cloud foundation it needs to move faster,
              scale confidently, and take on what&apos;s next.
            </p>

            <div className="cta-actions">
              <button
                type="button"
                className="cta-button cta-button-primary"
                onClick={onJoinWaitlist}
              >
                Join early access
              </button>

              <a className="cta-button cta-button-secondary" href="#features">
                Explore the platform
              </a>
            </div>

            <span className="cta-note">Built for ambitious businesses.</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cta-section {
          position: relative;
          overflow: hidden;
          padding: 100px 24px 104px;
          background: var(--brand-navy, #101b2d);
          color: #ffffff;
        }

        .cta-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        /* The pills float around the CTA content. */

        .cta-stage {
          position: relative;
          isolation: isolate;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cta-pill-layer {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .cta-pill {
          position: absolute;
          top: var(--pill-y);
          left: var(--pill-x);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 11px 17px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 999px;
          background: #17243a;
          color: rgba(255, 255, 255, 0.92);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.01em;
          white-space: nowrap;
          cursor: grab;
          pointer-events: auto;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
          opacity: 0;
          transform: translateY(-180px) rotate(var(--pill-rotation));
          transform-origin: center;
          will-change: transform, opacity, top, left;
          transition: top 400ms cubic-bezier(0.2, 0.75, 0.25, 1),
            left 400ms cubic-bezier(0.2, 0.75, 0.25, 1), border-color 200ms ease,
            background 200ms ease;
        }

        .cta-section.is-visible .cta-pill {
          animation: pill-fall 1.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: calc(var(--pill-index) * 140ms);
        }

        .cta-pill:hover {
          border-color: rgba(255, 255, 255, 0.65);
          background: #24344d;
          z-index: 5;
        }

        .cta-pill.is-dragging {
          z-index: 10;
          cursor: grabbing;
          animation: none;
          opacity: 1;
          transition: none;
          border-color: #ffffff;
          background: #293b55;
        }

        @keyframes pill-fall {
          0% {
            opacity: 0;
            transform: translateY(-180px)
              rotate(calc(var(--pill-rotation) - 12deg));
          }

          48% {
            opacity: 1;
            transform: translateY(13px)
              rotate(calc(var(--pill-rotation) + 5deg));
          }

          65% {
            transform: translateY(-15px)
              rotate(calc(var(--pill-rotation) - 3deg));
          }

          80% {
            transform: translateY(7px) rotate(calc(var(--pill-rotation) + 2deg));
          }

          92% {
            transform: translateY(-3px) rotate(var(--pill-rotation));
          }

          100% {
            opacity: 1;
            transform: translateY(0) rotate(var(--pill-rotation));
          }
        }

        /* CTA content sits below the draggable pills. */

        .cta-content {
          position: relative;
          z-index: 1;
          width: min(100%, 760px);
          margin: 0 auto;
          padding: 46px 0;
          text-align: center;
        }

        .cta-eyebrow {
          display: inline-block;
          margin-bottom: 22px;
          color: rgba(255, 255, 255, 0.63);
          font-size: 10px;
          font-weight: 650;
          letter-spacing: 0.18em;
        }

        .cta-content h2 {
          margin: 0;
          font-size: clamp(42px, 6.5vw, 76px);
          font-weight: 650;
          line-height: 1.04;
          letter-spacing: -0.065em;
        }

        .cta-content h2 span {
          color: rgba(255, 255, 255, 0.64);
        }

        .cta-content > p {
          max-width: 520px;
          margin: 24px auto 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          line-height: 1.85;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 32px;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          min-height: 48px;
          padding: 0 21px;
          border: 1px solid transparent;
          border-radius: 999px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: transform 220ms ease, background 220ms ease,
            border-color 220ms ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        .cta-button:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 4px;
        }

        .cta-button-primary {
          background: #ffffff;
          color: #111827;
        }

        .cta-button-primary:hover {
          background: #ededed;
        }

        .cta-button-primary span {
          font-size: 16px;
        }

        .cta-button-secondary {
          border-color: rgba(255, 255, 255, 0.23);
          background: transparent;
          color: #ffffff;
        }

        .cta-button-secondary:hover {
          border-color: rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.06);
        }

        .cta-note {
          display: inline-block;
          margin-top: 28px;
          color: rgba(255, 255, 255, 0.48);
          font-size: 11px;
        }

        @media (max-width: 760px) {
          .cta-section {
            padding: 68px 18px 72px;
          }

          .cta-stage {
            min-height: 500px;
          }

          .cta-content {
            padding: 70px 0;
          }

          .cta-pill {
            min-height: 36px;
            padding: 9px 11px;
            font-size: 10px;
          }

          .cta-content h2 {
            font-size: clamp(40px, 9vw, 58px);
          }

          .cta-content > p {
            max-width: 420px;
            font-size: 14px;
          }

          .cta-eyebrow {
            font-size: 9px;
          }

          .cta-actions {
            gap: 10px;
          }
        }

        @media (max-width: 420px) {
          .cta-stage {
            min-height: 520px;
          }

          .cta-pill {
            padding: 8px 9px;
            font-size: 9px;
          }

          .cta-content h2 {
            font-size: clamp(38px, 10vw, 48px);
          }

          .cta-content > p {
            font-size: 13px;
          }

          .cta-actions {
            flex-direction: column;
            align-items: stretch;
            max-width: 280px;
            margin-right: auto;
            margin-left: auto;
          }

          .cta-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-section.is-visible .cta-pill {
            animation: none;
            opacity: 1;
            transform: rotate(var(--pill-rotation));
          }

          .cta-pill,
          .cta-button {
            transition: none;
          }

          .cta-button:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
