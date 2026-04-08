"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent";

export type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-secondary text-white shadow-soft hover:shadow-soft-lg border border-transparent",
  secondary:
    "bg-secondary text-white shadow-soft hover:shadow-soft-lg border border-transparent",
  accent:
    "bg-accent text-ink shadow-soft hover:shadow-soft-lg border border-transparent",
  ghost:
    "bg-transparent text-ink border border-gray-200 hover:border-gray-300 hover:bg-white/80",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold",
          "transition-shadow duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
