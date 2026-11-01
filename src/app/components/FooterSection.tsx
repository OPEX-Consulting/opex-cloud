"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const footerLinks = [
  { label: "Solutions", href: "#solutions" },
  { label: "Services", href: "#services" },
  { label: "Platform", href: "#platform" },
  { label: "Trust", href: "#trust" },
];

export default function FooterSection() {
  const currentYear = new Date().getFullYear();
  const routerInterface = useRouter();

  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-[#07152f] px-5 pt-16 text-white sm:px-8 sm:pt-20 lg:px-12"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Main footer */}
        <div className="grid gap-12 border-b border-white/10 pb-12 sm:pb-14 lg:grid-cols-[1.5fr_1fr_1.2fr] lg:gap-12">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="OPEX Cloud home"
              className="inline-flex rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8]"
            >
              <Image
                src="/images/opexwhite.webp"
                alt="OPEX Cloud"
                width={160}
                height={48}
                priority={false}
                className="h-9 w-auto object-contain object-left sm:h-10"
              />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">
              Enterprise cloud infrastructure, built for Nigeria. OPEX Cloud
              helps organisations approach cloud infrastructure with practical
              guidance and a clear path from planning to implementation.
            </p>

            <button
              type="button"
              onClick={() => routerInterface.push("/onboarding")}
              className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold !text-[#07152f] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07152f]"
            >
              Talk to a Cloud Expert
            </button>
          </div>

          {/* Navigation links */}
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Explore OPEX Cloud
            </h2>

            <ul className="mt-5 space-y-3.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm leading-6 text-slate-300 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">
              Talk to our team
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-300">
              Discuss your infrastructure, migration plans, workload
              requirements or cloud assessment with our team.
            </p>

            <div className="mt-6 space-y-4">
              {/* Email */}
              <a
                href="mailto:info@opexconsult.co.uk"
                className="group flex w-fit max-w-full items-start gap-3 rounded-lg text-sm text-slate-300 transition-colors duration-200 hover:text-[#8bb8ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#07152f]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#8bb8ff] transition-colors group-hover:border-[#8bb8ff]/30 group-hover:bg-[#8bb8ff]/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="min-w-0 pt-2">
                  <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    Email us
                  </span>
                  <span className="mt-1 block break-all font-medium">
                    info@opexconsult.co.uk
                  </span>
                </span>
              </a>

              {/* Phone */}
              <a
                href="tel:+2348024611363"
                className="group flex w-fit max-w-full items-start gap-3 rounded-lg text-sm text-slate-300 transition-colors duration-200 hover:text-[#8bb8ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] focus-visible:ring-offset-4 focus-visible:ring-offset-[#07152f]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#8bb8ff] transition-colors group-hover:border-[#8bb8ff]/30 group-hover:bg-[#8bb8ff]/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      d="M7 3.5h3l1.5 4-2 1.6a13 13 0 0 0 5.4 5.4l1.6-2 4 1.5v3a2 2 0 0 1-2.1 2A15.5 15.5 0 0 1 5 5.6 2 2 0 0 1 7 3.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="pt-2">
                  <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                    Call us
                  </span>
                  <span className="mt-1 block font-medium">
                    +234(0)8024611363
                  </span>
                </span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => routerInterface.push("/support")}
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all duration-300 hover:border-[#8bb8ff]/50 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8]"
            >
              Contact OPEX Cloud
            </button>

            <p className="mt-6 text-xs leading-5 text-slate-400">
              A cloud services business of OPEX Consulting Limited.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            © {currentYear} OPEX Cloud. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/privacy"
              className="text-xs text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/cookies"
              className="text-xs text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              Cookie Policy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              Terms of Service
            </Link>

            <Link
              href="/#top"
              className="text-xs font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              Back to top
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle oversized wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden border-t border-white/[0.06] pt-3"
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
