"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Footer } from "@/components/sections/Footer";

export function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero
          onViewDemo={() => {
            const el = document.getElementById("how-it-works");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
