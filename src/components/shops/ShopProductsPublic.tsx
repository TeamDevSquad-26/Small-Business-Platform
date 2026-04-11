"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";

type PublicProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
};

function toMillis(t: unknown): number {
  if (t && typeof t === "object" && t !== null && "toMillis" in t) {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export function ShopProductsPublic({
  shopId,
  shopOwnerId,
  shopName,
}: {
  shopId: string;
  shopOwnerId?: string;
  shopName?: string;
}) {
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [items, setItems] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const isOwnShop = Boolean(
    user?.uid && shopOwnerId && user.uid === shopOwnerId
  );

  useEffect(() => {
    if (!shopId || !isFirebaseConfigured) {
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
        let snap;
        try {
          snap = await getDocs(
            query(
              collection(db, "products"),
              where("shopId", "==", shopId),
              orderBy("createdAt", "desc"),
              limit(48)
            )
          );
        } catch {
          snap = await getDocs(
            query(
              collection(db, "products"),
              where("shopId", "==", shopId),
              limit(100)
            )
          );
        }
        if (cancelled) return;

        const rows: (PublicProduct & { _t: number })[] = snap.docs.map((d) => {
          const x = d.data();
          const stockRaw = x.stock;
          const stock =
            stockRaw === undefined || stockRaw === null
              ? 99999
              : typeof stockRaw === "number"
                ? stockRaw
                : Number(stockRaw) || 0;
          return {
            id: d.id,
            name: typeof x.name === "string" ? x.name : "Product",
            price: typeof x.price === "number" ? x.price : Number(x.price) || 0,
            description:
              typeof x.description === "string" ? x.description.slice(0, 200) : "",
            imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : "",
            category: typeof x.category === "string" ? x.category : "",
            stock,
            _t: toMillis(x.createdAt),
          };
        });
        rows.sort((a, b) => b._t - a._t);
        const list = rows.map(
          (r): PublicProduct => ({
            id: r.id,
            name: r.name,
            price: r.price,
            description: r.description,
            imageUrl: r.imageUrl,
            category: r.category,
            stock: r.stock,
          })
        );
        setItems(list);
        const initialQty: Record<string, number> = {};
        for (const p of list) initialQty[p.id] = 1;
        setQty(initialQty);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  async function placeOrder(p: PublicProduct) {
    setBanner(null);
    if (!isReady) return;
    if (!user) {
      const ret = encodeURIComponent(`/shops/${shopId}`);
      router.push(`/login?returnUrl=${ret}`);
      return;
    }
    if (isOwnShop) {
      setBanner({ ok: false, text: "You can’t order from your own shop." });
      return;
    }

    const q = Math.max(1, Math.min(99, qty[p.id] ?? 1));
    if (p.stock < 99999 && p.stock > 0 && q > p.stock) {
      setBanner({
        ok: false,
        text: `Only ${p.stock} in stock for ${p.name}.`,
      });
      return;
    }
    if (p.stock === 0) {
      setBanner({ ok: false, text: `${p.name} is out of stock.` });
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setBanner({ ok: false, text: "Database unavailable." });
      return;
    }

    setOrderingId(p.id);
    try {
      const current = await getFirebaseCurrentUserWhenReady();
      if (!current) {
        setBanner({ ok: false, text: "Please sign in again." });
        return;
      }

      const ref = doc(collection(db, "orders"));
      const unitPrice = p.price;
      const totalPrice = unitPrice * q;

      await setDoc(ref, {
        orderId: ref.id,
        userId: current.uid,
        shopId,
        items: [
          {
            productId: p.id,
            productName: p.name,
            unitPrice,
            quantity: q,
          },
        ],
        totalPrice,
        status: "pending",
        customerEmail: current.email ?? "",
        createdAt: serverTimestamp(),
      });

      setBanner({
        ok: true,
        text: `Order placed${shopName ? ` from ${shopName}` : ""}. Track it under My orders.`,
      });
    } catch (e) {
      setBanner({
        ok: false,
        text: e instanceof Error ? e.message : "Could not place order.",
      });
    } finally {
      setOrderingId(null);
    }
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted">Loading products…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-muted">
        No products listed yet.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Products</h2>
        {user && !isOwnShop ? (
          <Link
            href="/my-orders"
            className="text-sm font-medium text-secondary hover:underline"
          >
            My orders
          </Link>
        ) : null}
      </div>

      {banner ? (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            banner.ok
              ? "border-secondary/30 bg-secondary/10 text-secondary"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {banner.text}
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((p) => {
          const busy = orderingId === p.id;
          const out = p.stock === 0;
          const unlimited = p.stock >= 99999;
          return (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-3 sm:flex-row"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-white sm:h-24 sm:w-24">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{p.name}</p>
                {p.category ? (
                  <p className="text-xs text-muted">{p.category}</p>
                ) : null}
                <p className="mt-1 text-sm font-bold text-secondary">
                  Rs {p.price.toLocaleString("en-PK")}
                </p>
                {out ? (
                  <p className="text-xs font-medium text-amber-800">Out of stock</p>
                ) : unlimited ? (
                  <p className="text-xs text-muted">In stock</p>
                ) : (
                  <p className="text-xs text-muted">In stock: {p.stock}</p>
                )}
                {p.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {p.description}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`qty-${p.id}`}>
                    Quantity
                  </label>
                  <input
                    id={`qty-${p.id}`}
                    type="number"
                    min={1}
                    max={p.stock > 0 && p.stock < 99999 ? p.stock : 99}
                    disabled={out || isOwnShop}
                    value={qty[p.id] ?? 1}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setQty((prev) => ({
                        ...prev,
                        [p.id]: Number.isFinite(v) ? v : 1,
                      }));
                    }}
                    className="w-20 rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-sm"
                  />
                  {isOwnShop ? (
                    <span className="text-xs text-muted">Your listing</span>
                  ) : (
                    <Button
                      type="button"
                      className="!px-4 !py-2 text-sm"
                      disabled={busy || out}
                      onClick={() => void placeOrder(p)}
                    >
                      {busy ? "Ordering…" : "Order"}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {!user ? (
        <p className="mt-4 text-center text-sm text-muted">
          <Link href={`/login?returnUrl=${encodeURIComponent(`/shops/${shopId}`)}`} className="font-medium text-secondary hover:underline">
            Sign in
          </Link>{" "}
          to place an order.
        </p>
      ) : null}
    </div>
  );
}
