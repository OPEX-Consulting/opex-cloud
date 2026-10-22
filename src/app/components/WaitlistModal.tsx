"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type WaitlistFormData = {
  fullName: string;
  workEmail: string;
  businessName: string;
  referralSource: string;
};

type WaitlistModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (data: WaitlistFormData) => void;
};

const REFERRAL_OPTIONS = [
  "Conference",
  "Google",
  "Twitter / X",
  "Facebook",
  "Instagram",
  "A friend",
  "LLM model",
  "Other",
];

const INITIAL_FORM: WaitlistFormData = {
  fullName: "",
  workEmail: "",
  businessName: "",
  referralSource: "",
};

const QUESTIONS = [
  {
    title: "First, what should we call you?",
    description: "Let's start with an introduction.",
    placeholder: "Your full name",
    field: "fullName" as const,
    type: "text",
    autocomplete: "name",
  },
  {
    title: "Where can we reach you?",
    description: "We'll use this to keep you in the loop.",
    placeholder: "you@company.com",
    field: "workEmail" as const,
    type: "email",
    autocomplete: "email",
  },
  {
    title: "Tell us about your business.",
    description: "We'd love to know what you're building.",
    placeholder: "Your company or startup",
    field: "businessName" as const,
    type: "text",
    autocomplete: "organization",
  },
  {
    title: "How did you find us?",
    description: "We're always curious how people discover Opex Cloud.",
    placeholder: "Select an option",
    field: "referralSource" as const,
    type: "select",
    autocomplete: "off",
  },
];

export default function WaitlistModal({
  isOpen = false,
  onClose,
  onSuccess,
}: WaitlistModalProps) {
  const inputId = useId();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WaitlistFormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setFormData(INITIAL_FORM);
      setSubmitted(false);
      setError("");
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const currentQuestion = QUESTIONS[step];

  const updateField = (field: keyof WaitlistFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError("");
  };

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const value = formData[currentQuestion.field].trim();

    if (!value) {
      setError("Please fill this in before continuing.");
      return;
    }

    if (
      currentQuestion.field === "workEmail" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (step < QUESTIONS.length - 1) {
      setStep((previous) => previous + 1);
      return;
    }

    handleSubmit();
  };

  const handleSubmit = () => {
    const submission: WaitlistFormData = {
      fullName: formData.fullName.trim(),
      workEmail: formData.workEmail.trim(),
      businessName: formData.businessName.trim(),
      referralSource: formData.referralSource,
    };

    /*
     * Connect your waitlist API here before production.
     * This example currently handles the submission locally;
     * it does not save registrations to a database.
     */

    onSuccess?.(submission);
    setSubmitted(true);
  };

  const handleBack = () => {
    setError("");

    if (step > 0) {
      setStep((previous) => previous - 1);
    } else {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="waitlist-overlay fixed inset-0 z-[100] flex items-end justify-center overflow-hidden bg-black/40 px-0 pt-6 pb-0 backdrop-blur-xl sm:items-center sm:overflow-y-auto sm:px-6 sm:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${inputId}-title`}
        className="waitlist-modal relative mt-auto flex max-h-[92dvh] w-full max-w-[470px] flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-white shadow-[0_-12px_60px_rgba(0,0,0,0.14)] pb-[env(safe-area-inset-bottom)] sm:my-auto sm:max-h-[90dvh] sm:rounded-[32px] sm:shadow-[0_24px_80px_rgba(0,0,0,0.16)]"
      >
        {/* Mobile bottom-sheet handle */}
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-[#d2d2d7]" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-6 pb-3 pt-5 sm:px-8 sm:pt-7">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close waitlist form"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[#6e6e73] transition-colors hover:bg-[#e8e8ed] hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315caa]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-5">
          {submitted ? (
            <div className="waitlist-content flex min-h-[300px] flex-col justify-center py-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[#315caa]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#315caa]">
                Thank you
              </p>

              <h2
                id={`${inputId}-title`}
                className="text-[30px] font-semibold leading-[1.15] tracking-[-0.045em] text-[#1d1d1f] sm:text-[34px]"
              >
                Nice to meet you, {formData.fullName.split(" ")[0]}.
              </h2>

              <p className="mt-4 max-w-sm text-[15px] leading-7 text-[#6e6e73]">
                Thanks for your interest in Opex Cloud. Your details have been
                received in this session.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-8 flex min-h-12 w-full items-center justify-center rounded-full bg-[#07152f] px-6 text-sm font-medium text-white transition-colors hover:bg-[#10264c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315caa] focus-visible:ring-offset-2"
              >
                Done
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleContinue}
              className="waitlist-content flex flex-col"
            >
              <h2
                id={`${inputId}-title`}
                className="text-[30px] font-semibold leading-[1.15] tracking-[-0.045em] text-[#1d1d1f] sm:text-[34px]"
              >
                {currentQuestion.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#6e6e73]">
                {currentQuestion.description}
              </p>

              <div className="mt-8">
                {currentQuestion.type === "select" ? (
                  <select
                    id={`${inputId}-${currentQuestion.field}`}
                    autoFocus
                    aria-label={currentQuestion.title}
                    autoComplete="off"
                    value={formData.referralSource}
                    onChange={(event) =>
                      updateField("referralSource", event.target.value)
                    }
                    className="min-h-[54px] w-full appearance-none rounded-2xl border border-transparent bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] outline-none transition-colors focus:border-[#315caa] focus:bg-white"
                  >
                    <option value="" disabled>
                      {currentQuestion.placeholder}
                    </option>

                    {REFERRAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${inputId}-${currentQuestion.field}`}
                    autoFocus
                    aria-label={currentQuestion.title}
                    type={currentQuestion.type}
                    autoComplete={currentQuestion.autocomplete}
                    placeholder={currentQuestion.placeholder}
                    value={formData[currentQuestion.field]}
                    onChange={(event) =>
                      updateField(currentQuestion.field, event.target.value)
                    }
                    className="min-h-[54px] w-full rounded-2xl border border-transparent bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#315caa] focus:bg-white"
                  />
                )}

                {error && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#e5e5ea] bg-white px-5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315caa]"
                >
                  {step === 0 ? "Cancel" : "Back"}
                </button>

                <button
                  type="submit"
                  className="flex min-h-12 flex-[1.4] items-center justify-center rounded-full bg-[#07152f] px-5 text-sm font-medium text-white transition-colors hover:bg-[#10264c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315caa] focus-visible:ring-offset-2"
                >
                  {step === QUESTIONS.length - 1
                    ? "Join the waitlist"
                    : "Continue"}
                </button>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-[#86868b]">
                Just a few quick questions. No unnecessary emails.
              </p>
            </form>
          )}
        </div>
      </section>

      <style jsx>{`
        .waitlist-overlay {
          animation: overlay-in 180ms ease-out both;
        }

        .waitlist-modal {
          animation: sheet-in 260ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
          will-change: transform, opacity;
        }

        .waitlist-content {
          animation: content-in 220ms ease-out both;
        }

        @keyframes overlay-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes sheet-in {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes content-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 640px) {
          .waitlist-modal {
            animation-name: modal-in;
          }

          @keyframes modal-in {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .waitlist-overlay,
          .waitlist-modal,
          .waitlist-content {
            animation: none;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
