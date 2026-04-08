"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const items = [
  {
    title: "Easy Shop Setup",
    desc: "Go live fast with branding, categories, and a polished storefront.",
    icon: LayoutDashboard,
  },
  {
    title: "Product Management",
    desc: "Organize images, variants, and inventory in one scalable catalog.",
    icon: Package,
  },
  {
    title: "Order Tracking",
    desc: "See every order status clearly and keep customers in the loop.",
    icon: ClipboardList,
  },
  {
    title: "Subscription Plans",
    desc: "Upgrade as you grow — from Basic to Premium when you need more.",
    icon: CreditCard,
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="features" className="scroll-mt-20 bg-surface px-4 py-20 sm:px-6 lg:px-8">
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
            Features
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Everything to run your shop
          </motion.h2>
          <motion.p
            variants={fadeSlideUp}
            className="mx-auto mt-3 max-w-2xl text-muted"
          >
            Everything small businesses need — simple UI, sensible defaults.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {items.map(({ title, desc, icon: Icon }) => (
            <motion.div key={title} variants={fadeSlideUp}>
              <Card className="group flex h-full flex-col gap-4 border-gray-100/50 bg-gradient-to-b from-white to-gray-50/40">
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
