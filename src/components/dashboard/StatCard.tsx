"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type StatCardProps = HTMLMotionProps<"div"> & {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "default" | "green" | "amber" | "indigo" | "orange";
};

const accentMap = {
  default: "bg-stone-100 text-stone-800",
  green: "bg-emerald-500/12 text-emerald-800",
  amber: "bg-amber-500/15 text-amber-800",
  indigo: "bg-violet-500/12 text-violet-800",
  orange: "bg-orange-500/12 text-orange-700",
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
        "rounded-2xl border border-orange-100/60 bg-white p-5 shadow-[0_4px_24px_-4px_rgba(234,88,12,0.06),0_2px_8px_-2px_rgba(28,25,23,0.04)]",
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
