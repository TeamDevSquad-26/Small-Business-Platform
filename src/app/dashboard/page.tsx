"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import {
  Package,
  ShoppingCart,
  Banknote,
  CreditCard,
  Plus,
  Pencil,
  ListOrdered,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardShopCard } from "@/components/dashboard/DashboardShopCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import {
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
} from "@/lib/firebase/client";
import type { OrderDoc, OrderStatus } from "@/lib/orders/types";
import { cn } from "@/lib/cn";

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

function statusLabel(s: OrderStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "delivered"];

export default function DashboardPage() {
  const { user, isReady, isFirebaseConfigured } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const [shopId, setShopId] = useState<string | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [orders, setOrders] = useState<(OrderDoc & { id: string })[]>([]);
  const [ordersListenerError, setOrdersListenerError] = useState<string | null>(
    null
  );
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (!isReady || !user?.uid || !isFirebaseConfigured) {
      setShopId(null);
      setLoadingShop(false);
      return;
    }
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
  }, [isReady, user?.uid, isFirebaseConfigured]);

  useEffect(() => {
    if (!shopId) {
      setOrders([]);
      return;
    }
    const db = getFirebaseDb();
    if (!db) return;

    const q = query(collection(db, "orders"), where("shopId", "==", shopId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrdersListenerError(null);
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
      },
      (err) => {
        setOrdersListenerError(
          err instanceof Error ? err.message : "Could not load orders."
        );
        setOrders([]);
      }
    );

    return () => unsub();
  }, [shopId]);

  async function setOrderStatus(orderDocId: string, status: OrderStatus) {
    const db = getFirebaseDb();
    if (!db) return;
    setUpdatingOrderId(orderDocId);
    try {
      await getFirebaseCurrentUserWhenReady();
      await updateDoc(doc(db, "orders", orderDocId), { status });
    } finally {
      setUpdatingOrderId(null);
    }
  }

  useEffect(() => {
    if (!shopId) {
      setProductCount(0);
      return;
    }
    const db = getFirebaseDb();
    if (!db) return;

    const q = query(collection(db, "products"), where("shopId", "==", shopId));
    const unsub = onSnapshot(q, (snap) => {
      setProductCount(snap.size);
    });
    return () => unsub();
  }, [shopId]);

  const revenueTotal = useMemo(
    () => orders.reduce((sum, o) => sum + o.totalPrice, 0),
    [orders]
  );

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders]
  );

  const recentRows = useMemo(() => orders.slice(0, 8), [orders]);

  const ordersHint =
    pendingCount > 0
      ? `${pendingCount} pending`
      : orders.length > 0
        ? "Live"
        : "No orders yet";

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mx-auto max-w-6xl space-y-8"
      >
        <motion.div variants={fadeSlideUp}>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-muted">
            Orders and products update here in real time when your shop is set up.
          </p>
        </motion.div>

        <motion.div variants={fadeSlideUp}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Your shop
          </h2>
          <DashboardShopCard />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            variants={fadeSlideUp}
            title="Total Products"
            value={loadingShop ? "…" : shopId ? String(productCount) : "—"}
            hint={shopId ? "Live count" : "Create a shop first"}
            icon={Package}
            accent="green"
          />
          <StatCard
            variants={fadeSlideUp}
            title="Total Orders"
            value={loadingShop ? "…" : shopId ? String(orders.length) : "—"}
            hint={shopId ? ordersHint : "—"}
            icon={ShoppingCart}
            accent="indigo"
          />
          <StatCard
            variants={fadeSlideUp}
            title="Revenue (orders)"
            value={
              loadingShop
                ? "…"
                : shopId
                  ? `Rs ${revenueTotal.toLocaleString("en-PK")}`
                  : "—"
            }
            hint={shopId ? "Sum of order totals" : "—"}
            icon={Banknote}
            accent="amber"
          />
          <StatCard
            variants={fadeSlideUp}
            title="Subscription"
            value="Standard"
            hint="Renews May 1"
            icon={CreditCard}
            accent="green"
          />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div variants={fadeSlideUp} className="lg:col-span-2">
            <Card hover className="overflow-hidden p-0">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">
                    Recent orders
                  </h2>
                  <p className="text-sm text-muted">
                    Live — newest first
                  </p>
                </div>
                {shopId ? (
                  <Link
                    href="/dashboard/orders"
                    className="text-sm font-semibold text-secondary hover:underline"
                  >
                    View all
                  </Link>
                ) : null}
              </div>
              <div className="overflow-x-auto">
                {loadingShop ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">
                    Loading…
                  </p>
                ) : !shopId ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">
                    Create a shop to see orders here.{" "}
                    <Link
                      href="/dashboard/create-shop"
                      className="font-semibold text-secondary hover:underline"
                    >
                      Create shop
                    </Link>
                  </p>
                ) : ordersListenerError ? (
                  <p className="px-5 py-8 text-center text-sm text-red-700">
                    {ordersListenerError}
                  </p>
                ) : recentRows.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">
                    No orders yet. Share your shop link so customers can place
                    orders.
                  </p>
                ) : (
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-muted">
                        <th className="px-5 py-3">Order</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Items</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRows.map((row) => {
                        const customer =
                          row.customerEmail ||
                          (row.userId
                            ? `${row.userId.slice(0, 8)}…`
                            : "—");
                        const orderRef =
                          row.orderId.length > 10
                            ? `${row.orderId.slice(0, 10)}…`
                            : row.orderId;
                        const qtySum = row.items.reduce(
                          (n, line) =>
                            n + (Number(line.quantity) || 0),
                          0
                        );
                        const itemsCell =
                          qtySum > 0
                            ? `${qtySum} pcs`
                            : row.items.length > 0
                              ? `${row.items.length} lines`
                              : "—";
                        return (
                          <tr
                            key={row.id}
                            className="border-b border-gray-50 transition-colors hover:bg-gray-50/80"
                          >
                            <td className="px-5 py-3 font-mono text-xs text-ink">
                              <Link
                                href="/dashboard/orders"
                                className="text-secondary hover:underline"
                              >
                                {orderRef}
                              </Link>
                            </td>
                            <td className="max-w-[140px] truncate px-5 py-3 text-muted">
                              {customer}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-muted">
                              {itemsCell}
                            </td>
                            <td className="px-5 py-3 text-ink">
                              Rs{" "}
                              {row.totalPrice.toLocaleString("en-PK")}
                            </td>
                            <td className="px-5 py-3">
                              <label className="sr-only" htmlFor={`dash-st-${row.id}`}>
                                Status for order {row.id}
                              </label>
                              <select
                                id={`dash-st-${row.id}`}
                                value={row.status}
                                disabled={updatingOrderId === row.id}
                                onChange={(e) =>
                                  void setOrderStatus(
                                    row.id,
                                    e.target.value as OrderStatus
                                  )
                                }
                                className={cn(
                                  "max-w-[9rem] rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-ink shadow-sm",
                                  updatingOrderId === row.id && "opacity-60"
                                )}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {statusLabel(s)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-3 text-muted">
                              {formatDate(row.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeSlideUp}>
            <Card className="h-full">
              <h2 className="text-lg font-semibold text-ink">Quick actions</h2>
              <p className="mt-1 text-sm text-muted">
                Your most-used shortcuts
              </p>
              <ul className="mt-5 space-y-2">
                <li>
                  <Link
                    href="/dashboard/products"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-background px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-secondary/30 hover:bg-secondary/5"
                  >
                    <Plus className="h-4 w-4 text-secondary" />
                    Add Product
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/create-shop"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-background px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-secondary/30 hover:bg-secondary/5"
                  >
                    <Pencil className="h-4 w-4 text-secondary" />
                    Edit Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-background px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-secondary/30 hover:bg-secondary/5"
                  >
                    <ListOrdered className="h-4 w-4 text-secondary" />
                    View Orders
                  </Link>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
