"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Link2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionQuote } from "@/components/ui/SectionQuote";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const items = [
  {
    title: "Storefront & branding",
    desc: "Go live with your shop name, categories, and a clean page customers trust.",
    icon: LayoutDashboard,
  },
  {
    title: "Social & shareable link",
    desc: "One Karobaar URL for bio, status, and DMs send people straight to your catalog.",
    icon: Link2,
  },
  {
    title: "Products & orders",
    desc: "Photos, pricing, and inventory in one place track orders without spreadsheets.",
    icon: Package,
  },
  {
    title: "Checkout & plans",
    desc: "Clear checkout for buyers; subscription tiers when you’re ready to scale.",
    icon: CreditCard,
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="features" className="scroll-mt-20 bg-surface px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          className="mb-14 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary"
          >
            Features
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Everything to run and share your shop
          </motion.h2>
          <SectionQuote quote="Look professional, stay organized, and get paid without duct-taping five apps together." />
        </motion.div>

        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {items.map(({ title, desc, icon: Icon }) => (
            <motion.div key={title} variants={fadeSlideUp}>
              <Card className="group flex h-full flex-col gap-4 border-gray-100/60 bg-gradient-to-b from-white to-gray-50/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary shadow-sm ring-1 ring-secondary/10 transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {desc}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
