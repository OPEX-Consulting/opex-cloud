"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    category: "OVERVIEW",
    question: "What is OPEX Cloud?",
    answer:
      "OPEX Cloud is the enterprise cloud infrastructure business of OPEX Consulting Limited, serving organisations in Nigeria and the wider African market.",
  },
  {
    category: "CLOUD SERVICES",
    question: "What cloud services do you offer?",
    answer:
      "The current offering centres on Virtual Private Cloud (VPC) and Pay-As-You-Go (PAYG). Migration, architecture, security, and managed services can also be discussed according to your organisation’s requirements and the agreed scope.",
  },
  {
    category: "PRICING",
    question: "How does Pay-As-You-Go billing work?",
    answer:
      "PAYG is a usage-based approach to cloud infrastructure. Applicable resources, rates, billing methods, and payment terms will be confirmed by the OPEX Cloud team based on the available offering and your requirements.",
  },
  {
    category: "SECURITY & DATA",
    question: "How do you handle security and data residency?",
    answer:
      "Security controls, hosting locations, backup arrangements, and compliance requirements depend on your deployment and business needs. Discuss your requirements with our team so the applicable options can be confirmed before deployment.",
  },
  {
    category: "GETTING STARTED",
    question: "How do we get started?",
    answer:
      "Speak with a Cloud Expert about your organisation, workloads, infrastructure, and business requirements. The team can help identify suitable next steps and discuss assessment or quotation options.",
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
      { threshold: 0.08 }
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
        <header className="faq-intro">
          <span className="faq-eyebrow">OPEX CLOUD / FAQ</span>

          <h2 id="faq-heading">
            Questions.
            <span>Clear answers.</span>
          </h2>

          <p className="faq-description">
            The essentials about our cloud services, infrastructure, and how
            your organisation can get started.
          </p>

          <div className="faq-contact-card">
            <span className="faq-contact-label">NEED MORE INFORMATION?</span>

            <h3>Let’s discuss your cloud requirements.</h3>

            <p>
              Tell us about your organisation and what you need from your
              infrastructure.
            </p>

            <a href="#contact" className="faq-contact-link">
              Talk to a Cloud Expert
            </a>
          </div>
        </header>

        <div className="faq-content">
          <div className="faq-list-heading">
            <span>FREQUENTLY ASKED QUESTIONS</span>
            <span>05 TOPICS</span>
          </div>

          <div className="faq-list">
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
                      "--item-delay": `${index * 60}ms`,
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
                      <span className="faq-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="faq-question-content">
                        <span className="faq-category">{faq.category}</span>

                        <span className="faq-question-text">
                          {faq.question}
                        </span>
                      </span>

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

          <p className="faq-bottom-note">
            Service availability, pricing, hosting arrangements, and technical
            commitments are confirmed for your specific requirements.
          </p>
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
        .faq-content {
          min-width: 0;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 650ms cubic-bezier(0.2, 0.65, 0.3, 1),
            transform 650ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .faq-section.is-visible .faq-intro,
        .faq-section.is-visible .faq-content {
          opacity: 1;
          transform: translateY(0);
        }

        .faq-content {
          transition-delay: 100ms;
        }

        .faq-intro {
          position: sticky;
          top: 100px;
        }

        .faq-eyebrow {
          display: inline-block;
          color: #3977e8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          line-height: 1.8;
        }

        .faq-intro h2 {
          margin: 20px 0 0;
          font-size: clamp(40px, 4.2vw, 56px);
          font-weight: 650;
          line-height: 1.08;
          letter-spacing: -0.065em;
        }

        .faq-intro h2 span {
          display: block;
          margin-top: 5px;
          color: #8994a5;
        }

        .faq-description {
          max-width: 370px;
          margin: 21px 0 0;
          color: #647084;
          font-size: 14px;
          line-height: 1.9;
        }

        .faq-contact-card {
          margin-top: 32px;
          padding: 24px;
          border: 1px solid #e6ebf2;
          border-radius: 21px;
          background: #fff;
          box-shadow: 0 4px 16px rgba(7, 21, 47, 0.025);
          transition: transform 300ms cubic-bezier(0.2, 0.7, 0.2, 1),
            border-color 300ms ease, box-shadow 300ms ease;
        }

        .faq-contact-card:hover {
          transform: translateY(-4px);
          border-color: #d4e0f0;
          box-shadow: 0 15px 35px rgba(7, 21, 47, 0.06);
        }

        .faq-contact-label {
          color: #3977e8;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .faq-contact-card h3 {
          margin: 18px 0 0;
          font-size: 19px;
          font-weight: 650;
          line-height: 1.45;
          letter-spacing: -0.04em;
        }

        .faq-contact-card p {
          margin: 9px 0 0;
          color: #778195;
          font-size: 12px;
          line-height: 1.85;
        }

        .faq-contact-link {
          display: inline-flex;
          align-items: center;
          margin-top: 19px;
          color: #2862cb;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
          transition: color 200ms ease;
        }

        .faq-contact-link:hover {
          color: #174da9;
        }

        .faq-contact-link:focus-visible {
          outline: 2px solid #3977e8;
          outline-offset: 5px;
          border-radius: 3px;
        }

        .faq-list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 13px;
          padding: 0 4px;
          color: #8994a5;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .faq-list {
          display: grid;
          gap: 10px;
        }

        .faq-item {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e7ecf3;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 2px 7px rgba(7, 21, 47, 0.018);
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 550ms ease,
            transform 550ms cubic-bezier(0.2, 0.65, 0.3, 1),
            border-color 250ms ease, box-shadow 300ms ease;
        }

        .faq-section.is-visible .faq-item {
          opacity: 1;
          transform: translateY(0);
          transition-delay: var(--item-delay, 0ms);
        }

        .faq-item:hover {
          border-color: #d8e1ee;
          box-shadow: 0 7px 20px rgba(7, 21, 47, 0.035);
        }

        .faq-item.is-open {
          border-color: #d5e2f5;
          box-shadow: 0 10px 28px rgba(7, 21, 47, 0.045),
            0 2px 6px rgba(7, 21, 47, 0.02);
        }

        .faq-question-heading {
          margin: 0;
        }

        .faq-question {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
          min-height: 76px;
          padding: 15px 18px;
          border: 0;
          border-radius: inherit;
          background: transparent;
          color: #07152f;
          text-align: left;
          cursor: pointer;
        }

        .faq-number {
          display: flex;
          flex: 0 0 30px;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: 1px solid #e8edf4;
          border-radius: 9px;
          background: #f8fafc;
          color: #8994a5;
          font-size: 9px;
          font-weight: 700;
          transition: background 250ms ease, color 250ms ease,
            border-color 250ms ease;
        }

        .faq-question-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .faq-category {
          color: #8a95a5;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
          line-height: 1.5;
        }

        .faq-question-text {
          color: #17243a;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.6;
          letter-spacing: -0.018em;
          transition: color 200ms ease;
        }

        .faq-question:hover .faq-question-text,
        .faq-question:focus-visible .faq-question-text,
        .faq-item.is-open .faq-question-text {
          color: #2862cb;
        }

        .faq-item.is-open .faq-number {
          border-color: #dce8fc;
          background: #edf4ff;
          color: #2862cb;
        }

        .faq-question:focus-visible {
          outline: 2px solid #3977e8;
          outline-offset: -4px;
        }

        .faq-icon {
          position: relative;
          display: flex;
          flex: 0 0 30px;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: 1px solid #e6ebf2;
          border-radius: 50%;
          background: #fff;
          transition: transform 300ms ease, background 250ms ease,
            border-color 250ms ease;
        }

        .faq-icon span {
          position: absolute;
          width: 10px;
          height: 1.5px;
          border-radius: 99px;
          background: #778195;
          transition: transform 250ms ease, background 250ms ease;
        }

        .faq-icon span:nth-child(2) {
          transform: rotate(90deg);
        }

        .faq-item.is-open .faq-icon {
          transform: rotate(180deg);
          border-color: #dce8fc;
          background: #edf4ff;
        }

        .faq-item.is-open .faq-icon span {
          background: #2862cb;
        }

        .faq-item.is-open .faq-icon span:nth-child(2) {
          transform: rotate(0deg);
        }

        .faq-answer-wrapper {
          display: grid;
          transition: grid-template-rows 350ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .faq-answer-inner {
          min-height: 0;
          overflow: hidden;
        }

        .faq-answer {
          margin: 0;
          padding: 0 55px 0 63px;
          color: #697588;
          font-size: 12px;
          line-height: 1.9;
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

        .faq-bottom-note {
          margin: 18px 4px 0;
          color: #8792a2;
          font-size: 10px;
          line-height: 1.8;
        }

        @media (max-width: 1000px) {
          .faq-section {
            padding: 82px 24px;
          }

          .faq-container {
            gap: 40px;
          }

          .faq-intro h2 {
            font-size: clamp(36px, 4.5vw, 48px);
          }

          .faq-contact-card {
            padding: 20px;
          }

          .faq-question {
            gap: 12px;
            padding-right: 14px;
            padding-left: 14px;
          }

          .faq-answer {
            padding-right: 40px;
            padding-left: 56px;
          }
        }

        @media (max-width: 760px) {
          .faq-section {
            padding: 68px 20px;
          }

          .faq-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .faq-intro {
            position: static;
          }

          .faq-intro h2 {
            margin-top: 14px;
            font-size: clamp(39px, 9vw, 51px);
          }

          .faq-description {
            font-size: 13px;
          }

          .faq-contact-card {
            margin-top: 23px;
          }

          .faq-question {
            min-height: 70px;
            gap: 11px;
            padding: 14px;
          }

          .faq-question-text {
            font-size: 12px;
          }

          .faq-number {
            flex-basis: 28px;
            width: 28px;
            height: 28px;
          }

          .faq-icon {
            flex-basis: 28px;
            width: 28px;
            height: 28px;
          }

          .faq-answer {
            padding-right: 18px;
            padding-left: 53px;
            font-size: 12px;
          }

          .faq-item.is-open .faq-answer {
            padding-bottom: 19px;
          }
        }

        @media (max-width: 380px) {
          .faq-section {
            padding-right: 15px;
            padding-left: 15px;
          }

          .faq-question {
            gap: 9px;
            padding: 12px 10px;
          }

          .faq-question-text {
            font-size: 11px;
          }

          .faq-category {
            font-size: 7px;
          }

          .faq-answer {
            padding-right: 10px;
            padding-left: 46px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-intro,
          .faq-content,
          .faq-item {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .faq-contact-card,
          .faq-contact-link,
          .faq-question-text,
          .faq-number,
          .faq-icon,
          .faq-icon span,
          .faq-answer-wrapper,
          .faq-answer {
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
