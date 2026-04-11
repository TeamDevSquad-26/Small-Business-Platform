"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Package, Play, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import type { HeroLiveItem } from "@/types/heroLiveFeed";

type HeroProps = {
  onViewDemo: () => void;
};

function timeAgo(iso: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 45) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function Hero({ onViewDemo }: HeroProps) {
  const [items, setItems] = useState<HeroLiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/public/hero-live-feed", { cache: "no-store" });
      const data = (await res.json()) as { items?: HeroLiveItem[] };
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 45_000);
    return () => clearInterval(id);
  }, [load]);

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
          <div
            className="group relative rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/90 p-1 shadow-soft-lg ring-1 ring-gray-100"
            role="region"
            aria-label="Live orders preview"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[0.875rem] bg-white">
              <div className="flex gap-2 border-b border-gray-100 bg-background/80 px-4 py-2.5 sm:px-5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
              </div>

              <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">Live orders</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                    <Radio className="h-3 w-3 animate-pulse" aria-hidden />
                    Live
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Product photos from real orders
                </p>
              </div>

              <div className="max-h-[min(22rem,52vh)] overflow-y-auto p-3 sm:p-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex animate-pulse gap-3 rounded-xl bg-gray-50 p-2"
                      >
                        <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-200" />
                        <div className="flex flex-1 flex-col justify-center gap-2">
                          <div className="h-3 w-3/4 rounded bg-gray-200" />
                          <div className="h-2.5 w-1/2 rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="space-y-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted/60" aria-hidden />
                    <p className="text-sm text-muted">
                      Jab orders aayenge, yahan un products ki photos dikhengi.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {items.map((row) => (
                      <li key={row.orderId}>
                        <div className="flex gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm transition-colors hover:bg-gray-50/80">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-100">
                            {row.imageUrl ? (
                              <Image
                                src={row.imageUrl}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="56px"
                                unoptimized={
                                  row.imageUrl.includes("localhost") ||
                                  !row.imageUrl.startsWith("https://")
                                }
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted">
                                <Package className="h-6 w-6" aria-hidden />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">
                              {row.productName}
                            </p>
                            <Link
                              href={`/shops/${row.shopId}`}
                              className="truncate text-xs text-secondary hover:underline"
                            >
                              {row.shopName}
                            </Link>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold tabular-nums text-ink">
                              Rs {row.totalPrice.toLocaleString("en-PK")}
                            </p>
                            <p className="text-[11px] text-muted">
                              {timeAgo(row.createdAt) || "—"}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-muted lg:text-right">
            {items.length > 0
              ? "Thumbnails from recent customer orders"
              : "Orders feed updates when your platform has sales"}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
