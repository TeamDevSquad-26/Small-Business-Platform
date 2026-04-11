"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-5 py-10 text-center text-sm text-muted">
        Loading your shop…
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center">
        <p className="text-sm text-muted">You haven’t created a shop yet.</p>
        <Link
          href="/dashboard/create-shop"
          className="mt-3 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          Create your shop
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative h-44 w-full bg-gradient-to-br from-secondary/25 to-primary/15">
        {shop.coverUrl ? (
          <Image
            src={shop.coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1152px) 100vw, 1152px"
            priority
            unoptimized
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-4 px-5 pb-5 pt-0 sm:flex-row sm:items-end">
        <div className="-mt-10 flex shrink-0 justify-center sm:justify-start">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md sm:h-[7.25rem] sm:w-[7.25rem]">
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                alt=""
                fill
                className="object-contain p-1.5"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                No logo
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
          <h2 className="truncate text-xl font-bold tracking-tight text-ink">
            {shop.shopName || "Your shop"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {[shop.city, shop.category].filter(Boolean).join(" · ") || "—"}
          </p>
          <Link
            href="/dashboard/create-shop"
            className="mt-2 inline-block text-sm font-medium text-secondary hover:underline"
          >
            Edit shop details
          </Link>
        </div>
      </div>
    </div>
  );
}
