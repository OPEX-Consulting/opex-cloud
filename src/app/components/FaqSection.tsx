"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    question: "When will Opex Cloud launch?",
    answer:
      "Opex Cloud is currently in preparation. Join our early-access list to receive launch updates, product announcements, and information about availability as details are confirmed.",
  },
  {
    question: "Who is Opex Cloud for?",
    answer:
      "We’re building Opex Cloud with Nigerian businesses in mind, including growing companies, professional services firms, and technology teams looking for a simpler approach to cloud infrastructure.",
  },
  {
    question: "Can you help us move our existing systems to the cloud?",
    answer:
      "Migration support is part of what we’re planning. Every organisation has different systems, workloads, and requirements, so the right approach will depend on your current setup and the services available at launch.",
  },
  {
    question: "Will my data be hosted in Nigeria?",
    answer:
      "Data location is an important consideration. The hosting locations and available deployment options will be confirmed before launch. If your organisation has specific data residency or regulatory requirements, contact us to discuss them.",
  },
  {
    question: "Will I be able to pay in Naira?",
    answer:
      "Naira billing is part of the experience we’re working towards. We’ll publish confirmed pricing, billing options, and any applicable charges before the service becomes available.",
  },
  {
    question: "Will I receive support from a local team?",
    answer:
      "Local guidance and support are central to the direction of Opex Cloud. We’ll share details about support channels, availability, and service arrangements as they are finalised.",
  },
  {
    question: "Do I need technical expertise to get started?",
    answer:
      "Our goal is to make cloud infrastructure easier to understand and manage. You can tell us about your business needs during early access, and we’ll provide more information about the onboarding process as it becomes available.",
  },
  {
    question: "How can my business get early access?",
    answer:
      "Use the early-access form on this page to register your interest. We’ll use the details you provide to share relevant updates and information about the next steps.",
  },
];

function PlusIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className={`faq-icon ${open ? "is-open" : ""}`}>
      <span />
      <span />
    </span>
  );
}

export default function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isVisible, setIsVisible] = useState(false);

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
      { threshold: 0.12 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-labelledby="faq-heading"
      className={`faq-section ${isVisible ? "is-visible" : ""}`}
    >
      <div className="faq-container">
        <div className="faq-intro">
          <h2 id="faq-heading">
            A few things
            <br />
            <span>worth knowing.</span>
          </h2>

          <p className="faq-description">
            Getting started with cloud shouldn’t feel complicated. Here are some
            answers to help you understand what we’re building.
          </p>

          <div className="faq-contact-card">
            <div className="faq-contact-mark" aria-hidden="true">
              ?
            </div>

            <p className="faq-contact-title">
              Have a question we haven’t answered?
            </p>

            <p className="faq-contact-description">
              Tell us what your business needs, and we’ll help you find out more
              about Opex Cloud.
            </p>

            <a href="#contact" className="faq-contact-link">
              Talk to our team
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="faq-list" aria-label="Frequently asked questions">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;
            const triggerId = `faq-question-${index}`;

            return (
              <article
                key={faq.question}
                className={`faq-item ${isOpen ? "is-open" : ""}`}
                style={
                  {
                    "--item-delay": `${Math.min(index * 70, 490)}ms`,
                  } as React.CSSProperties
                }
              >
                <h3 className="faq-question-heading">
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="faq-question"
                  >
                    <span className="faq-question-text">{faq.question}</span>

                    <PlusIcon open={isOpen} />
                  </button>
                </h3>

                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="faq-answer-wrapper"
                  inert={!isOpen}
                  aria-hidden={!isOpen}
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="faq-answer-inner">
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .faq-section {
          position: relative;
          overflow: hidden;
          padding: 112px 24px;
          background: #f8fafc;
          color: #07152f;
        }

        .faq-container {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          align-items: start;
          gap: 88px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Zoom-in entrance */

        .faq-intro,
        .faq-item {
          opacity: 0;
          transform: translateY(24px) scale(0.97);
          transition: opacity 750ms cubic-bezier(0.2, 0.65, 0.3, 1),
            transform 750ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .faq-section.is-visible .faq-intro,
        .faq-section.is-visible .faq-item {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .faq-intro {
          position: sticky;
          top: 100px;
          transition-delay: 80ms;
        }

        .faq-section.is-visible .faq-item {
          transition-delay: var(--item-delay, 0ms);
        }

        /* Section label and eyebrow */

        .faq-label {
          display: inline-flex;
          align-items: center;
          min-height: 32px;
          padding: 7px 12px;
          border: 1px solid #e3e8ef;
          border-radius: 999px;
          background: #ffffff;
          color: #3977e8;
          font-size: 11px;
          font-weight: 650;
          letter-spacing: 0.025em;
        }

        .faq-eyebrow {
          display: block;
          margin-top: 28px;
          color: #3977e8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          line-height: 1.5;
        }

        .faq-intro h2 {
          margin: 14px 0 0;
          font-size: clamp(38px, 4.2vw, 58px);
          font-weight: 650;
          line-height: 1.08;
          letter-spacing: -0.06em;
        }

        .faq-intro h2 span {
          color: #8b95a5;
        }

        .faq-description {
          max-width: 420px;
          margin: 22px 0 0;
          color: #647084;
          font-size: 15px;
          line-height: 1.9;
        }

        /* Contact card */

        .faq-contact-card {
          margin-top: 34px;
          padding: 24px;
          border: 1px solid #e7ebf0;
          border-radius: 20px;
          background: #ffffff;
          transition: transform 300ms ease, border-color 300ms ease,
            box-shadow 300ms ease;
        }

        .faq-contact-card:hover {
          transform: scale(1.025);
          border-color: #d8e2f0;
          box-shadow: 0 12px 32px rgba(7, 21, 47, 0.045);
        }

        .faq-contact-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
          background: #f8fafc;
          color: #3977e8;
          font-size: 17px;
          font-weight: 600;
        }

        .faq-contact-title {
          margin: 19px 0 0;
          color: #07152f;
          font-size: 14px;
          font-weight: 650;
          line-height: 1.6;
        }

        .faq-contact-description {
          margin: 8px 0 0;
          color: #778195;
          font-size: 13px;
          line-height: 1.8;
        }

        .faq-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 20px;
          color: #3977e8;
          font-size: 13px;
          font-weight: 650;
          text-decoration: none;
          transition: gap 200ms ease, color 200ms ease;
        }

        .faq-contact-link:hover {
          gap: 13px;
          color: #245ac2;
        }

        /* Accordion */

        .faq-list {
          border-top: 1px solid #e0e5ec;
        }

        .faq-item {
          border-bottom: 1px solid #e0e5ec;
        }

        .faq-question-heading {
          margin: 0;
        }

        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          width: 100%;
          padding: 23px 0;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #07152f;
          text-align: left;
          cursor: pointer;
          outline: none;
        }

        .faq-question-text {
          display: inline-block;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.65;
          letter-spacing: -0.025em;
          transition: color 250ms ease, transform 250ms ease;
        }

        .faq-question:hover .faq-question-text,
        .faq-question:focus-visible .faq-question-text,
        .faq-item.is-open .faq-question-text {
          color: #3977e8;
          transform: scale(1.025);
          transform-origin: left center;
        }

        .faq-question:focus-visible {
          outline: 2px solid #3977e8;
          outline-offset: 4px;
        }

        .faq-icon {
          position: relative;
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid #e6eaf0;
          border-radius: 50%;
          background: #ffffff;
          transition: transform 350ms cubic-bezier(0.2, 0.75, 0.25, 1),
            background 250ms ease, border-color 250ms ease;
        }

        .faq-icon span {
          position: absolute;
          width: 12px;
          height: 1.5px;
          border-radius: 99px;
          background: #647084;
          transition: transform 300ms ease, background 250ms ease;
        }

        .faq-icon span:nth-child(2) {
          transform: rotate(90deg);
        }

        .faq-item.is-open .faq-icon {
          transform: rotate(180deg) scale(1.06);
          border-color: #d9e6fb;
          background: #edf4ff;
        }

        .faq-item.is-open .faq-icon span {
          background: #3977e8;
        }

        .faq-item.is-open .faq-icon span:nth-child(2) {
          transform: rotate(0deg);
        }

        .faq-answer-wrapper {
          display: grid;
          transition: grid-template-rows 420ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .faq-answer-inner {
          overflow: hidden;
        }

        .faq-answer {
          max-width: 620px;
          margin: 0;
          padding: 0 42px 0 0;
          color: #697588;
          font-size: 14px;
          line-height: 1.9;
          opacity: 0;
          transform: translateY(-8px);
          transition: opacity 300ms ease, transform 350ms ease,
            padding 350ms ease;
        }

        .faq-item.is-open .faq-answer {
          padding-bottom: 25px;
          opacity: 1;
          transform: translateY(0);
          transition-delay: 80ms;
        }

        @media (max-width: 1000px) {
          .faq-section {
            padding: 88px 24px;
          }

          .faq-container {
            grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
            gap: 44px;
          }

          .faq-intro h2 {
            font-size: clamp(36px, 4.5vw, 48px);
          }

          .faq-contact-card {
            padding: 20px;
          }
        }

        @media (max-width: 760px) {
          .faq-section {
            padding: 76px 20px;
          }

          .faq-container {
            grid-template-columns: 1fr;
            gap: 44px;
          }

          .faq-intro {
            position: static;
          }

          .faq-eyebrow {
            margin-top: 24px;
          }

          .faq-intro h2 {
            margin-top: 12px;
            font-size: clamp(40px, 9vw, 54px);
          }

          .faq-description {
            font-size: 14px;
            line-height: 1.85;
          }

          .faq-contact-card {
            margin-top: 26px;
          }

          .faq-question {
            gap: 14px;
            padding: 21px 0;
          }

          .faq-question-text {
            font-size: 14px;
          }

          .faq-icon {
            width: 31px;
            height: 31px;
          }

          .faq-answer {
            padding-right: 12px;
            font-size: 13px;
            line-height: 1.85;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-intro,
          .faq-item {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .faq-contact-card,
          .faq-question-text,
          .faq-icon,
          .faq-icon span,
          .faq-answer-wrapper,
          .faq-answer,
          .faq-contact-link {
            transition: none;
          }

          .faq-contact-card:hover,
          .faq-question:hover .faq-question-text,
          .faq-question:focus-visible .faq-question-text {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
