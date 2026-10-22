"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type NavbarProps = {
  onJoinWaitlist: () => void;
};

const NAV_LINKS = [
  { label: "What We Offer", href: "#features" },
  { label: "Who It’s For", href: "#who-its-for" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ onJoinWaitlist }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleMobileWaitlist = () => {
    closeMenu();
    onJoinWaitlist();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-2 sm:px-6 sm:pt-2.5">
      <nav
        aria-label="Main navigation"
        className={`mx-auto flex items-center justify-between rounded-full border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled
            ? "max-w-[560px] border-white/10 bg-[#07152f]/95 px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:px-5"
            : "max-w-7xl border-transparent bg-transparent px-4 py-2.5 shadow-none sm:px-6"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Opex Cloud home"
          onClick={closeMenu}
          className="relative z-50 flex shrink-0 items-center"
        >
          <Image
            src="/images/opexwhite.webp"
            alt="Opex Cloud"
            width={132}
            height={42}
            priority
            className={`w-auto object-contain transition-all duration-500 ${
              scrolled ? "h-6 sm:h-7" : "h-7 sm:h-8"
            }`}
          />
        </Link>

        {/* Desktop navigation */}
        <div
          aria-hidden={scrolled}
          className={`hidden items-center gap-1 overflow-hidden transition-all duration-300 ease-in-out md:flex ${
            scrolled
              ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
              : "max-w-[620px] translate-x-0 opacity-100"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              tabIndex={scrolled ? -1 : 0}
              className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium !text-white transition-colors duration-300 hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3977e8] lg:px-3"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden shrink-0 md:block">
          <button
            type="button"
            onClick={onJoinWaitlist}
            className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              scrolled
                ? "bg-white text-[#07152f] hover:bg-slate-100"
                : "bg-[#07152f] !text-white hover:bg-[#10264b]"
            }`}
          >
            Join Waitlist
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
          className={`relative z-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden ${
            scrolled || menuOpen ? "text-white" : "text-[#07152f]"
          }`}
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
              className="rounded-2xl px-4 py-3.5 text-sm font-medium !text-white transition-colors duration-200 hover:bg-white/10 hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            tabIndex={menuOpen ? 0 : -1}
            onClick={handleMobileWaitlist}
            className="mt-2 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#07152f] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Join early access
          </button>
        </div>
      </div>
    </header>
  );
}
