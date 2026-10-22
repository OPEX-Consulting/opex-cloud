"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const initialForm = {
  name: "",
  email: "",
  company: "",
  subject: "General enquiry",
  message: "",
};

const enquiryOptions = [
  "General enquiry",
  "Cloud infrastructure",
  "Cloud migration",
  "Data hosting and compliance",
  "Business partnership",
  "Early access",
];

export default function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Disable entrance zoom and reveal effects on mobile.
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    if (mobileQuery.matches) {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Connect this handler to your API or form service to deliver messages.
    setSubmitted(true);
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (submitted) setSubmitted(false);
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className={`contact-section ${isVisible ? "is-visible" : ""}`}
    >
      <div className="contact-container">
        <header className="contact-heading">
          <span className="contact-label">Let’s talk</span>
          <h2 id="contact-heading">
            Tell us what you
            <br className="hidden sm:block" /> need from the cloud.
          </h2>

          <p className="contact-subtitle">
            Every business is different. Tell us what you’re working on, and
            we’ll help you explore the next steps with Opex Cloud.
          </p>
        </header>

        <div className="contact-layout">
          <aside className="contact-info">
            <div>
              <h3 className="info-heading">
                Better cloud decisions start with a conversation.
              </h3>

              <p className="info-description">
                Whether you’re planning a migration, exploring infrastructure,
                or simply looking for more information, tell us what your
                business needs.
              </p>

              <div className="info-details">
                <div className="info-item">
                  <span className="info-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <rect
                        x="3.5"
                        y="5"
                        width="17"
                        height="14"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="m5 7 7 5.5L19 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="info-item-title">Email enquiries</p>
                    <p className="info-item-description">
                      Reach out to discuss your requirements.
                    </p>
                    <a
                      href="mailto:REPLACE_WITH_OFFICIAL_EMAIL"
                      className="info-link"
                    >
                      Contact our team
                    </a>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path
                        d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="9"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </span>

                  <div>
                    <p className="info-item-title">
                      Built with Nigerian businesses in mind
                    </p>
                    <p className="info-item-description">
                      Share your needs and the challenges you want to solve.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-footer">
              <p>
                Opex Cloud is preparing to launch. Service availability,
                pricing, and support arrangements will be confirmed before
                launch.
              </p>
            </div>
          </aside>

          <div className="contact-form-card">
            {submitted ? (
              <div role="status" aria-live="polite" className="success-state">
                <span className="success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <h3>Your message is ready.</h3>

                <p>
                  The form passed browser validation, but your enquiry hasn’t
                  been sent yet. Connect a backend or form service to deliver it
                  to the Opex Cloud team.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm);
                    setSubmitted(false);
                  }}
                  className="secondary-button"
                >
                  Write another message
                </button>
              </div>
            ) : (
              <>
                <div className="form-heading">
                  <h3>Send us an enquiry</h3>
                  <p>Fill in the details below and tell us how we can help.</p>
                </div>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="contact-name">Full name</label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="contact-email">Work email</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="contact-company">
                      Company name <span>(optional)</span>
                    </label>
                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Your organisation"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="contact-subject">
                      What would you like to discuss?
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      {enquiryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="contact-message">
                      Tell us a little more
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="What are you looking to achieve with cloud infrastructure?"
                      required
                    />
                  </div>

                  <button type="submit" className="submit-button">
                    Submit enquiry
                  </button>

                  <p className="form-note">
                    Please avoid including passwords, payment details, or other
                    sensitive information in your message.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-section {
          overflow: hidden;
          padding: 112px 24px;
          background: #ffffff;
          color: #07152f;
        }

        .contact-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .contact-heading {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
          opacity: 0;
          transform: translateY(20px) scale(0.985);
          transition: opacity 650ms ease,
            transform 650ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .contact-section.is-visible .contact-heading {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .contact-label {
          display: inline-flex;
          align-items: center;
          min-height: 32px;
          padding: 7px 13px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          background: #ffffff;
          color: #3977e8;
          font-size: 12px;
          font-weight: 600;
        }

        .contact-eyebrow {
          display: block;
          margin-top: 28px;
          color: #3977e8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.17em;
          line-height: 1.6;
        }

        .contact-heading h2 {
          margin: 14px 0 0;
          font-size: clamp(38px, 5vw, 60px);
          font-weight: 650;
          line-height: 1.08;
          letter-spacing: -0.06em;
        }

        .contact-subtitle {
          max-width: 600px;
          margin: 22px auto 0;
          color: #687386;
          font-size: 16px;
          line-height: 1.85;
        }

        .contact-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          align-items: stretch;
          gap: 24px;
          max-width: 1100px;
          margin: 64px auto 0;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
          padding: 38px;
          border: 1px solid #07152f;
          border-radius: 26px;
          background: #07152f;
          color: #ffffff;
        }

        .info-eyebrow {
          color: #b8c9e7;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .info-heading {
          max-width: 390px;
          margin: 20px 0 0;
          font-size: clamp(27px, 2.6vw, 36px);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.045em;
        }

        .info-description {
          max-width: 390px;
          margin: 16px 0 0;
          color: #c0c8d7;
          font-size: 14px;
          line-height: 1.9;
        }

        .info-details {
          display: grid;
          gap: 28px;
          margin-top: 38px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .info-icon {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid #34415a;
          border-radius: 13px;
          background: #14213a;
          color: #dce7fa;
        }

        .info-item-title {
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.65;
        }

        .info-item-description {
          margin-top: 5px;
          color: #b9c2d2;
          font-size: 13px;
          line-height: 1.8;
        }

        .info-link {
          display: inline-block;
          margin-top: 9px;
          color: #dce7fa;
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: #65758f;
          text-underline-offset: 4px;
          transition: color 200ms ease;
        }

        .info-link:hover {
          color: #ffffff;
          text-decoration-color: #ffffff;
        }

        .info-footer {
          margin-top: 42px;
          padding-top: 22px;
          border-top: 1px solid #34415a;
        }

        .info-footer p {
          color: #aab5c8;
          font-size: 12px;
          line-height: 1.85;
        }

        /* Apple-like form surface */

        .contact-form-card {
          min-width: 0;
          padding: 38px;
          border: 1px solid #e5e7eb;
          border-radius: 26px;
          background: #f9fafb;
          opacity: 0;
          transform: translateY(20px) scale(0.985);
          transition: opacity 700ms 100ms ease,
            transform 700ms 100ms cubic-bezier(0.2, 0.65, 0.3, 1);
        }

        .contact-section.is-visible .contact-form-card {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .form-heading h3 {
          color: #07152f;
          font-size: 24px;
          font-weight: 650;
          line-height: 1.3;
          letter-spacing: -0.04em;
        }

        .form-heading p {
          margin-top: 8px;
          color: #737d8e;
          font-size: 13px;
          line-height: 1.8;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
          margin-top: 30px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 9px;
        }

        .form-field label {
          color: #273247;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.5;
        }

        .form-field label span {
          color: #8992a0;
          font-weight: 400;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          min-width: 0;
          border: 1px solid #dfe3e9;
          border-radius: 12px;
          background: #ffffff;
          color: #07152f;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.6;
          outline: none;
          transition: border-color 180ms ease, box-shadow 180ms ease,
            background-color 180ms ease;
        }

        .form-field input,
        .form-field select {
          min-height: 48px;
          padding: 12px 14px;
        }

        .form-field textarea {
          min-height: 132px;
          padding: 13px 14px;
          resize: vertical;
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #9aa2af;
        }

        .form-field input:hover,
        .form-field select:hover,
        .form-field textarea:hover {
          border-color: #c5ccd7;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          border-color: #3977e8;
          box-shadow: 0 0 0 3px rgb(57 119 232 / 12%);
        }

        .submit-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 13px 22px;
          border: 1px solid #07152f;
          border-radius: 999px;
          background: #07152f;
          color: #ffffff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: background-color 200ms ease, border-color 200ms ease;
        }

        .submit-button {
          align-self: flex-start;
          min-width: 170px;
        }

        .submit-button:hover,
        .secondary-button:hover {
          border-color: #1b3157;
          background: #1b3157;
        }

        .submit-button:focus-visible,
        .secondary-button:focus-visible {
          outline: 2px solid #3977e8;
          outline-offset: 3px;
        }

        .form-note {
          max-width: 440px;
          color: #858e9d;
          font-size: 11px;
          line-height: 1.8;
        }

        .success-state {
          display: flex;
          min-height: 420px;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
        }

        .success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border: 1px solid #dfe3e9;
          border-radius: 16px;
          background: #ffffff;
          color: #3977e8;
        }

        .success-icon svg {
          width: 26px;
          height: 26px;
        }

        .success-state h3 {
          margin-top: 24px;
          color: #07152f;
          font-size: 25px;
          font-weight: 650;
          letter-spacing: -0.04em;
        }

        .success-state p {
          max-width: 430px;
          margin-top: 12px;
          color: #687386;
          font-size: 13px;
          line-height: 1.9;
        }

        .secondary-button {
          margin-top: 25px;
        }

        @media (max-width: 1000px) {
          .contact-section {
            padding: 88px 24px;
          }

          .contact-layout {
            grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
            gap: 18px;
            margin-top: 52px;
          }

          .contact-info,
          .contact-form-card {
            padding: 28px;
            border-radius: 22px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .contact-section {
            padding: 72px 20px;
          }

          /* No entrance zoom or scroll animation on mobile. */
          .contact-heading,
          .contact-form-card,
          .contact-section.is-visible .contact-heading,
          .contact-section.is-visible .contact-form-card {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .contact-eyebrow {
            margin-top: 24px;
            font-size: 9px;
            letter-spacing: 0.14em;
          }

          .contact-heading h2 {
            margin-top: 13px;
            font-size: clamp(36px, 9vw, 48px);
            letter-spacing: -0.055em;
          }

          .contact-subtitle {
            margin-top: 18px;
            font-size: 14px;
            line-height: 1.85;
          }

          .contact-layout {
            grid-template-columns: 1fr;
            gap: 18px;
            margin-top: 38px;
          }

          .contact-info,
          .contact-form-card {
            padding: 25px 21px;
            border-radius: 20px;
          }

          .info-heading {
            margin-top: 15px;
            font-size: 29px;
          }

          .info-description {
            font-size: 13px;
          }

          .info-details {
            gap: 23px;
            margin-top: 30px;
          }

          .info-footer {
            margin-top: 32px;
          }

          .form-heading h3 {
            font-size: 22px;
          }

          .contact-form {
            gap: 20px;
            margin-top: 25px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .submit-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-heading,
          .contact-form-card,
          .contact-section.is-visible .contact-heading,
          .contact-section.is-visible .contact-form-card,
          .info-link,
          .form-field input,
          .form-field select,
          .form-field textarea,
          .submit-button,
          .secondary-button {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
