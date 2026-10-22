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
import WaitlistModal from "./components/WaitlistModal";
import Partnership from "./components/Partnership";

export default function Home() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const openWaitlist = () => setIsWaitlistOpen(true);
  const closeWaitlist = () => setIsWaitlistOpen(false);

  return (
    <>
      <Herosection onJoinWaitlist={openWaitlist} />

      <MarqueeSection />
      <Partnership />
      <AboutSection onJoinWaitlist={openWaitlist} />

      <FeaturesSection />

      <WhoIsItForSection />

      <CtaSection onJoinWaitlist={openWaitlist} />

      <FaqSection />

      <Contact />

      <FooterSection onJoinWaitlist={openWaitlist} />

      <WaitlistModal isOpen={isWaitlistOpen} onClose={closeWaitlist} />
    </>
  );
}
