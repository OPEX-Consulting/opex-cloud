"use client";

import Image from "next/image";

type FooterSectionProps = {
  onJoinWaitlist: () => void;
};

const footerLinks = {
  Explore: [
    { label: "About Opex Cloud", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ],
  GetStarted: [
    { label: "Join early access", href: "#early-access" },
    { label: "Talk to us", href: "#contact" },
  ],
};

export default function FooterSection({ onJoinWaitlist }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-[#07152f] px-5 pb-0 pt-16 text-white sm:px-8 sm:pt-20 lg:px-12"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 sm:pb-16 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10">
          {/* Brand */}
          <div className="max-w-sm">
            <a
              href="#home"
              aria-label="Opex Cloud home"
              className="inline-flex items-center rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Image
                src="/images/opexwhite.webp"
                alt="Opex Cloud"
                width={160}
                height={48}
                className="h-10 w-auto object-contain object-left"
              />
            </a>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">
              Cloud infrastructure, made simpler for Nigerian businesses. We’re
              preparing a more straightforward way to approach the cloud.
            </p>

            <button
              type="button"
              onClick={onJoinWaitlist}
              className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold !text-[#07152f] transition-colors duration-200 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07152f]"
            >
              Join early access
            </button>
          </div>

          {/* Explore */}
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Explore
            </h2>

            <ul className="mt-5 space-y-3.5">
              {footerLinks.Explore.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-300 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get started */}
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Get started
            </h2>

            <ul className="mt-5 space-y-3.5">
              {footerLinks.GetStarted.map((link) => (
                <li key={link.label}>
                  {link.label === "Join early access" ? (
                    <button
                      type="button"
                      onClick={onJoinWaitlist}
                      className="cursor-pointer text-left text-sm text-slate-300 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-slate-300 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Get in touch
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-300">
              Have a cloud requirement or want to learn more about the upcoming
              launch? We’d be happy to hear from you.
            </p>

            <a
              href="mailto:REPLACE_WITH_OFFICIAL_EMAIL"
              className="mt-4 inline-flex break-all text-sm font-medium text-blue-300 underline decoration-blue-300/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Contact our team
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            © {currentYear} Opex Cloud. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="/privacy"
              className="text-xs text-slate-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              Privacy policy
            </a>

            <a
              href="/terms"
              className="text-xs text-slate-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              Terms of service
            </a>

            <a
              href="#home"
              className="text-xs font-medium text-slate-300 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              Back to top
            </a>
          </div>
        </div>
      </div>

      {/* Large, faint OPEX CLOUD wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden border-t border-white/[0.06] pt-2"
      >
        <div className="mx-auto max-w-[1600px]">
          <p className="whitespace-nowrap text-center text-[19vw] font-semibold leading-[0.82] tracking-[-0.095em] text-white/[0.045] sm:text-[18vw] lg:text-[17.2vw]">
            OPEX CLOUD
          </p>
        </div>
      </div>
    </footer>
  );
}
