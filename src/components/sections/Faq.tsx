"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import { SectionQuote } from "@/components/ui/SectionQuote";

const faqs = [
  {
    q: "Is there a free period?",
    a: "Yes we run launch-friendly pricing with an intro period so you can set up your shop and try the full flow before your plan kicks in. See the Pricing section for current details.",
  },
  {
    q: "How do customers pay?",
    a: "Shops can use payment options that work in Pakistan (for example JazzCash or EasyPaisa references you configure). Buyers see clear instructions at checkout so there’s less confusion in DMs.",
  },
  {
    q: "Who handles refunds or disputes?",
    a: "Each vendor sets their own policies. Karobaar helps you present orders clearly; for refunds or exchanges, buyers and sellers coordinate according to the shop’s terms we recommend stating them on your storefront.",
  },
  {
    q: "Do I need a website or coding skills?",
    a: "No. You get a shareable Karobaar link for your shop. Paste it in your bio, status, or messages customers open it like any other webpage.",
  },
];

export function Faq() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-b border-gray-100 bg-surface px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div ref={ref} className="mx-auto max-w-3xl">
        <motion.div
          className="mb-12 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary"
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Common questions
          </motion.h2>
          <SectionQuote quote="Straight answers — so you can decide with confidence." />
        </motion.div>

        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {faqs.map((item) => (
            <motion.div key={item.q} variants={fadeSlideUp}>
              <details className="group rounded-2xl border border-gray-200/90 bg-background px-4 py-1 shadow-sm transition-colors open:border-secondary/25 open:bg-white [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-left font-medium text-ink">
                  <span>{item.q}</span>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden
                  />
                </summary>
                <p className="border-t border-gray-100 pb-4 pt-1 text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
