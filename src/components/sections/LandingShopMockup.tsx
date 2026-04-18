"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import { SectionQuote } from "@/components/ui/SectionQuote";

export function LandingShopMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="border-b border-gray-100 bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          className="mb-12 text-center lg:mb-14"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary"
          >
            Your link, their screen
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            One URL a full shop on every phone
          </motion.h2>
          <SectionQuote quote="Share once; your catalog, prices, and checkout stay in one place." />
        </motion.div>

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex justify-center"
        >
          <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
            <div
              className="rounded-[2.25rem] border-[10px] border-gray-900 bg-gray-900 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)]"
              aria-hidden
            >
              <div className="h-3 w-24 mx-auto mt-2 rounded-full bg-gray-800" />
              <div className="mt-3 overflow-hidden rounded-[1.35rem] bg-gray-100">
                <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 ring-1 ring-gray-100" />
                    <div className="min-w-0 flex-1">
                      <div className="h-2.5 w-24 rounded bg-gray-200" />
                      <div className="mt-1.5 h-2 w-16 rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 bg-gray-50/80 p-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
                    >
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-gray-100" />
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                        <div className="h-2.5 w-[70%] rounded bg-gray-200" />
                        <div className="h-2 w-12 rounded bg-secondary/25" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 bg-white px-4 py-3">
                  <div className="h-10 w-full rounded-xl bg-secondary/90 shadow-sm" />
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-muted">
              Illustrative preview your real shop shows your logo, products, and prices.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
