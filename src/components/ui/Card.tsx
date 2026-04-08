"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

export type CardProps = HTMLMotionProps<"div"> & {
  className?: string;
  hover?: boolean;
};

export function Card({
  className,
  children,
  hover = true,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={false}
      whileHover={
        hover
          ? { scale: 1.02, boxShadow: "0 12px 40px -8px rgba(17, 24, 39, 0.12)" }
          : undefined
      }
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "rounded-2xl border border-gray-100 bg-surface p-6 shadow-soft",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
