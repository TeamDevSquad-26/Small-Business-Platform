"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Card } from "@/components/ui/Card";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const plans = [
  {
    name: "Basic",
    price: "1,999",
    blurb: "Great for new sellers",
    features: ["1 store", "50 products", "Email support"],
    cta: "Choose Basic",
    featured: false,
    variant: "ghost" as const,
  },
  {
    name: "Standard",
    price: "3,999",
    blurb: "Best value for growing shops",
    features: [
      "Custom domain",
      "Unlimited products",
      "Analytics & tracking",
      "Priority support",
    ],
    cta: "Choose Standard",
    featured: true,
    variant: "primary" as const,
  },
  {
    name: "Premium",
    price: "7,999",
    blurb: "For teams and scale",
    features: [
      "Multi-staff",
      "API access",
      "Advanced automation",
      "Dedicated manager",
    ],
    cta: "Choose Premium",
    featured: false,
    variant: "ghost" as const,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="pricing" className="scroll-mt-20 bg-surface px-4 py-20 sm:px-6 lg:px-8">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          className="mb-14 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-sm font-semibold uppercase tracking-wider text-secondary"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Simple, transparent plans
          </motion.h2>
          <motion.p
            variants={fadeSlideUp}
            className="mx-auto mt-3 max-w-2xl text-muted"
          >
            Clear plans — Standard recommended for most shops.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-3 lg:items-stretch"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {plans.map((p) => (
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
                    Recommended
                  </span>
                ) : null}
                <div className="mb-6 text-center lg:text-left">
                  <h3 className="text-lg font-semibold text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.blurb}</p>
                  <p className="mt-4 flex items-baseline justify-center gap-1 lg:justify-start">
                    <span className="text-sm font-medium text-muted">Rs</span>
                    <span className="text-4xl font-bold tracking-tight text-ink">
                      {p.price}
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
                  variant={p.variant}
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
