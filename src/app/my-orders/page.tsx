"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import type { OrderDoc, OrderStatus } from "@/lib/orders/types";
import { Card } from "@/components/ui/Card";

function toMillis(t: unknown): number {
  if (t && typeof t === "object" && t !== null && "toMillis" in t) {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function formatDate(t: unknown): string {
  if (t && typeof t === "object" && t !== null && "toDate" in t) {
    return (t as { toDate: () => Date }).toDate().toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  return "—";
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [orders, setOrders] = useState<(OrderDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/login?returnUrl=%2Fmy-orders");
      return;
    }
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
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
            status: (x.status as OrderStatus) ?? "pending",
            customerEmail:
              typeof x.customerEmail === "string" ? x.customerEmail : "",
            createdAt: x.createdAt,
          } as OrderDoc & { id: string };
        });
        rows.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setOrders(rows);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [isReady, user, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            My orders
          </h1>
          <p className="mt-2 text-sm text-muted">
            Orders you placed on shops — updates when the seller changes status.
          </p>

          {loading ? (
            <p className="mt-10 text-muted">Loading…</p>
          ) : orders.length === 0 ? (
            <Card hover={false} className="mt-8 p-10 text-center text-muted">
              No orders yet.{" "}
              <Link href="/shops" className="font-medium text-secondary hover:underline">
                Browse shops
              </Link>
            </Card>
          ) : (
            <ul className="mt-8 space-y-4">
              {orders.map((o) => (
                <li key={o.id}>
                  <Card hover={false} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                        <Link
                          href={`/shops/${o.shopId}`}
                          className="mt-1 text-sm font-semibold text-secondary hover:underline"
                        >
                          View shop
                        </Link>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-ink">
                          Rs {o.totalPrice.toLocaleString("en-PK")}
                        </p>
                        <p className="text-xs capitalize text-muted">
                          Status: {o.status}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
                      {o.items.map((line, i) => (
                        <li key={`${line.productId}-${i}`}>
                          {line.productName} × {line.quantity}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
