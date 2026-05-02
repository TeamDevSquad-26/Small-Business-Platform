"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Link2, Store, UserPlus, Boxes } from "lucide-react";
import { SectionQuote } from "@/components/ui/SectionQuote";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const steps = [
  {
    n: 1,
    title: "Create your vendor account",
    desc: "Sign up on Karobaar as a vendor. Once your email is verified, your seller dashboard is ready—no long forms.",
    icon: UserPlus,
  },
  {
    n: 2,
    title: "Create & set up your shop",
    desc: "Add your shop name, short description, and the basics shoppers need. That becomes your public storefront identity.",
    icon: Store,
  },
  {
    n: 3,
    title: "Add your products",
    desc: "Upload photos, set prices, and stock for each item. The clearer your catalog, the easier it is for buyers to order.",
    icon: Boxes,
  },
  {
    n: 4,
    title: "Share your link & sell",
    desc: "Copy your shop link and share it everywhere—bio, WhatsApp status, groups. Track orders in one place with fewer messy DMs.",
    icon: Link2,
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-orange-100/90 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-14"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.div variants={fadeSlideUp} className="flex justify-center">
            <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 ring-1 ring-orange-100">
              How to create your shop
            </span>
          </motion.div>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-5 font-heading text-[1.65rem] font-semibold leading-tight tracking-tight text-stone-900 sm:text-3xl lg:text-[2rem]"
          >
            Your Karobaar shop in{" "}
            <span className="text-orange-600">four simple steps</span>
          </motion.h2>
          <SectionQuote
            quote="Go live with your shop, add products, then share one link everywhere—buyers land straight on your Karobaar storefront."
            className="mt-5 [&_p]:text-stone-600 [&_span]:text-orange-600"
          />
        </motion.div>

        <div className="relative">
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-[2.75rem] hidden h-[2px] bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 lg:block"
            aria-hidden
          />

          <motion.ol
            className="relative grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {steps.map((s) => (
              <motion.li key={s.n} variants={fadeSlideUp} className="relative list-none">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-gradient-to-b from-white to-stone-50/40 p-6 pt-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_16px_40px_-20px_rgba(234,88,12,0.18)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 opacity-70 transition-opacity group-hover:opacity-100" />
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white shadow-[0_6px_14px_-4px_rgba(234,88,12,0.55)] ring-4 ring-white">
                      {s.n}
                    </span>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                      <s.icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.85} aria-hidden />
                    </div>
                  </div>
                  <h3 className="text-[1.05rem] font-semibold leading-snug text-stone-900">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{s.desc}</p>
                </article>
              </motion.li>
            ))}
          </motion.ol>
        </div>

        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-12 flex justify-center sm:mt-14"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50/50 px-6 py-5 text-center sm:flex-row sm:gap-4 sm:py-4">
            <p className="text-sm text-stone-700">Ready to start? Create a vendor account in minutes.</p>
            <Link
              href="/signup?role=vendor"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(234,88,12,0.55)] transition hover:bg-orange-700"
            >
              Sign up as a vendor
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
