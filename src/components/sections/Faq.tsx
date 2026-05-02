"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "How does Karobaar charge shops?",
    a: "You sell through your Karobaar shop—that is what the platform is for. We do not publish a public pricing table on the website right now. Karobaar earns on a per-shop, per-month basis, aligned with each shop’s sales and activity (we look at how the shop is performing). The exact fee structure is explained during onboarding or when you speak with our team.",
  },
  {
    q: "How do customers pay?",
    a: "Each shop configures options that work in Pakistan—for example JazzCash or EasyPaisa references, bank transfer, or COD instructions. Buyers see clear steps at checkout so every order does not get stuck in endless DMs.",
  },
  {
    q: "Who handles refunds or disputes?",
    a: "Each vendor sets their own policies. Karobaar helps you present orders and checkout clearly. For refunds or exchanges, buyers and sellers follow that shop’s terms—we recommend publishing them on your storefront.",
  },
  {
    q: "Do I need my own website or coding skills?",
    a: "No. You get one shareable Karobaar link for your shop. Paste it in your bio, status, or chats—customers open it like any normal webpage and can order from there.",
  },
  {
    q: "What is the difference between vendor and customer sign-up?",
    a: "A vendor account lets you create a shop, list products, and manage orders. A customer account is for buyers who browse shops and place orders. Both roles exist so selling and buying stay separate and simple.",
  },
  {
    q: "Who owns my shop and product content?",
    a: "Your branding, product descriptions, and what you upload are part of your listing. Karobaar hosts your shop and provides the tools. Full commercial terms are described in onboarding materials and policy documents.",
  },
];

export function Faq() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-orange-100/90 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div ref={ref} className="mx-auto max-w-3xl lg:max-w-[42rem]">
        <motion.div
          className="mb-14 text-center sm:mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600"
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-4 font-heading text-3xl font-semibold tracking-tight text-stone-900 sm:text-[2.125rem]"
          >
            Frequently asked questions
          </motion.h2>
          <motion.div
            variants={fadeSlideUp}
            className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 sm:w-16"
            aria-hidden
          />
          <motion.p
            variants={fadeSlideUp}
            className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-stone-600 sm:text-[15px]"
          >
            Quick answers about selling on Karobaar, payments, accounts, and your shop data.
          </motion.p>
        </motion.div>

        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {faqs.map((item) => (
            <motion.div key={item.q} variants={fadeSlideUp}>
              <details className="group overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-[border-color,box-shadow] duration-200 hover:border-orange-200 hover:shadow-[0_12px_36px_-16px_rgba(234,88,12,0.14)] open:border-orange-200 open:shadow-[0_14px_44px_-18px_rgba(234,88,12,0.18)] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5">
                  <span className="pt-0.5 text-[15px] font-semibold leading-snug text-stone-900 sm:text-base">
                    {item.q}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors duration-200 group-open:bg-orange-100 group-open:text-orange-700">
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </span>
                </summary>
                <div className="border-t border-orange-50/90 bg-gradient-to-b from-orange-50/25 to-white px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                  <p className="text-sm leading-[1.7] text-stone-600">{item.a}</p>
                </div>
              </details>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
