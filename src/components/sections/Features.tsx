"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Bot, ImageIcon, MessageCircle } from "lucide-react";
import { SectionQuote } from "@/components/ui/SectionQuote";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const aiFeatures = [
  {
    title: "Smart product copy & tags from photo + title",
    desc: "Upload an image and a working title — Karobaar drafts product descriptions and suggested tags you can edit before publish. Less typing, faster catalogs, no copywriter on payroll.",
    icon: ImageIcon,
    tag: "Listings",
  },
  {
    title: "Shop FAQ bot — Urdu & Roman Urdu",
    desc: "Grounded in your policies, delivery zones, and payment options. Buyers get answers in the language they message in, while you field fewer repeat questions in DMs.",
    icon: Bot,
    tag: "Support",
  },
  {
    title: "WhatsApp-ready order drafts",
    desc: "Turn carts and order updates into clean Urdu or Roman Urdu messages you can paste into WhatsApp — confirmations, payment nudges, and dispatch lines tuned for Pakistan buyers.",
    icon: MessageCircle,
    tag: "Orders",
  },
];

const comparisonPoints = [
  {
    label: "Instagram / status-only selling",
    pain: "No real catalog, messy pricing threads, easy to lose orders.",
  },
  {
    label: "Heavy global store builders",
    pain: "Lots of setup; weak defaults for WhatsApp-first, local payment flows.",
  },
  {
    label: "Karobaar",
    pain: "One shareable shop link plus AI that fits bio-link habits and Urdu / Roman Urdu chat.",
    highlight: true,
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-orange-100/80 bg-gradient-to-b from-orange-50/30 via-white to-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-14"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600"
          >
            Why Karobaar
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-4 font-heading text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl"
          >
            AI-assisted selling for{" "}
            <span className="text-orange-600">Pakistan-style commerce</span>
          </motion.h2>
          <motion.p
            variants={fadeSlideUp}
            className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base"
          >
            Generic tools assume Western checkout flows and English-only buyers. Karobaar pairs a simple storefront
            with helpers built around{" "}
            <strong className="font-semibold text-stone-800">bio links</strong>,{" "}
            <strong className="font-semibold text-stone-800">Urdu / Roman Urdu</strong>, and{" "}
            <strong className="font-semibold text-stone-800">WhatsApp-heavy orders</strong>
            — so you explain less, sell faster, and look more professional than spreadsheets or endless threads.
          </motion.p>
          <SectionQuote
            quote="Three AI touches—listings, FAQs, and WhatsApp drafts—designed to shrink busywork, not replace your judgment."
            className="mt-6 [&_p]:text-stone-600 [&_span]:text-orange-600"
          />
        </motion.div>

        <motion.div
          className="grid gap-5 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {aiFeatures.map(({ title, desc, icon: Icon, tag }) => (
            <motion.article
              key={title}
              variants={fadeSlideUp}
              className="flex h-full flex-col rounded-2xl border border-orange-100 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(234,88,12,0.12)] transition-shadow duration-200 hover:border-orange-200 hover:shadow-[0_16px_44px_-22px_rgba(234,88,12,0.18)] sm:p-7"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 ring-1 ring-orange-100">
                  {tag}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Icon className="h-5 w-5" strokeWidth={1.85} aria-hidden />
                </div>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-stone-900">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{desc}</p>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-stone-400">
                You stay in control — edit every AI suggestion before it goes live.
              </p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-14 rounded-2xl border border-stone-200 bg-stone-50/50 px-5 py-8 sm:mt-16 sm:px-8 sm:py-10"
        >
          <p className="text-center font-heading text-xl font-semibold text-stone-900 sm:text-2xl">
            Karobaar vs “just another platform”
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-stone-600">
            Same link-in-bio motion you already use — with structure for buyers and AI that matches how Pakistan shops
            actually close deals.
          </p>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-4 sm:gap-5">
            {comparisonPoints.map(({ label, pain, highlight }) => (
              <li
                key={label}
                className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-4 ${
                  highlight
                    ? "border-orange-200 bg-white shadow-[0_8px_28px_-14px_rgba(234,88,12,0.15)] ring-1 ring-orange-100"
                    : "border-stone-200/80 bg-white"
                }`}
              >
                <p className={`text-sm font-semibold ${highlight ? "text-orange-700" : "text-stone-800"}`}>
                  {label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{pain}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
