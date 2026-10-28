"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NavbarProps = {
  onJoinWaitlist: () => void;
};

const NAV_LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "Services", href: "#services" },
  { label: "Platform", href: "#platform" },
  { label: "Support", href: "support" },
  { label: "Trust", href: "#trust" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const routerInterface = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleMobileCTA = () => {
    closeMenu();
    routerInterface.push("/onboarding");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] px-4 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main navigation"
        className={`mx-auto flex min-h-[52px] items-center justify-between rounded-full border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "max-w-[960px] border-white/10 bg-[#07152f]/95 px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:px-5"
            : "max-w-7xl border-transparent bg-transparent px-4 py-2.5 shadow-none sm:px-6"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="OPEX Cloud home"
          onClick={closeMenu}
          className="relative z-10 flex shrink-0 items-center"
        >
          <Image
            src="/images/opexwhite.webp"
            alt="OPEX Cloud"
            width={132}
            height={42}
            priority
            className={`w-auto object-contain transition-all duration-500 ${
              scrolled ? "h-6 sm:h-7" : "h-7 sm:h-8"
            }`}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 transition-all duration-500 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-2 py-2 text-xs font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] lg:px-2.5 lg:text-sm ${
                scrolled
                  ? "!text-white hover:!text-white"
                  : "!text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)] hover:!text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden shrink-0 md:block">
          <button
            type="button"
            onClick={() => routerInterface.push("/onboarding")}
            className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 lg:px-5 lg:text-sm ${
              scrolled
                ? "bg-white text-[#07152f] hover:bg-slate-100"
                : "bg-[#07152f] text-white hover:bg-[#10264b]"
            }`}
          >
            Talk to an Expert
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] md:hidden"
        >
          <span className="sr-only">
            {menuOpen ? "Close menu" : "Open menu"}
          </span>

          <span className="flex w-5 flex-col items-center gap-[5px]">
            <span
              className={`h-[1.5px] w-5 rounded-full bg-current transition-transform duration-300 ${
                menuOpen ? "translate-y-[3.25px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-5 rounded-full bg-current transition-transform duration-300 ${
                menuOpen ? "-translate-y-[3.25px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile navigation */}
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={`mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#07152f] shadow-[0_16px_50px_rgba(7,21,47,0.2)] transition-all duration-300 md:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex flex-col p-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3.5 text-sm font-medium !text-white transition-colors duration-200 hover:bg-white/10 hover:text-[#9bc0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            tabIndex={menuOpen ? 0 : -1}
            onClick={handleMobileCTA}
            className="mt-2 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#07152f] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Talk to an Expert
          </button>
        </div>
      </div>
    </header>
  );
}
