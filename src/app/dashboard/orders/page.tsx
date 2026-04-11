"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
} from "@/lib/firebase/client";
import type { OrderDoc, OrderStatus } from "@/lib/orders/types";
import { Card } from "@/components/ui/Card";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "delivered"];

function formatDate(t: unknown): string {
  if (t && typeof t === "object" && t !== null && "toDate" in t) {
    return (t as { toDate: () => Date }).toDate().toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  return "—";
}

function toMillis(t: unknown): number {
  if (t && typeof t === "object" && t !== null && "toMillis" in t) {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export default function OrdersPage() {
  const { user, isReady } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [orders, setOrders] = useState<(OrderDoc & { id: string })[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !user?.uid) return;
    const db = getFirebaseDb();
    if (!db) {
      setLoadingShop(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, "shops"),
          where("ownerId", "==", user.uid),
          limit(1)
        )
      );
      if (cancelled) return;
      setShopId(snap.docs[0]?.id ?? null);
      setLoadingShop(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.uid]);

  useEffect(() => {
    if (!shopId) return;
    const db = getFirebaseDb();
    if (!db) return;

    const q = query(
      collection(db, "orders"),
      where("shopId", "==", shopId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id,
          orderId: typeof x.orderId === "string" ? x.orderId : d.id,
          userId: typeof x.userId === "string" ? x.userId : "",
          shopId: typeof x.shopId === "string" ? x.shopId : "",
          items: Array.isArray(x.items) ? (x.items as OrderDoc["items"]) : [],
          totalPrice:
            typeof x.totalPrice === "number"
              ? x.totalPrice
              : Number(x.totalPrice) || 0,
          status: ((x.status as OrderStatus) ?? "pending") as OrderStatus,
          customerEmail:
            typeof x.customerEmail === "string" ? x.customerEmail : "",
          createdAt: x.createdAt,
        } as OrderDoc & { id: string };
      });
      rows.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setOrders(rows);
    });

    return () => unsub();
  }, [shopId]);

  async function setStatus(orderDocId: string, status: OrderStatus) {
    const db = getFirebaseDb();
    if (!db) return;
    setUpdatingId(orderDocId);
    try {
      await getFirebaseCurrentUserWhenReady();
      await updateDoc(doc(db, "orders", orderDocId), { status });
    } finally {
      setUpdatingId(null);
    }
  }

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  if (loadingShop) {
    return (
      <div className="p-6 text-muted">
        <p>Loading…</p>
      </div>
    );
  }

  if (!shopId) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Card hover={false} className="p-8 text-center">
          <p className="text-muted">Create a shop first to receive orders.</p>
          <Link
            href="/dashboard/create-shop"
            className="mt-3 inline-block text-sm font-semibold text-secondary hover:underline"
          >
            Create shop
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted">
            Live updates when customers place orders from your shop page.
          </p>
        </div>

        {orders.length === 0 ? (
          <Card hover={false} className="p-10 text-center text-muted">
            No orders yet. Share your shop link so buyers can order products.
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id} hover={false} className="overflow-hidden p-0">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Order
                    </p>
                    <p className="font-mono text-sm text-ink">
                      {o.id.slice(0, 12)}…
                    </p>
                    <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-ink">
                      Rs {o.totalPrice.toLocaleString("en-PK")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                      <label className="sr-only" htmlFor={`st-${o.id}`}>
                        Status
                      </label>
                      <select
                        id={`st-${o.id}`}
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) =>
                          void setStatus(o.id, e.target.value as OrderStatus)
                        }
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 sm:px-5">
                  <p className="text-xs font-medium text-muted">Customer</p>
                  <p className="text-sm text-ink">
                    {o.customerEmail || `${o.userId.slice(0, 10)}…`}
                  </p>
                </div>
                <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
                  <p className="text-xs font-medium text-muted">Items</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {o.items.map((line, i) => (
                      <li
                        key={`${line.productId}-${i}`}
                        className="flex justify-between gap-2"
                      >
                        <span>
                          {line.productName}{" "}
                          <span className="text-muted">× {line.quantity}</span>
                        </span>
                        <span className="text-muted">
                          Rs{" "}
                          {(line.unitPrice * line.quantity).toLocaleString(
                            "en-PK"
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
