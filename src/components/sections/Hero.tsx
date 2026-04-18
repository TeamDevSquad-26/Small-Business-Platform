"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  Globe2,
  Radio,
  ArrowRight,
  Play,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import type { HeroLiveItem } from "@/types/heroLiveFeed";

type HeroProps = {
  onViewDemo: () => void;
};

const FALLBACK_ACTIVITY = [
  { shopName: "Noor Boutique", productName: "Summer Lawn 3pc", totalPrice: 4200 },
  { shopName: "Urban Gadgets", productName: "Wireless Earbuds Pro", totalPrice: 5999 },
  { shopName: "Khan Perfumes", productName: "Oud Signature 50ml", totalPrice: 2850 },
];

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
  const [latestOrder, setLatestOrder] = useState<HeroLiveItem | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const loadLatest = useCallback(async () => {
    try {
      setIsFetching(true);
      const res = await fetch("/api/public/hero-live-feed", { cache: "no-store" });
      const data = (await res.json()) as { items?: HeroLiveItem[] };
      if (Array.isArray(data.items) && data.items.length > 0) {
        setLatestOrder(data.items[0] ?? null);
      }
    } catch {
      setLatestOrder(null);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    void loadLatest();
    const id = setInterval(() => void loadLatest(), 20_000);
    return () => clearInterval(id);
  }, [loadLatest]);

  useEffect(() => {
    if (latestOrder) return;
    const id = setInterval(() => {
      setFallbackIndex((prev) => (prev + 1) % FALLBACK_ACTIVITY.length);
    }, 5000);
    return () => clearInterval(id);
  }, [latestOrder]);

  const activity = latestOrder
    ? {
        line1: `${latestOrder.shopName}: ${latestOrder.productName}`,
        line2: `Rs ${latestOrder.totalPrice.toLocaleString("en-PK")} · ${timeAgo(latestOrder.createdAt)}`,
        line3: `${latestOrder.shopName} sold ${latestOrder.productName}`,
      }
    : {
        line1: `${FALLBACK_ACTIVITY[fallbackIndex]?.shopName}: ${FALLBACK_ACTIVITY[fallbackIndex]?.productName}`,
        line2: `Rs ${FALLBACK_ACTIVITY[fallbackIndex]?.totalPrice.toLocaleString("en-PK")} · demo live feed`,
        line3: `${FALLBACK_ACTIVITY[fallbackIndex]?.shopName} sold ${FALLBACK_ACTIVITY[fallbackIndex]?.productName}`,
      };

  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-background px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 grid-pattern opacity-30"
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
        className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-7 text-center lg:text-left">
          <motion.p
            variants={fadeSlideUp}
            className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Marketplace for local businesses
          </motion.p>
          <motion.h1
            variants={fadeSlideUp}
            className="font-heading font-semibold tracking-tight text-ink"
          >
            <span className="block text-[2.3rem] leading-[1.08] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.07]">
              One link for your shop.
            </span>
            <span className="mt-2 block text-[1.9rem] leading-[1.1] text-secondary sm:text-[2.65rem] lg:text-[2.95rem]">
              Sell faster across Pakistan.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeSlideUp}
            className="mx-auto max-w-xl space-y-3 lg:mx-0"
          >
            <span className="block font-heading text-lg italic leading-relaxed text-muted sm:text-xl">
              “Jahan buyer scroll karta hai, wahan tumhari shop open hoti hai.”
            </span>
            <span className="block text-base leading-relaxed text-muted sm:text-lg">
              Create your shop, add products, and start taking clear orders from one
              clean storefront.
            </span>
          </motion.p>
          <motion.div
            variants={fadeSlideUp}
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start"
          >
            <LinkButton
              href="/signup"
              variant="primary"
              className="gap-2 !px-7 !py-3.5 text-base shadow-soft-lg"
            >
              Create your shop
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LinkButton>
            <LinkButton
              href="/shops"
              variant="ghost"
              className="gap-2 !border-gray-200 !bg-white/95 !px-7 !py-3.5 text-base shadow-soft backdrop-blur-sm"
            >
              Browse shops
            </LinkButton>
            <Button
              variant="ghost"
              className="gap-2 !border-transparent !bg-transparent !px-4 !py-3.5 text-base text-muted hover:!bg-gray-100/80"
              onClick={onViewDemo}
            >
              <Play className="h-4 w-4 text-accent" aria-hidden />
              How it works
            </Button>
          </motion.div>
          <motion.div
            variants={fadeSlideUp}
            className="mx-auto grid w-full max-w-xl gap-2.5 sm:grid-cols-3 lg:mx-0"
          >
            <div className="rounded-2xl border border-secondary/25 bg-white/95 px-3.5 py-3 shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden />
                Live signal
              </p>
              <p className="mt-1 truncate text-sm font-medium text-ink">
                {isFetching
                  ? "Syncing recent activity..."
                  : activity.line3}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/95 px-3.5 py-3 shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                <Clock3 className="h-3.5 w-3.5 text-secondary" aria-hidden />
                Fast setup
              </p>
              <p className="mt-1 text-sm font-medium text-ink">Go live in under 10 minutes</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/95 px-3.5 py-3 shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                <Globe2 className="h-3.5 w-3.5 text-secondary" aria-hidden />
                One link
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                Share on WhatsApp, Insta, TikTok
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeSlideUp}
          className="relative mx-auto w-full max-w-lg lg:mx-0"
        >
          <div className="relative">
            <div
              className="absolute right-0 top-5 hidden h-[79%] w-[90%] rounded-[1.75rem] border border-gray-200/90 bg-white shadow-soft-lg lg:block"
              aria-hidden
            >
              <div className="border-b border-gray-100 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary/70" />
                  <div className="ml-3 flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-muted">
                    <Search className="h-3 w-3" aria-hidden />
                    karobaar.pk/shops
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 p-3">
                <div className="col-span-2 h-20 rounded-xl bg-gradient-to-r from-secondary/30 via-secondary/15 to-primary/20" />
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-xl bg-gray-100" />
              </div>
              <div className="px-3 pb-3">
                <div className="rounded-xl border border-secondary/20 bg-secondary/[0.08] px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                    Live activity
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-ink">
                    {activity.line1}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {activity.line2}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="relative z-10 mx-auto max-w-[18rem] rounded-[2.3rem] border-[10px] border-gray-900 bg-gray-900 p-2 shadow-[0_30px_65px_-22px_rgba(17,24,39,0.5)] sm:max-w-[19rem] lg:ml-5 lg:mr-auto"
              role="img"
              aria-label="Shop preview on mobile"
            >
              <div className="mx-auto mb-2 h-1.5 w-20 rounded-full bg-gray-700" />
              <div className="overflow-hidden rounded-[1.6rem] bg-gray-50">
                <div className="border-b border-gray-100 bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 ring-1 ring-gray-100" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">Ib Fashion Hub</p>
                      <p className="text-xs text-muted">Dresses, abayas, pret</p>
                    </div>
                    <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-semibold text-secondary">
                      Live
                    </span>
                  </div>
                </div>
                <div className="space-y-3 p-3.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
                    >
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-gray-100" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-2.5 w-[70%] rounded bg-gray-200" />
                        <div className="h-2 w-12 rounded bg-secondary/30" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 bg-white px-3.5 py-3.5">
                  <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-soft">
                    <span>Checkout</span>
                    <ShoppingBag className="h-4 w-4" aria-hidden />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 p-3 shadow-soft">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" aria-hidden />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" aria-hidden />
              <div className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-muted">
                <span className="rounded-full bg-secondary/10 px-2 py-1 text-secondary">Live</span>
                <span>Recent orders</span>
                <span className="text-gray-300">•</span>
                <span className="truncate">
                  {`${activity.line3} for ${activity.line2.split(" · ")[0]}`}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs font-medium text-muted lg:text-right">
            Clean mobile-first storefront preview
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
