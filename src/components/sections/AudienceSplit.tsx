"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

export function AudienceSplit() {
  const introRef = useRef(null);
  const introInView = useInView(introRef, { once: true, margin: "-8%" });

  return (
    <section id="about" className="scroll-mt-20 bg-white px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
      <div ref={introRef} className="mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          className="text-left"
        >
          <motion.h2
            variants={fadeSlideUp}
            className="max-w-3xl text-balance font-heading text-2xl font-bold leading-snug tracking-tight text-stone-900 sm:text-3xl lg:text-[2rem]"
          >
            Revolutionize Your Journey with{" "}
            <span className="text-orange-600">Karobaar</span>
          </motion.h2>

          <motion.div
            variants={fadeSlideUp}
            className="mt-6 flex flex-col gap-8 sm:mt-7 lg:flex-row lg:items-end lg:gap-10 xl:gap-14"
          >
            <div className="flex shrink-0 justify-start sm:pl-2 lg:pl-4">
              <Image
                src="/karobaar-journey.png"
                alt="Illustration of selling online with Karobaar"
                width={960}
                height={960}
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 320px, 380px"
                className="h-auto w-full max-w-[15rem] object-contain drop-shadow-[0_16px_40px_-16px_rgba(234,88,12,0.18)] sm:max-w-[17rem] lg:max-w-[19rem]"
                priority
              />
            </div>

            <div className="min-w-0 flex-1 lg:max-w-xl lg:pb-1">
              <p className="text-base leading-relaxed text-stone-600 sm:text-[17px]">
                <span className="font-semibold text-stone-800">Karobaar.pk</span> is built for founders,
                boutiques, and home-based sellers who already move volume on social media but want catalog,
                pricing, and orders in one place—without the back-and-forth. Launch your{" "}
                <span className="font-medium text-stone-700">digital shop</span> in minutes, share the same
                link on your bio, WhatsApp, and stories, and give buyers a checkout flow that is clear and
                trustworthy—no coding, no clutter.
              </p>
            </div>
          </motion.div>

          <motion.blockquote
            variants={fadeSlideUp}
            className="mx-auto mt-10 max-w-2xl px-2 text-center sm:mt-12 sm:px-4"
          >
            <p className="font-heading text-lg italic leading-relaxed text-stone-800 sm:text-xl">
              <span
                className="mr-0.5 font-semibold not-italic text-orange-500 sm:mr-1"
                aria-hidden
              >
                “
              </span>
              One storefront, one link—built so sellers stay focused and buyers know exactly how to order
              with Karobaar.
              <span
                className="ml-0.5 font-semibold not-italic text-orange-500 sm:ml-1"
                aria-hidden
              >
                ”
              </span>
            </p>
          </motion.blockquote>
        </motion.div>
      </div>
    </section>
  );
}
