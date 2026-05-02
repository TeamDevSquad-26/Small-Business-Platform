"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { fadeSlideUp } from "@/lib/motion";

type SectionQuoteProps = {
  /** Line shown inside typographic quotes — keep it one sharp sentence. */
  quote: string;
  className?: string;
};

export function SectionQuote({ quote, className }: SectionQuoteProps) {
  return (
    <motion.blockquote
      variants={fadeSlideUp}
      className={cn(
        "mx-auto mt-5 max-w-[34rem] px-2 text-center sm:px-4",
        className
      )}
    >
      <p className="font-heading text-lg italic leading-relaxed text-ink/90 sm:text-xl">
        <span className="text-secondary" aria-hidden>
          “
        </span>
        {quote}
        <span className="text-secondary" aria-hidden>
          ”
        </span>
      </p>
    </motion.blockquote>
  );
}
