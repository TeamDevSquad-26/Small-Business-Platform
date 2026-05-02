"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Handshake, Headphones, Sparkles } from "lucide-react";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const supportItems = [
  {
    title: "24/7 support",
    desc: "Get help whenever you need guidance.",
    icon: Headphones,
  },
  {
    title: "Free apps",
    desc: "Expand your workflow with built-in tools.",
    icon: Sparkles,
  },
  {
    title: "Online courses",
    desc: "Learn faster with practical playbooks.",
    icon: BookOpen,
  },
  {
    title: "Shopify Partners",
    desc: "Work with trusted experts to scale.",
    icon: Handshake,
  },
];

export function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      className="border-b border-gray-100 bg-surface px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
      aria-label="Commerce overview"
    >
      <div ref={ref} className="mx-auto max-w-4xl">
        <motion.div
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-sm font-medium text-ink"
          >
            The global platform for commerce
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-10 grid gap-3 sm:grid-cols-2"
        >
          <div className="rounded-none border border-gray-200 bg-[#f3f3f3] px-4 py-3">
            <p className="text-sm font-semibold text-ink">$1+ trillion</p>
          </div>
          <div className="rounded-none border border-gray-200 bg-[#f3f3f3] px-4 py-3">
            <p className="text-sm font-semibold text-ink">175+ countries</p>
          </div>
        </motion.div>

        <motion.div
          className="mb-4"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p variants={fadeSlideUp} className="text-sm font-medium text-ink">
            Build with help by your side
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-3 sm:grid-cols-4 sm:gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {supportItems.map(({ title, desc, icon: Icon }) => (
            <motion.div
              key={title}
              variants={fadeSlideUp}
              className="border-t border-gray-200 pt-3"
            >
              <div className="mb-2 inline-flex h-6 w-6 items-center justify-center text-muted">
                <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              </div>
              <p className="text-xs font-semibold text-ink">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
