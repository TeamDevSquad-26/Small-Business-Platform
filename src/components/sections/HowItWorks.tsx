"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, Store, Boxes, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const steps = [
  {
    n: 1,
    title: "Sign Up",
    desc: "Create your account with quick onboarding and secure sign-in.",
    icon: UserPlus,
  },
  {
    n: 2,
    title: "Create Shop",
    desc: "Set your store name, theme, and policies in a few clicks.",
    icon: Store,
  },
  {
    n: 3,
    title: "Add Products",
    desc: "Build your catalog with photos, pricing, and inventory.",
    icon: Boxes,
  },
  {
    n: 4,
    title: "Start Selling",
    desc: "Share your link and start receiving orders and payments.",
    icon: TrendingUp,
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-gray-100 bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
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
            How it works
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Four steps to go live
          </motion.h2>
          <motion.p
            variants={fadeSlideUp}
            className="mx-auto mt-3 max-w-2xl text-muted"
          >
            Four simple steps — then focus on selling.
          </motion.p>
        </motion.div>

        <div className="relative">
          <div
            className="pointer-events-none absolute left-4 right-4 top-[2.25rem] hidden h-px bg-gradient-to-r from-transparent via-secondary/25 to-transparent lg:block lg:left-8 lg:right-8"
            aria-hidden
          />
          <motion.ol
            className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {steps.map((s) => (
              <motion.li key={s.n} variants={fadeSlideUp} className="list-none">
                <Card className="relative flex h-full flex-col gap-3 border-gray-100/80 bg-surface pt-10 shadow-soft transition-shadow hover:shadow-soft-lg">
                  <span className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-white shadow-sm">
                    {s.n}
                  </span>
                  <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <s.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{s.desc}</p>
                </Card>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
