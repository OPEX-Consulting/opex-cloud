"use client";

import { useEffect, useRef, useState } from "react";

const audiences = [
  {
    id: "business",
    title: "Growing businesses",
    description: "Cloud infrastructure that grows with your business.",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "enterprise",
    title: "Enterprise teams",
    description: "Reliable infrastructure for business-critical operations.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "startups",
    title: "African founders",
    description: "Room to build, launch and scale your next big idea.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "technology",
    title: "IT & technology teams",
    description: "Simplify infrastructure and focus on what matters.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "collaboration",
    title: "Collaborative teams",
    description: "Give people the tools and space to do their best work.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "modern-work",
    title: "Modern African businesses",
    description: "A flexible cloud foundation for ambitious teams.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function WhoIsItForSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeCard, setActiveCard] = useState(-1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Highlight whichever card is closest to the viewport centre.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !isVisible) return;

    let animationFrame = 0;
    let previousActiveCard = -1;

    const updateActiveCard = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const center = viewportRect.left + viewportRect.width / 2;

      let closestIndex = -1;
      let closestDistance = Infinity;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        const rect = card.getBoundingClientRect();

        if (
          rect.right <= viewportRect.left ||
          rect.left >= viewportRect.right
        ) {
          return;
        }

        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(center - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== previousActiveCard) {
        previousActiveCard = closestIndex;
        setActiveCard(closestIndex);
      }

      animationFrame = requestAnimationFrame(updateActiveCard);
    };

    animationFrame = requestAnimationFrame(updateActiveCard);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="who-its-for"
      className={`who-section ${isVisible ? "is-visible" : ""}`}
    >
      <div className="who-container">
        <header className="who-header">
          <div className="who-heading">
            <span className="who-eyebrow">WHO IT&apos;S FOR</span>

            <h2>
              Built for your ambition.
              <br />
              <span>Ready for what&apos;s next.</span>
            </h2>
          </div>

          <p className="who-intro">
            From ambitious founders to established businesses, get cloud
            infrastructure designed to move with you.
          </p>
        </header>
      </div>

      <div
        ref={viewportRef}
        className="marquee-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget;

          if (
            !(nextTarget instanceof Node) ||
            !event.currentTarget.contains(nextTarget)
          ) {
            setIsPaused(false);
          }
        }}
      >
        <div
          className={`marquee-track ${isVisible ? "marquee-running" : ""} ${
            isPaused ? "marquee-paused" : ""
          }`}
        >
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
              {audiences.map((audience, index) => {
                const cardIndex = copy * audiences.length + index;
                const isActive = activeCard === cardIndex;

                return (
                  <article
                    ref={(element) => {
                      cardRefs.current[cardIndex] = element;
                    }}
                    className={`marquee-card ${isActive ? "is-active" : ""}`}
                    key={`${copy}-${audience.id}`}
                    tabIndex={copy === 0 ? 0 : -1}
                  >
                    <div
                      className="marquee-image"
                      style={{
                        backgroundImage: `url("${audience.image}")`,
                      }}
                      role="img"
                      aria-label={
                        copy === 0
                          ? `${audience.title} — illustrative business photography`
                          : undefined
                      }
                    />

                    <div className="marquee-overlay" />

                    <div className="marquee-card-content">
                      <div className="marquee-card-bottom">
                        <h3>{audience.title}</h3>
                        <p>{audience.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="who-container">
        <div className="who-footer">
          <span className="footer-line" />
          <p>Infrastructure for every stage of ambition.</p>
          <span className="footer-line" />
        </div>
      </div>

      <style jsx>{`
        .who-section {
          overflow: hidden;
          padding: 108px 0 90px;
          background: var(--surface, #ffffff);
          color: var(--text-primary, #171717);
        }

        .who-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .who-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 48px;
          margin-bottom: 32px;
        }

        .who-heading {
          max-width: 780px;
        }

        .who-eyebrow {
          display: inline-block;
          margin-bottom: 20px;
          color: var(--text-secondary, #777777);
          font-size: 11px;
          font-weight: 650;
          letter-spacing: 0.14em;
        }

        .who-heading h2 {
          margin: 0;
          font-size: clamp(40px, 5.2vw, 68px);
          font-weight: 650;
          line-height: 1.06;
          letter-spacing: -0.065em;
        }

        .who-heading h2 span {
          color: var(--text-secondary, #818181);
        }

        .who-intro {
          max-width: 350px;
          margin: 0 0 5px;
          color: var(--text-secondary, #686868);
          font-size: 15px;
          line-height: 1.8;
        }

        /*
         * The extra vertical space makes room for the skewed ribbon.
         * Cards are transformed individually so the scrolling track
         * itself remains level and the loop stays seamless.
         */
        .marquee-viewport {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 76px 0 72px;
          isolation: isolate;
          perspective: 1200px;
        }

        .marquee-viewport::before,
        .marquee-viewport::after {
          position: absolute;
          z-index: 4;
          top: 0;
          bottom: 0;
          width: clamp(24px, 6vw, 100px);
          content: "";
          pointer-events: none;
        }

        .marquee-viewport::before {
          left: 0;
          background: linear-gradient(
            90deg,
            var(--surface, #ffffff) 0%,
            transparent 100%
          );
        }

        .marquee-viewport::after {
          right: 0;
          background: linear-gradient(
            270deg,
            var(--surface, #ffffff) 0%,
            transparent 100%
          );
        }

        .marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          will-change: transform;
        }

        .marquee-running {
          animation: marquee-scroll 54s linear infinite;
        }

        .marquee-paused {
          animation-play-state: paused;
        }

        .marquee-group {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 20px;
          padding-right: 20px;
        }

        /*
         * Ribbon effect:
         * the cards lean in alternating directions and sit at different
         * heights, creating one continuous diagonal, arc-like silhouette.
         */
        .marquee-card {
          position: relative;
          flex: 0 0 320px;
          height: 360px;
          overflow: hidden;
          isolation: isolate;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          background: #dededc;
          color: #ffffff;
          opacity: 0.82;
          transform: translateY(30px) rotate(-7deg) skewY(-2deg) scale(0.94);
          transform-origin: center center;
          transition: transform 700ms cubic-bezier(0.2, 0.7, 0.3, 1),
            opacity 700ms ease, box-shadow 700ms ease;
          outline-offset: 5px;
        }

        .marquee-card:nth-child(2) {
          transform: translateY(8px) rotate(-4deg) skewY(-1deg) scale(0.96);
        }

        .marquee-card:nth-child(3) {
          transform: translateY(-20px) rotate(-2deg) skewY(0deg) scale(0.98);
        }

        .marquee-card:nth-child(4) {
          transform: translateY(-20px) rotate(2deg) skewY(0deg) scale(0.98);
        }

        .marquee-card:nth-child(5) {
          transform: translateY(8px) rotate(4deg) skewY(1deg) scale(0.96);
        }

        .marquee-card:nth-child(6) {
          transform: translateY(30px) rotate(7deg) skewY(2deg) scale(0.94);
        }

        .marquee-card.is-active {
          z-index: 2;
          opacity: 1;
          transform: translateY(-30px) rotate(0deg) skewY(0deg) scale(1.02);
          box-shadow: 0 24px 65px rgba(0, 0, 0, 0.16);
        }

        .marquee-image {
          position: absolute;
          z-index: -2;
          inset: 0;
          background-position: center;
          background-size: cover;
          filter: grayscale(100%);
          transform: scale(1.03);
          transition: filter 900ms ease, transform 900ms ease;
        }

        .marquee-card.is-active .marquee-image {
          filter: grayscale(0%);
          transform: scale(1.08);
        }

        .marquee-overlay {
          position: absolute;
          z-index: -1;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.02) 0%,
            rgba(0, 0, 0, 0.06) 35%,
            rgba(0, 0, 0, 0.78) 100%
          );
        }

        .marquee-card-content {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          width: 100%;
          height: 100%;
          padding: 25px;
        }

        .marquee-card-bottom h3 {
          margin: 0 0 9px;
          color: #ffffff;
          font-size: 25px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.045em;
        }

        .marquee-card-bottom p {
          max-width: 275px;
          margin: 0;
          color: rgba(255, 255, 255, 0.86);
          font-size: 12px;
          line-height: 1.75;
        }

        .who-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          margin-top: 18px;
        }

        .footer-line {
          width: 30px;
          height: 1px;
          background: var(--text-secondary, #858585);
        }

        .who-footer p {
          margin: 0;
          color: var(--text-secondary, #777777);
          font-size: 12px;
          text-align: center;
        }

        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 760px) {
          .who-section {
            padding: 76px 0 64px;
          }

          .who-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 20px;
          }

          .who-intro {
            max-width: 520px;
          }

          .marquee-viewport {
            padding: 48px 0 48px;
          }

          .marquee-group {
            gap: 14px;
            padding-right: 14px;
          }

          .marquee-card {
            flex-basis: 285px;
            height: 320px;
            border-radius: 21px;
            transform: translateY(22px) rotate(-5deg) skewY(-1deg) scale(0.95);
          }

          .marquee-card:nth-child(2) {
            transform: translateY(8px) rotate(-3deg) skewY(-1deg) scale(0.96);
          }

          .marquee-card:nth-child(3) {
            transform: translateY(-12px) rotate(-1deg) skewY(0deg) scale(0.98);
          }

          .marquee-card:nth-child(4) {
            transform: translateY(-12px) rotate(1deg) skewY(0deg) scale(0.98);
          }

          .marquee-card:nth-child(5) {
            transform: translateY(8px) rotate(3deg) skewY(1deg) scale(0.96);
          }

          .marquee-card:nth-child(6) {
            transform: translateY(22px) rotate(5deg) skewY(1deg) scale(0.95);
          }

          .marquee-card.is-active {
            transform: translateY(-18px) rotate(0deg) skewY(0deg) scale(1.01);
          }

          .marquee-card-content {
            padding: 20px;
          }

          .marquee-card-bottom h3 {
            font-size: 23px;
          }

          .marquee-running {
            animation-duration: 42s;
          }
        }

        @media (max-width: 480px) {
          .who-section {
            padding: 64px 0 54px;
          }

          .who-container {
            padding: 0 20px;
          }

          .who-heading h2 {
            font-size: 43px;
          }

          .who-eyebrow {
            margin-bottom: 16px;
          }

          .who-intro {
            font-size: 14px;
          }

          .marquee-viewport {
            padding: 38px 0 36px;
          }

          .marquee-card {
            flex-basis: 260px;
            height: 300px;
          }

          .marquee-card-content {
            padding: 18px;
          }

          .marquee-card-bottom h3 {
            font-size: 22px;
          }

          .marquee-running {
            animation-duration: 36s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-running {
            animation: none;
          }

          .marquee-image,
          .marquee-card {
            transition: none;
          }

          .marquee-image {
            filter: grayscale(0%);
          }

          .marquee-track {
            transform: none;
          }

          .marquee-card,
          .marquee-card:nth-child(n),
          .marquee-card.is-active {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
