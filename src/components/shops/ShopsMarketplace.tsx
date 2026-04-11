"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";

export type ShopListItem = {
  id: string;
  shopName: string;
  city: string;
  category: string;
  logoUrl: string;
  coverUrl: string;
  description: string;
};

function toMillis(t: unknown): number {
  if (t && typeof t === "object" && t !== null && "toMillis" in t) {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export function ShopsMarketplace() {
  const [shops, setShops] = useState<ShopListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setError("Couldn’t load shops. Try again later.");
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    if (!db) {
      setError("Could not connect to the database.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "shops"));
        if (cancelled) return;

        type Row = ShopListItem & { _t: number };
        const rows: ShopListItem[] = snap.docs
          .map((docSnap) => {
            const d = docSnap.data();
            const item: Row = {
              id: docSnap.id,
              shopName: typeof d.shopName === "string" ? d.shopName : "Shop",
              city: typeof d.city === "string" ? d.city : "",
              category: typeof d.category === "string" ? d.category : "",
              logoUrl: typeof d.logoUrl === "string" ? d.logoUrl : "",
              coverUrl: typeof d.coverUrl === "string" ? d.coverUrl : "",
              description:
                typeof d.description === "string"
                  ? d.description.slice(0, 160)
                  : "",
              _t: toMillis(d.createdAt),
            };
            return item;
          })
          .sort((a, b) => b._t - a._t)
          .slice(0, 60)
          .map(
            (row): ShopListItem => ({
              id: row.id,
              shopName: row.shopName,
              city: row.city,
              category: row.category,
              logoUrl: row.logoUrl,
              coverUrl: row.coverUrl,
              description: row.description,
            })
          );

        setShops(rows);
        setError("");
      } catch {
        if (!cancelled) setError("Could not load shops. Try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-muted">Loading shops…</p>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {error}
      </p>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
        <p className="text-muted">No shops listed yet.</p>
        <Link
          href="/signup"
          className="mt-3 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          Be the first to create a shop
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <li key={shop.id}>
          <Link
            href={`/shops/${shop.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-secondary/30 hover:shadow-md"
          >
            <div className="relative h-36 w-full bg-gradient-to-br from-secondary/20 to-primary/10">
              {shop.coverUrl ? (
                <Image
                  src={shop.coverUrl}
                  alt=""
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start gap-3">
                <div className="relative -mt-10 h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm">
                  {shop.logoUrl ? (
                    <Image
                      src={shop.logoUrl}
                      alt=""
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <h2 className="truncate font-semibold text-ink group-hover:text-secondary">
                    {shop.shopName}
                  </h2>
                  <p className="text-xs text-muted">
                    {[shop.city, shop.category].filter(Boolean).join(" · ") ||
                      "—"}
                  </p>
                </div>
              </div>
              {shop.description ? (
                <p className="line-clamp-2 text-sm text-muted">{shop.description}</p>
              ) : null}
              <span className="mt-auto pt-1 text-xs font-medium text-secondary">
                View shop →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
