"use client";

import { useState } from "react";

import Herosection from "./components/Herosection";
import MarqueeSection from "./components/marqeeSection";
import FooterSection from "./components/FooterSection";
import AboutSection from "./components/AboutSection";
import FeaturesSection from "./components/FeaturesSection";
import FaqSection from "./components/FaqSection";
import Contact from "./components/ContactSection";
import WhoIsItForSection from "./components/WhoIsItForSection";
import CtaSection from "./components/CtaSection";
import Partnership from "./components/Partnership";
import Service from "./components/ServiceSection";
import Solution from "./components/SolutionSection";
import Trust from "./components/TrustSection";
import CertificationSection from "./components/CertificationSection";

export default function Home() {
  return (
    <>
      <Herosection />
      <Partnership />
      <Service />
      <Solution />
      <Trust />
      <CertificationSection />
      <WhoIsItForSection />
      <CtaSection />
      <FaqSection />
      <FooterSection />
    </>
  );
}
