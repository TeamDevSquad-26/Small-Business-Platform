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
  Store,
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
import {
  PLAN_CAPS,
  getUserSubscription,
  resolvePlanByCode,
  type SubscriptionSnapshot,
} from "@/lib/subscriptions/access";

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
  const [lowStockCount, setLowStockCount] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);

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
    if (!isReady || !user?.uid || !isFirebaseConfigured) return;
    const db = getFirebaseDb();
    if (!db) return;
    let cancelled = false;
    (async () => {
      const sub = await getUserSubscription(db, user.uid);
      if (!cancelled) setSubscription(sub);
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
      const low = snap.docs.reduce((n, d) => {
        const stockRaw = d.data()?.stock;
        const stock =
          typeof stockRaw === "number" ? stockRaw : Number(stockRaw) || 0;
        return stock <= 5 ? n + 1 : n;
      }, 0);
      setLowStockCount(low);
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
  const caps = PLAN_CAPS[subscription?.effectivePlan ?? "basic"];

  const ordersHint =
    pendingCount > 0
      ? `${pendingCount} pending`
      : orders.length > 0
        ? "Live"
        : "No orders yet";

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-stone-500">
        <span className="h-10 w-10 animate-pulse rounded-2xl bg-orange-200/50" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <div className="p-4 pb-12 md:p-6 md:pb-14 lg:px-8 lg:pb-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mx-auto max-w-6xl space-y-8"
      >
        <motion.div variants={fadeSlideUp} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
            Overview
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
            Welcome back,{" "}
            <span className="text-orange-600">{firstName}</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600 md:text-base">
            Orders aur products yahan live update hote hain jab tak shop setup ho. Neeche apni shop card,
            stats, aur recent orders dikhen ge.
          </p>
        </motion.div>

        <motion.div variants={fadeSlideUp}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
            <span className="h-1 w-6 rounded-full bg-orange-500" aria-hidden />
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
            accent="orange"
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
            value={resolvePlanByCode(subscription?.effectivePlan ?? "basic").name}
            hint={
              subscription?.launchFreeActive
                ? `Free month active till ${subscription.launchEndsAt.toLocaleDateString("en-PK")}`
                : "Active plan"
            }
            icon={CreditCard}
            accent="green"
          />
        </motion.div>

        {caps.lowStockAlerts && shopId ? (
          <motion.div variants={fadeSlideUp}>
            <Card
              hover={false}
              className="border border-amber-200/90 bg-gradient-to-r from-amber-50/90 to-orange-50/40 p-4 ring-1 ring-amber-100/80"
            >
              <p className="text-sm font-semibold text-amber-950">Low stock alerts</p>
              <p className="mt-1 text-sm text-amber-900/90">
                {lowStockCount > 0
                  ? `${lowStockCount} products low stock par hain (≤ 5 units).`
                  : "Sab products par stock theek lag rahi hai."}
              </p>
            </Card>
          </motion.div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div variants={fadeSlideUp} className="lg:col-span-2">
            <Card
              hover
              className="overflow-hidden border-orange-100/70 p-0 shadow-[0_12px_40px_-16px_rgba(234,88,12,0.1)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-orange-100/80 bg-gradient-to-r from-orange-50/40 to-white px-5 py-4">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-stone-900">
                    Recent orders
                  </h2>
                  <p className="text-sm text-stone-600">Live — naye pehle</p>
                </div>
                {shopId ? (
                  <Link
                    href="/dashboard/orders"
                    className="text-sm font-semibold text-orange-700 underline-offset-2 hover:text-orange-800 hover:underline"
                  >
                    Sab dekho
                  </Link>
                ) : null}
              </div>
              <div className="overflow-x-auto">
                {loadingShop ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">
                    Loading…
                  </p>
                ) : !shopId ? (
                  <p className="px-5 py-10 text-center text-sm text-stone-600">
                    Orders yahan tab dikhen ge jab shop ban jaye.{" "}
                    <Link
                      href="/dashboard/create-shop"
                      className="font-semibold text-orange-700 hover:underline"
                    >
                      Shop create karo
                    </Link>
                  </p>
                ) : ordersListenerError ? (
                  <p className="px-5 py-8 text-center text-sm text-red-700">
                    {ordersListenerError}
                  </p>
                ) : recentRows.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-stone-600">
                    Abhi koi order nahi. Apna shop link share karo taake customers order kar saken.
                  </p>
                ) : (
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-orange-100/80 bg-orange-50/50 text-xs font-semibold uppercase tracking-wide text-stone-600">
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
                            className="border-b border-orange-50/60 transition-colors hover:bg-orange-50/35"
                          >
                            <td className="px-5 py-3 font-mono text-xs text-ink">
                              <Link
                                href="/dashboard/orders"
                                className="font-medium text-orange-700 hover:text-orange-800 hover:underline"
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
                                  "max-w-[9rem] rounded-xl border border-orange-200/80 bg-white px-2 py-1.5 text-xs font-medium text-stone-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200",
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
            <Card className="h-full border-orange-100/70 bg-white shadow-[0_12px_36px_-18px_rgba(234,88,12,0.12)]">
              <h2 className="font-heading text-lg font-semibold text-stone-900">Quick actions</h2>
              <p className="mt-1 text-sm text-stone-600">Shortcuts — ek click</p>
              <ul className="mt-5 space-y-2.5">
                <li>
                  <Link
                    href="/dashboard/products"
                    className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-orange-200 hover:shadow-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/12 text-orange-700">
                      <Plus className="h-4 w-4" aria-hidden />
                    </span>
                    Add Product
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/create-shop"
                    className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-orange-200 hover:bg-orange-50/40"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-700">
                      <Pencil className="h-4 w-4" aria-hidden />
                    </span>
                    Edit Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-orange-200 hover:bg-orange-50/40"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-700">
                      <ListOrdered className="h-4 w-4" aria-hidden />
                    </span>
                    View Orders
                  </Link>
                </li>
                {shopId ? (
                  <li>
                    <Link
                      href={`/shops/${shopId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 px-4 py-3 text-sm font-semibold text-orange-900 transition hover:border-orange-300 hover:bg-orange-50/60"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-orange-600 ring-1 ring-orange-100">
                        <Store className="h-4 w-4" aria-hidden />
                      </span>
                      Storefront (new tab)
                    </Link>
                  </li>
                ) : null}
              </ul>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
