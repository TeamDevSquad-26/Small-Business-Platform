"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { AudienceSplit } from "@/components/sections/AudienceSplit";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Faq } from "@/components/sections/Faq";

export function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AudienceSplit />
        <Features />
        <HowItWorks />
        <Faq />
      </main>
    </>
  );
}
