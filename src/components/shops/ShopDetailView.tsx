"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { ShopProductsPublic } from "@/components/shops/ShopProductsPublic";

type ShopDetail = {
  shopId: string;
  ownerId: string;
  shopName: string;
  city: string;
  category: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
};

export function ShopDetailView() {
  const params = useParams();
  const shopId =
    params && typeof params.shopId === "string" ? params.shopId : "";
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shopId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    if (!isFirebaseConfigured) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    if (!db) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "shops", shopId));
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        const d = snap.data();
        setShop({
          shopId: snap.id,
          ownerId: typeof d.ownerId === "string" ? d.ownerId : "",
          shopName: typeof d.shopName === "string" ? d.shopName : "Shop",
          city: typeof d.city === "string" ? d.city : "",
          category: typeof d.category === "string" ? d.category : "",
          description: typeof d.description === "string" ? d.description : "",
          logoUrl: typeof d.logoUrl === "string" ? d.logoUrl : "",
          coverUrl: typeof d.coverUrl === "string" ? d.coverUrl : "",
          instagram: typeof d.instagram === "string" ? d.instagram : "",
          facebook: typeof d.facebook === "string" ? d.facebook : "",
          whatsapp: typeof d.whatsapp === "string" ? d.whatsapp : "",
        });
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-muted">Loading shop…</p>
    );
  }

  if (notFound || !shop) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center">
        <p className="text-lg font-medium text-ink">Shop not found</p>
        <p className="mt-2 text-sm text-muted">
          This shop may have been removed or the link is incorrect.
        </p>
        <Link
          href="/shops"
          className="mt-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Back to all shops
        </Link>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative h-52 w-full bg-gradient-to-br from-secondary/25 to-primary/15 sm:h-64">
        {shop.coverUrl ? (
          <Image
            src={shop.coverUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        ) : null}
      </div>
      <div className="px-5 pb-8 pt-0 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="relative -mt-12 h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-32 sm:w-32">
              {shop.logoUrl ? (
                <Image
                  src={shop.logoUrl}
                  alt=""
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  No logo
                </div>
              )}
            </div>
            <div className="text-center sm:pb-1 sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
                {shop.shopName}
              </h1>
              <p className="mt-1 text-muted">
                {[shop.city, shop.category].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </div>
          <Link
            href="/shops"
            className="shrink-0 text-sm font-medium text-secondary hover:underline sm:mb-1"
          >
            ← All shops
          </Link>
        </div>

        {shop.description ? (
          <p className="mt-8 text-sm leading-relaxed text-ink/90">{shop.description}</p>
        ) : null}

        {(shop.instagram || shop.facebook || shop.whatsapp) && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-ink">Contact & social</h2>
            <ul className="mt-3 flex flex-wrap gap-4 text-sm">
              {shop.instagram ? (
                <li>
                  <a
                    href={shop.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    Instagram
                  </a>
                </li>
              ) : null}
              {shop.facebook ? (
                <li>
                  <a
                    href={shop.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    Facebook
                  </a>
                </li>
              ) : null}
              {shop.whatsapp ? (
                <li>
                  <a
                    href={
                      shop.whatsapp.startsWith("http")
                        ? shop.whatsapp
                        : `https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        )}

        <div className="mt-10 border-t border-gray-100 pt-8">
          <ShopProductsPublic
            shopId={shop.shopId}
            shopOwnerId={shop.ownerId}
            shopName={shop.shopName}
          />
        </div>
      </div>
    </article>
  );
}
