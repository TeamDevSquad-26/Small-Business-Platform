"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Card } from "@/components/ui/Card";
import { SectionQuote } from "@/components/ui/SectionQuote";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import { LAUNCH_OFFER, SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";

export function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="pricing" className="scroll-mt-20 bg-surface px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
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
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Simple, transparent plans
          </motion.h2>
          <SectionQuote quote="Start free, then grow into the plan that fits your traffic — not the other way around." />
        </motion.div>

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-8 rounded-2xl border border-secondary/20 bg-secondary/5 px-5 py-4 text-center"
        >
          <p className="text-sm font-semibold text-secondary">{LAUNCH_OFFER.title}</p>
          <p className="mt-1 text-sm text-muted">{LAUNCH_OFFER.detail}</p>
        </motion.div>
        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-8 grid gap-3 rounded-2xl border border-gray-200/80 bg-white/90 p-3 shadow-sm sm:grid-cols-3"
        >
          <p className="rounded-xl bg-gray-50/80 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">
            No hidden platform fees
          </p>
          <p className="rounded-xl bg-gray-50/80 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">
            Upgrade whenever growth demands
          </p>
          <p className="rounded-xl bg-gray-50/80 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">
            Built for seller confidence
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-3 lg:items-stretch"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {SUBSCRIPTION_PLANS.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeSlideUp}
              className={p.featured ? "lg:-mt-1 lg:mb-1" : ""}
            >
              <Card
                hover
                className={`relative flex h-full flex-col ${
                  p.featured
                    ? "border-2 border-secondary bg-gradient-to-b from-white to-secondary/[0.02] shadow-soft-lg ring-2 ring-secondary/15"
                    : "border-gray-100"
                }`}
              >
                {p.featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-soft">
                    Most chosen
                  </span>
                ) : null}
                <div className="mb-6 text-center lg:text-left">
                  <h3 className="text-lg font-semibold text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.blurb}</p>
                  <p className="mt-4 flex items-baseline justify-center gap-1 lg:justify-start">
                    <span className="text-sm font-medium text-muted">PKR</span>
                    <span className="text-4xl font-bold tracking-tight text-ink">
                      {p.pricePkr.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted">/mo</span>
                  </p>
                </div>
                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <LinkButton
                  href="/signup"
                  variant={p.featured ? "primary" : "ghost"}
                  className="w-full !py-3"
                >
                  {p.cta}
                </LinkButton>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
