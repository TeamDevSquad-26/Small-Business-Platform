"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type StatCardProps = HTMLMotionProps<"div"> & {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "default" | "green" | "amber" | "indigo";
};

const accentMap = {
  default: "bg-gray-100 text-ink",
  green: "bg-secondary/10 text-secondary",
  amber: "bg-accent/15 text-amber-700",
  indigo: "bg-primary/10 text-primary",
};

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  accent = "default",
  className,
  ...props
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 12px 40px -8px rgba(17, 24, 39, 0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "rounded-2xl border border-gray-100 bg-surface p-5 shadow-soft",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accentMap[accent]
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  );
}
