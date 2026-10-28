"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type SupportForm = {
  fullName: string;
  email: string;
  organisation: string;
  category: string;
  subject: string;
  message: string;
};

const initialForm: SupportForm = {
  fullName: "",
  email: "",
  organisation: "",
  category: "General enquiry",
  subject: "",
  message: "",
};

const supportCategories = [
  "General enquiry",
  "Account and access",
  "Cloud infrastructure",
  "Migration and setup",
  "Billing",
  "Security and data",
  "Technical issue",
  "Other",
];

const faqs = [
  {
    question: "What can I contact OPEX Cloud Support about?",
    answer:
      "Contact us about cloud infrastructure, account access, migration planning, billing enquiries, security considerations, and technical issues related to your OPEX Cloud services.",
  },
  {
    question: "Can I get help with my cloud infrastructure?",
    answer:
      "Yes. Describe the service you need help with, what you are trying to achieve, and any relevant error messages. Providing these details helps us understand your request and determine the next steps.",
  },
  {
    question: "Can you help us migrate our workloads to the cloud?",
    answer:
      "We can discuss your migration requirements, current infrastructure, workload needs, and objectives. Share details about your environment so the team can better understand your requirements.",
  },
  {
    question: "Where will our business data be hosted?",
    answer:
      "Data residency depends on the infrastructure and service arrangement configured for your business. Contact us to discuss your location, regulatory, and data protection requirements.",
  },
  {
    question: "How do I report a technical issue?",
    answer:
      "Select Technical issue in the support request form. Describe the affected service, what happened, and any relevant error messages. Never include passwords, private keys, API secrets, or other sensitive credentials.",
  },
  {
    question: "How can I get help with billing?",
    answer:
      "Select Billing when submitting your request and provide a brief description of the issue. Include relevant non-sensitive account or transaction references if available, but do not share payment credentials.",
  },
];

export default function SupportPage() {
  const [form, setForm] = useState<SupportForm>(initialForm);
  const [notice, setNotice] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");

  function updateField(field: keyof SupportForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setNotice("");
    setTicketId("");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxyedZ_lo8R31aqKT7aRfW6-0dcnS5vtmH6T2dMgjn7BR1jqsvnwEQUD0NF1StHXPPo8A/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Unable to submit your support request."
        );
      }

      setTicketId(result.ticketId || "");
      setNotice(
        result.message ||
          "Your support request has been submitted successfully."
      );
      setForm(initialForm);
    } catch (error) {
      console.error("Support submission failed:", error);

      setNotice("Unable to confirm your submission. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#07152f]">
      {/* Minimal header */}
      <header className="relative z-20 border-b border-white/10 bg-[#07152f]">
        <div className="mx-auto flex h-[58px] w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="OPEX Cloud home"
            className="inline-flex shrink-0 items-center"
          >
            <Image
              src="/images/opexwhite.webp"
              alt="OPEX Cloud"
              width={90}
              height={28}
              priority
              className="h-auto w-[68px] object-contain"
            />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#07152f] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
          <div className="absolute right-[-120px] top-[-170px] h-[360px] w-[360px] rounded-full border border-white/[0.07]" />
          <div className="absolute right-[-65px] top-[-115px] h-[250px] w-[250px] rounded-full border border-white/[0.07]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Here when you
              <span className="block text-[#a8c9ff]">need a hand.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              Get help with your OPEX Cloud services, resolve technical issues,
              or discuss your infrastructure requirements. Tell us what you
              need, and we’ll help you work out the next step.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4 text-[#a8c9ff]"
                  aria-hidden="true"
                >
                  <path
                    d="m4 10 4 4 8-8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Technical support
              </span>

              <span className="inline-flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4 text-[#a8c9ff]"
                  aria-hidden="true"
                >
                  <path
                    d="m4 10 4 4 8-8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Infrastructure guidance
              </span>

              <span className="inline-flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4 text-[#a8c9ff]"
                  aria-hidden="true"
                >
                  <path
                    d="m4 10 4 4 8-8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Account assistance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main support content */}
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20 lg:px-12 lg:py-20">
        <aside className="min-w-0">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              How can we help?
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#647084]">
              Tell us what you need help with. Include enough context for the
              team to understand your request and identify the next step.
            </p>
          </div>

          <div className="mt-9 divide-y divide-[#e8ebf0] border-y border-[#e8ebf0]">
            <div className="flex gap-4 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8ebf0] bg-[#fafbfc]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="m4.5 7 7.5 5.5L19.5 7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Technical support</h3>
                <p className="mt-1 text-sm leading-6 text-[#647084]">
                  Describe the issue affecting your service, including relevant
                  error messages and troubleshooting already attempted.
                </p>
              </div>
            </div>

            <div className="flex gap-4 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8ebf0] bg-[#fafbfc]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="3.5"
                    width="14"
                    height="17"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9 8h6M9 12h6M9 16h3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold">
                  Infrastructure and migration
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#647084]">
                  Discuss workload requirements, infrastructure changes, and
                  migration planning.
                </p>
              </div>
            </div>

            <div className="flex gap-4 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8ebf0] bg-[#fafbfc]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3.5 19 6v5.2c0 4.3-2.8 7.4-7 9.3-4.2-1.9-7-5-7-9.3V6l7-2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Security and data</h3>
                <p className="mt-1 text-sm leading-6 text-[#647084]">
                  Ask about data residency, access controls, and your business
                  requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#e8ebf0] bg-[#fafbfc] p-5 sm:p-6">
            <p className="text-sm font-semibold">
              Keep your information secure
            </p>
            <p className="mt-2 text-sm leading-6 text-[#647084]">
              Never include passwords, private keys, API secrets, or
              confidential customer data in a support request.
            </p>
          </div>
        </aside>

        {/* Support form */}
        <div className="min-w-0">
          <div className="rounded-2xl border border-[#dfe4eb] bg-white p-5 sm:p-8 lg:p-9">
            <div className="border-b border-[#e8ebf0] pb-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                Submit a support request
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#647084]">
                Provide the details below. Fields marked with an asterisk are
                required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-[#17243a]"
                  >
                    Full name <span className="text-[#315caa">*</span>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    required
                    value={form.fullName}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                    placeholder="Your full name"
                    className="support-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#17243a]"
                  >
                    Work email <span className="text-[#315caa">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="you@company.com"
                    className="support-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="organisation"
                    className="mb-2 block text-sm font-medium text-[#17243a]"
                  >
                    Organisation
                  </label>

                  <input
                    id="organisation"
                    name="organisation"
                    autoComplete="organization"
                    value={form.organisation}
                    onChange={(event) =>
                      updateField("organisation", event.target.value)
                    }
                    placeholder="Company name"
                    className="support-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-[#17243a]"
                  >
                    Request type <span className="text-[#315caa">*</span>
                  </label>

                  <select
                    id="category"
                    name="category"
                    required
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    className="support-input"
                  >
                    {supportCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-[#17243a]"
                >
                  Subject <span className="text-[#315caa">*</span>
                </label>

                <input
                  id="subject"
                  name="subject"
                  required
                  maxLength={160}
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  placeholder="Briefly describe your request"
                  className="support-input"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[#17243a]"
                  >
                    Message <span className="text-[#315caa">*</span>
                  </label>

                  <span className="text-xs text-[#7b8798]">
                    {form.message.length}/3000
                  </span>
                </div>

                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={6}
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="Explain what you need help with, what happened, and any relevant details."
                  className="support-input min-h-36 resize-y leading-6"
                />

                <p className="mt-2 text-xs leading-5 text-[#7b8798]">
                  Do not include passwords, access tokens, API keys, or other
                  sensitive credentials.
                </p>
              </div>

              {notice && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-[#dfe4eb] bg-[#f7f9fc] px-4 py-3 text-sm leading-6 text-[#344966]"
                >
                  {notice}
                </div>
              )}

              <div className="flex flex-col gap-4 border-t border-[#e8ebf0] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xs text-xs leading-5 text-[#7b8798]">
                  Your request will be sent once this form is connected to the
                  support system.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#07152f] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#10264b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315caa] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting request..." : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-[#e8ebf0] bg-[#fafbfc]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Clear answers.
              <span className="block text-[#647084]">Practical support.</span>
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-[#647084]">
              Find answers to common questions about using OPEX Cloud and
              getting assistance with your services.
            </p>
          </div>

          <div className="divide-y divide-[#e1e6ed] border-y border-[#e1e6ed]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left"
                  >
                    <span className="text-sm font-semibold leading-6 text-[#17243a] sm:text-base">
                      {faq.question}
                    </span>

                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dfe4eb] text-[#52647e]"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        <path
                          d="M10 4v12M4 10h12"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-[#647084]">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8ebf0] bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link
            href="/"
            aria-label="OPEX Cloud home"
            className="inline-flex w-fit items-center"
          >
            <Image
              src="/images/opexwhite.webp"
              alt="OPEX Cloud"
              width={90}
              height={28}
              className="h-auto w-[68px] object-contain brightness-0"
            />
          </Link>

          <p className="text-xs leading-5 text-[#7b8798]">
            © {new Date().getFullYear()} OPEX Cloud. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#647084]">
            <Link href="/" className="transition-colors hover:text-[#07152f]">
              Home
            </Link>

            <Link
              href="/#contact"
              className="transition-colors hover:text-[#07152f]"
            >
              Contact
            </Link>

            <Link
              href="/privacy"
              className="transition-colors hover:text-[#07152f]"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .support-input {
          display: block;
          width: 100%;
          min-height: 46px;
          border: 1px solid #dfe4eb;
          border-radius: 10px;
          background: #fff;
          padding: 11px 13px;
          color: #07152f;
          font-size: 14px;
          line-height: 1.5;
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }

        .support-input::placeholder {
          color: #98a2b1;
        }

        .support-input:hover {
          border-color: #b9c3d1;
        }

        .support-input:focus {
          border-color: #315caa;
          box-shadow: 0 0 0 3px rgb(49 92 170 / 10%);
        }

        select.support-input {
          cursor: pointer;
        }

        @media (prefers-reduced-motion: reduce) {
          .support-input {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
