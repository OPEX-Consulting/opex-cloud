"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    question: "What is OPEX Cloud?",
    answer:
      "OPEX Cloud is the cloud services business of OPEX Consulting Limited, providing enterprise cloud infrastructure for organisations operating in Nigeria and the wider African market.",
  },
  {
    question: "What services does OPEX Cloud offer?",
    answer:
      "The current offering centres on Virtual Private Cloud (VPC) and Pay-As-You-Go (PAYG). Architecture, migration, security, and managed services are also part of the broader service direction, subject to the agreed scope.",
  },
  {
    question: "How does Pay-As-You-Go (PAYG) work?",
    answer:
      "PAYG is a usage-based approach to cloud services. Pricing, billable resources, and payment terms will be confirmed by the OPEX Cloud team based on the available offering.",
  },
  {
    question: "Can you help us migrate to the cloud?",
    answer:
      "OPEX can discuss your existing infrastructure, workload requirements, and migration needs to determine an appropriate approach and the support required.",
  },
  {
    question: "How do you handle security and data residency?",
    answer:
      "Security and data location are important considerations in cloud planning. Hosting locations, available security controls, backup arrangements, and relevant responsibilities should be confirmed for your specific requirements.",
  },
  {
    question: "How do we get started?",
    answer:
      "Speak with a Cloud Expert to discuss your organisation, infrastructure, workloads, and business requirements. The team can help identify suitable next steps and discuss assessment or quotation options.",
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

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setIsVisible(true);
      return;
    }

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
          <span className="faq-eyebrow">OPEX CLOUD · FAQ</span>

          <h2 id="faq-heading">
            Questions,
            <br />
            <span>answered.</span>
          </h2>

          <p className="faq-description">
            The essentials about our cloud offering, services, and how to get
            started.
          </p>

          <div className="faq-contact-card">
            <div className="faq-contact-mark" aria-hidden="true">
              ?
            </div>

            <p className="faq-contact-title">
              Need advice for your infrastructure?
            </p>

            <p className="faq-contact-description">
              Tell us what your organisation needs, and we can discuss the right
              next steps.
            </p>

            <a href="#contact" className="faq-contact-link">
              Talk to a Cloud Expert
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
                    "--item-delay": `${index * 65}ms`,
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
          padding: 100px 24px;
          background: #f8fafc;
          color: #07152f;
        }

        .faq-container {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          align-items: start;
          gap: 72px;
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
        }

        .faq-intro,
        .faq-item {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 650ms cubic-bezier(0.2, 0.65, 0.3, 1),
            transform 650ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .faq-section.is-visible .faq-intro,
        .faq-section.is-visible .faq-item {
          opacity: 1;
          transform: translateY(0);
        }

        .faq-intro {
          position: sticky;
          top: 100px;
          transition-delay: 60ms;
        }

        .faq-section.is-visible .faq-item {
          transition-delay: var(--item-delay, 0ms);
        }

        .faq-eyebrow {
          display: inline-block;
          color: #3977e8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          line-height: 1.8;
        }

        .faq-intro h2 {
          margin: 18px 0 0;
          font-size: clamp(38px, 4.2vw, 56px);
          font-weight: 650;
          line-height: 1.08;
          letter-spacing: -0.06em;
        }

        .faq-intro h2 span {
          color: #8b95a5;
        }

        .faq-description {
          max-width: 390px;
          margin: 20px 0 0;
          color: #647084;
          font-size: 14px;
          line-height: 1.85;
        }

        .faq-contact-card {
          margin-top: 30px;
          padding: 22px;
          border: 1px solid #e7ebf0;
          border-radius: 18px;
          background: #ffffff;
          transition: transform 250ms ease, border-color 250ms ease,
            box-shadow 250ms ease;
        }

        .faq-contact-card:hover {
          transform: translateY(-3px);
          border-color: #d8e2f0;
          box-shadow: 0 10px 28px rgba(7, 21, 47, 0.045);
        }

        .faq-contact-mark {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid #e5eaf1;
          border-radius: 11px;
          background: #f8fafc;
          color: #3977e8;
          font-size: 16px;
          font-weight: 600;
        }

        .faq-contact-title {
          margin: 16px 0 0;
          color: #07152f;
          font-size: 13px;
          font-weight: 650;
          line-height: 1.6;
        }

        .faq-contact-description {
          margin: 7px 0 0;
          color: #778195;
          font-size: 12px;
          line-height: 1.8;
        }

        .faq-contact-link {
          display: inline-flex;
          align-items: center;
          margin-top: 16px;
          color: #3977e8;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
          transition: color 200ms ease;
        }

        .faq-contact-link:hover {
          color: #245ac2;
        }

        .faq-contact-link:focus-visible {
          outline: 2px solid #3977e8;
          outline-offset: 5px;
          border-radius: 3px;
        }

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
          gap: 20px;
          width: 100%;
          padding: 21px 0;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #07152f;
          text-align: left;
          cursor: pointer;
        }

        .faq-question-text {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.65;
          letter-spacing: -0.02em;
          transition: color 200ms ease;
        }

        .faq-question:hover .faq-question-text,
        .faq-question:focus-visible .faq-question-text,
        .faq-item.is-open .faq-question-text {
          color: #3977e8;
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
          width: 32px;
          height: 32px;
          border: 1px solid #e6eaf0;
          border-radius: 50%;
          background: #ffffff;
          transition: transform 300ms ease, background 200ms ease,
            border-color 200ms ease;
        }

        .faq-icon span {
          position: absolute;
          width: 11px;
          height: 1.5px;
          border-radius: 99px;
          background: #647084;
          transition: transform 250ms ease, background 200ms ease;
        }

        .faq-icon span:nth-child(2) {
          transform: rotate(90deg);
        }

        .faq-item.is-open .faq-icon {
          transform: rotate(180deg);
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
          transition: grid-template-rows 350ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .faq-answer-inner {
          overflow: hidden;
        }

        .faq-answer {
          max-width: 600px;
          margin: 0;
          padding: 0 42px 0 0;
          color: #697588;
          font-size: 13px;
          line-height: 1.85;
          opacity: 0;
          transform: translateY(-5px);
          transition: opacity 250ms ease, transform 300ms ease,
            padding 300ms ease;
        }

        .faq-item.is-open .faq-answer {
          padding-bottom: 22px;
          opacity: 1;
          transform: translateY(0);
          transition-delay: 40ms;
        }

        @media (max-width: 1000px) {
          .faq-section {
            padding: 80px 24px;
          }

          .faq-container {
            grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
            gap: 40px;
          }

          .faq-intro h2 {
            font-size: clamp(36px, 4.5vw, 48px);
          }

          .faq-contact-card {
            padding: 18px;
          }
        }

        @media (max-width: 760px) {
          .faq-section {
            padding: 68px 20px;
          }

          .faq-container {
            grid-template-columns: 1fr;
            gap: 34px;
          }

          .faq-intro {
            position: static;
          }

          .faq-intro h2 {
            margin-top: 14px;
            font-size: clamp(38px, 9vw, 50px);
          }

          .faq-description {
            font-size: 13px;
          }

          .faq-contact-card {
            margin-top: 22px;
          }

          .faq-question {
            gap: 14px;
            padding: 18px 0;
          }

          .faq-question-text {
            font-size: 13px;
          }

          .faq-icon {
            width: 30px;
            height: 30px;
          }

          .faq-answer {
            padding-right: 8px;
            font-size: 12px;
            line-height: 1.8;
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

          .faq-contact-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
