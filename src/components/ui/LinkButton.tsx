"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary" | "ghost" | "accent";

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

export type LinkButtonProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: LinkButtonProps) {
  return (
    <MotionLink
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold",
        "transition-shadow duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
        variants[variant],
        className
      )}
    >
      {children}
    </MotionLink>
  );
}
