"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";

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
  { x: 4, y: 12, rotation: -8 },
  { x: 74, y: 10, rotation: 6 },
  { x: 8, y: 76, rotation: 5 },
  { x: 78, y: 76, rotation: -5 },
  { x: 46, y: 3, rotation: 3 },
];

export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const routerInterface = useRouter();

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

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateVisibility = () => {
      setIsVisible(true);
    };

    if (motionQuery.matches || !("IntersectionObserver" in window)) {
      updateVisibility();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          updateVisibility();
          observer.unobserve(section);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLSpanElement>,
    index: number
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

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

    if (!drag || !stage || drag.pointerId !== event.pointerId) return;

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
              <span>without the complexity?</span>
            </h2>

            <p>
              Give your business a simpler path to cloud infrastructure. Get
              practical guidance, local support, and a foundation designed to
              grow with you.
            </p>

            <div className="cta-actions">
              <button
                type="button"
                className="cta-button cta-button-primary"
                onClick={() => routerInterface.push("/onboarding")}
              >
                Talk to a Cloud Expert
              </button>

              <a className="cta-button cta-button-secondary" href="#platform">
                Explore the platform
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cta-section {
          position: relative;
          overflow: hidden;
          padding: 76px 24px 82px;
          background: var(--brand-navy, #07152f);
          color: #ffffff;
          isolation: isolate;
        }

        .cta-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .cta-stage {
          position: relative;
          display: flex;
          min-height: 440px;
          align-items: center;
          justify-content: center;
          isolation: isolate;
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
          min-height: 40px;
          align-items: center;
          justify-content: center;
          padding: 10px 15px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          background: #122545;
          color: rgba(255, 255, 255, 0.88);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: -0.01em;
          white-space: nowrap;
          cursor: grab;
          pointer-events: auto;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
          opacity: 0;
          transform: translateY(-150px) rotate(var(--pill-rotation));
          transform-origin: center;
          will-change: transform, opacity;
          transition: border-color 200ms ease, background 200ms ease,
            box-shadow 200ms ease;
        }

        .cta-section.is-visible .cta-pill {
          animation: pill-fall 1.15s cubic-bezier(0.34, 1.45, 0.64, 1) forwards;
          animation-delay: calc(var(--pill-index) * 120ms);
        }

        .cta-pill:hover {
          z-index: 5;
          border-color: rgba(139, 184, 255, 0.7);
          background: #19345a;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
        }

        .cta-pill.is-dragging {
          z-index: 10;
          cursor: grabbing;
          animation: none;
          opacity: 1;
          border-color: #8bb8ff;
          background: #19345a;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
          transition: none;
        }

        @keyframes pill-fall {
          0% {
            opacity: 0;
            transform: translateY(-150px)
              rotate(calc(var(--pill-rotation) - 10deg));
          }

          48% {
            opacity: 1;
            transform: translateY(10px)
              rotate(calc(var(--pill-rotation) + 4deg));
          }

          66% {
            transform: translateY(-10px)
              rotate(calc(var(--pill-rotation) - 2deg));
          }

          82% {
            transform: translateY(5px) rotate(var(--pill-rotation));
          }

          100% {
            opacity: 1;
            transform: translateY(0) rotate(var(--pill-rotation));
          }
        }

        .cta-content {
          position: relative;
          z-index: 1;
          width: min(100%, 740px);
          margin: 0 auto;
          padding: 42px 0;
          text-align: center;
        }

        .cta-eyebrow {
          display: inline-block;
          margin-bottom: 20px;
          color: #9bbcf2;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .cta-content h2 {
          margin: 0;
          font-size: clamp(40px, 5.8vw, 68px);
          font-weight: 650;
          line-height: 1.06;
          letter-spacing: -0.06em;
          text-wrap: balance;
        }

        .cta-content h2 span {
          color: #9bbcf2;
        }

        .cta-content > p {
          max-width: 510px;
          margin: 21px auto 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.85;
          text-wrap: pretty;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 28px;
        }

        .cta-button {
          display: inline-flex;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          padding: 0 22px;
          border: 1px solid transparent;
          border-radius: 999px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: transform 200ms ease, background 200ms ease,
            border-color 200ms ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        .cta-button:focus-visible {
          outline: 2px solid #8bb8ff;
          outline-offset: 4px;
        }

        .cta-button-primary {
          background: #ffffff;
          color: #07152f;
          box-shadow: 0 5px 18px rgba(0, 0, 0, 0.12);
        }

        .cta-button-primary:hover {
          background: #eaf1ff;
        }

        .cta-button-secondary {
          border-color: rgba(255, 255, 255, 0.22);
          background: transparent;
          color: #ffffff;
        }

        .cta-button-secondary:hover {
          border-color: rgba(255, 255, 255, 0.42);
          background: rgba(255, 255, 255, 0.08);
        }

        .cta-note {
          display: inline-block;
          margin-top: 24px;
          color: rgba(255, 255, 255, 0.48);
          font-size: 10px;
          letter-spacing: 0.015em;
        }

        @media (max-width: 760px) {
          .cta-section {
            padding: 60px 18px 64px;
          }

          .cta-stage {
            min-height: 465px;
          }

          .cta-content {
            padding: 68px 0;
          }

          .cta-pill {
            min-height: 35px;
            padding: 8px 10px;
            font-size: 9px;
          }

          .cta-content h2 {
            font-size: clamp(36px, 8vw, 54px);
          }

          .cta-content > p {
            max-width: 410px;
            font-size: 13px;
            line-height: 1.8;
          }

          .cta-eyebrow {
            font-size: 9px;
          }

          .cta-actions {
            gap: 9px;
            margin-top: 24px;
          }
        }

        @media (max-width: 420px) {
          .cta-stage {
            min-height: 480px;
          }

          .cta-pill {
            padding: 8px;
            font-size: 8px;
          }

          .cta-content h2 {
            font-size: clamp(34px, 9.5vw, 44px);
          }

          .cta-content > p {
            font-size: 12px;
          }

          .cta-actions {
            width: min(100%, 280px);
            flex-direction: column;
            align-items: stretch;
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
