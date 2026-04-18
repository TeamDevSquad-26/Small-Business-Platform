"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, ShieldCheck, Smartphone } from "lucide-react";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const items = [
  {
    title: "Pakistan-first",
    desc: "Built around how people actually pay and message here.",
    icon: MapPin,
  },
  {
    title: "Mobile-ready",
    desc: "Your shop link opens fast on phones where your buyers are.",
    icon: Smartphone,
  },
  {
    title: "Clear checkout",
    desc: "Orders with delivery and payment details less back-and-forth.",
    icon: ShieldCheck,
  },
];

export function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      className="border-b border-gray-100 bg-surface px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
      aria-label="Why Karobaar"
    >
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          className="grid gap-8 sm:grid-cols-3 sm:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {items.map(({ title, desc, icon: Icon }) => (
            <motion.div
              key={title}
              variants={fadeSlideUp}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary ring-1 ring-secondary/15">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="font-heading text-lg font-semibold text-ink">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
