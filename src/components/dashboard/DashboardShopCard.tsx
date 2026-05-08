"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Store } from "lucide-react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseDb } from "@/lib/firebase/client";

type ShopPreview = {
  shopId: string;
  shopName: string;
  city: string;
  category: string;
  logoUrl: string;
  coverUrl: string;
};

export function DashboardShopCard() {
  const { user, isReady, isFirebaseConfigured } = useAuth();
  const [shop, setShop] = useState<ShopPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !user?.uid || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    if (!db) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const q = query(
          collection(db, "shops"),
          where("ownerId", "==", user.uid),
          limit(1)
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const doc0 = snap.docs[0];
        if (!doc0) {
          setShop(null);
          return;
        }
        const d = doc0.data();
        setShop({
          shopId: doc0.id,
          shopName: typeof d.shopName === "string" ? d.shopName : "",
          city: typeof d.city === "string" ? d.city : "",
          category: typeof d.category === "string" ? d.category : "",
          logoUrl: typeof d.logoUrl === "string" ? d.logoUrl : "",
          coverUrl: typeof d.coverUrl === "string" ? d.coverUrl : "",
        });
      } catch {
        if (!cancelled) setShop(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.uid, isFirebaseConfigured]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-orange-100/80 bg-white shadow-[0_12px_40px_-12px_rgba(234,88,12,0.1)]">
        <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" aria-hidden />
        <div className="flex animate-pulse flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-orange-100/60" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 max-w-full rounded-lg bg-stone-100" />
            <div className="h-4 w-32 rounded bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="overflow-hidden rounded-3xl border-2 border-dashed border-orange-200/90 bg-gradient-to-br from-orange-50/80 to-white px-6 py-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
          <Store className="h-6 w-6" aria-hidden />
        </div>
        <p className="font-heading text-base font-semibold text-stone-900">Abhi tak koi shop nahi bani</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
          Ek dafa shop create karo — phir yahan cover, logo, aur public link dikhe ga.
        </p>
        <Link
          href="/dashboard/create-shop"
          className="mt-5 inline-flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(234,88,12,0.45)] transition hover:bg-orange-700"
        >
          Shop create karo
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-orange-100/90 bg-white shadow-[0_20px_55px_-24px_rgba(234,88,12,0.18),0_8px_24px_-12px_rgba(28,25,23,0.06)]">
      <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" aria-hidden />
      <div className="relative h-44 w-full bg-gradient-to-br from-orange-100/90 to-amber-50/80 sm:h-48">
        {shop.coverUrl ? (
          <>
            <Image
              src={shop.coverUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority
              unoptimized
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/55 via-stone-900/10 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(234,88,12,0.18),transparent_55%)]" />
        )}
      </div>
      <div className="flex flex-col gap-4 px-5 pb-6 pt-0 sm:flex-row sm:items-end sm:pb-6">
        <div className="-mt-10 flex shrink-0 justify-center sm:justify-start">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-[5px] border-white bg-white shadow-[0_12px_32px_-8px_rgba(234,88,12,0.35)] ring-1 ring-orange-100 sm:h-[7.25rem] sm:w-[7.25rem]">
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                alt=""
                fill
                className="object-contain p-1.5"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-orange-50 text-xs font-medium text-orange-700/80">
                Logo
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
          <h2 className="truncate font-heading text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
            {shop.shopName || "Your shop"}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            {[shop.city, shop.category].filter(Boolean).join(" · ") || "Details add karo"}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Link
              href={`/shops/${shop.shopId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Storefront dekho
            </Link>
            <Link
              href="/dashboard/shop"
              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-orange-800 transition hover:border-orange-300 hover:bg-orange-50"
            >
              <Store className="h-3.5 w-3.5" aria-hidden />
              Shop admin
            </Link>
            <Link
              href="/dashboard/create-shop"
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium text-stone-600 transition hover:text-stone-900"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
