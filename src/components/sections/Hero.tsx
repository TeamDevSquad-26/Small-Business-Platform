"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

/** Bold portrait — yellow backdrop + laptop (Bangun Stock / Unsplash); strong accent with orange frame */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1649767428212-7590dbf20116?auto=format&fit=crop&w=1800&q=90";

/** Top-left + bottom-right: large radii ≈ quarter-circle arcs on the frame */
const quarterFrame =
  "overflow-hidden rounded-tl-[min(30vw,5.25rem)] rounded-br-[min(30vw,5.25rem)] sm:rounded-tl-[min(24vw,6.25rem)] sm:rounded-br-[min(24vw,6.25rem)] lg:rounded-tl-[7.5rem] lg:rounded-br-[7.5rem]";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-orange-100/80 bg-white px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
      <motion.div
        className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-5 text-center lg:text-left">
          <motion.h1
            variants={fadeSlideUp}
            className="mx-auto max-w-[17rem] font-heading text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-stone-900 sm:max-w-xl sm:text-5xl lg:mx-0"
          >
            <span className="relative">
              <span className="font-semibold text-stone-900">Start an online store</span>{" "}
              <span className="relative z-0 inline-block whitespace-nowrap">
                <span className="relative z-10 font-semibold text-orange-600">for free</span>
                <span
                  className="absolute -bottom-1 left-0 right-0 -z-0 h-3 rounded-sm bg-orange-200/70 sm:h-3.5"
                  aria-hidden
                />
              </span>
            </span>
          </motion.h1>
          <motion.p
            variants={fadeSlideUp}
            className="mx-auto max-w-[19.5rem] text-lg leading-relaxed text-stone-600 sm:max-w-xl sm:text-base lg:mx-0"
          >
            Karobaar is the all-in-one platform to build, run, and grow your online boutique. Launch fast and
            start selling with confidence.
          </motion.p>
        </div>

        <motion.div
          variants={fadeSlideUp}
          className="relative mx-auto flex w-full max-w-[21rem] justify-center sm:max-w-[26rem] lg:mx-0 lg:max-w-[min(460px,44vw)] lg:justify-end"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[min(125%,24rem)] w-[min(135%,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/25 blur-[52px] sm:h-[30rem] sm:w-[32rem] lg:h-[34rem] lg:w-[36rem]"
            aria-hidden
          />

          <div
            className={`relative isolate bg-white shadow-[0_28px_75px_-28px_rgba(234,88,12,0.48)] ${quarterFrame} border-[6px] border-orange-500`}
          >
            <div className="relative aspect-[5/6] w-full sm:aspect-[4/5]">
              <Image
                src={HERO_IMAGE}
                alt="Entrepreneur growing her online business — confident, modern Karobaar vibe"
                fill
                priority
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 420px, (max-width: 1280px) 460px, 480px"
                className="object-cover object-[center_35%] sm:object-[center_30%]"
              />
              <div
                className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-tr from-orange-500/[0.07] via-transparent to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[28%] bg-gradient-to-t from-white/55 via-white/15 to-transparent sm:h-[22%]"
                aria-hidden
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
