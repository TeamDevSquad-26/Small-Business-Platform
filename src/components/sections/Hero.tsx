"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

type HeroProps = {
  onViewDemo: () => void;
};

export function Hero({ onViewDemo }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-gray-100 mesh-hero px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 grid-pattern opacity-50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-secondary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <motion.div
        className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-7 text-center lg:text-left">
          <motion.p
            variants={fadeSlideUp}
            className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondary shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Small Business Platform
          </motion.p>
          <motion.h1
            variants={fadeSlideUp}
            className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]"
          >
            Start Your Online Shop in Minutes
          </motion.h1>
          <motion.p
            variants={fadeSlideUp}
            className="mx-auto max-w-xl text-lg leading-relaxed text-muted lg:mx-0"
          >
            Launch your storefront, manage products and orders, and give
            customers a smooth checkout — all from one clean dashboard. No code
            required.
          </motion.p>
          <motion.div
            variants={fadeSlideUp}
            className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <LinkButton
              href="/signup"
              variant="primary"
              className="gap-2 !px-7 !py-3.5 text-base shadow-soft-lg"
            >
              Create Shop
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LinkButton>
            <Button
              variant="ghost"
              className="gap-2 !border-gray-200 !bg-white/90 !px-7 !py-3.5 text-base shadow-soft backdrop-blur-sm"
              onClick={onViewDemo}
            >
              <Play className="h-4 w-4 text-accent" aria-hidden />
              View Demo
            </Button>
          </motion.div>
          <motion.p variants={fadeSlideUp} className="text-center text-sm lg:text-left">
            <Link
              href="/shops"
              className="font-medium text-secondary underline-offset-4 hover:underline"
            >
              Browse existing shops
            </Link>
          </motion.p>
        </div>

        <motion.div
          variants={fadeSlideUp}
          className="relative mx-auto w-full max-w-lg lg:mx-0"
        >
          <p className="sr-only">Illustration placeholder</p>
          <div
            className="group relative aspect-[4/3] rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/90 p-1 shadow-soft-lg ring-1 ring-gray-100"
            role="img"
            aria-label="Illustration placeholder: product dashboard preview"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[0.875rem] rounded-b-xl bg-white">
              <div className="flex gap-2 border-b border-gray-100 bg-background/80 px-6 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
              </div>
              <div className="flex flex-1 gap-3 p-4">
                <div className="w-[26%] rounded-xl bg-gray-50 shadow-inner ring-1 ring-gray-100/80" />
                <div className="flex flex-1 flex-col gap-2.5">
                  <div className="h-[42%] rounded-xl bg-gradient-to-br from-secondary/20 via-primary/5 to-transparent shadow-soft ring-1 ring-secondary/10" />
                  <div className="h-[28%] rounded-xl bg-white shadow-soft ring-1 ring-gray-100" />
                  <div className="mt-auto h-11 rounded-xl bg-gradient-to-r from-accent/20 to-accent/5" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-muted lg:text-right">
            Illustration placeholder
          </p>
          <motion.div
            className="absolute -right-1 top-8 rounded-2xl border border-gray-100 bg-surface px-3 py-2 text-sm font-medium text-ink shadow-soft-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <span className="text-secondary">●</span> Live orders
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
