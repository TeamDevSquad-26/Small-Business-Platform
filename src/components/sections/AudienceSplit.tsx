"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Share2, ShoppingBag, Store } from "lucide-react";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import { SectionQuote } from "@/components/ui/SectionQuote";
import { cn } from "@/lib/cn";

export function AudienceSplit() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12), transparent)",
        }}
        aria-hidden
      />
      <div ref={ref} className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-12 text-center sm:mb-14"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.p
            variants={fadeSlideUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary"
          >
            Built for both sides
          </motion.p>
          <motion.h2
            variants={fadeSlideUp}
            className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            Vendors sell. Customers buy.
          </motion.h2>
          <SectionQuote quote="Your shop lives in one link — meet buyers where they already post, scroll, and chat." />
        </motion.div>

        <motion.div
          className="grid gap-6 lg:grid-cols-2 lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.article
            variants={fadeSlideUp}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200/90 bg-surface p-8 shadow-soft",
              "transition-shadow duration-300 hover:shadow-soft-lg"
            )}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/12 text-secondary ring-1 ring-secondary/15">
              <Store className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">
              Shop owners & small brands
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              Create your storefront, add products, connect social profiles, and put your
              Karobaar link everywhere customers already find you.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink/90">
              <li className="flex items-center gap-2">
                <Share2 className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                Share one shop link on socials & status
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                Manage catalog & orders in one dashboard
              </li>
            </ul>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-secondary/80"
            >
              Start your shop
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.article>

          <motion.article
            variants={fadeSlideUp}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200/90 bg-surface p-8 shadow-soft",
              "transition-shadow duration-300 hover:shadow-soft-lg"
            )}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">
              Shoppers & supporters
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
              Browse real local shops, see products clearly, and place orders in a few
              steps no random bank screenshots in DMs.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink/90">
              <li className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                Explore vendors & product photos
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                Checkout with clear order details
              </li>
            </ul>
            <Link
              href="/shops"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Browse shops
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
