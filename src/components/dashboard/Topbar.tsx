"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Bell, Menu, Search, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { Input } from "@/components/ui/Input";

type TopbarProps = {
  onMenuOpen: () => void;
};

type OrderRow = {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: unknown;
};

function toMillis(t: unknown): number {
  if (t && typeof t === "object" && t !== null && "toMillis" in t) {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function formatTime(t: unknown): string {
  if (t && typeof t === "object" && t !== null && "toDate" in t) {
    return (t as { toDate: () => Date }).toDate().toLocaleString("en-PK", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return "";
}

export function Topbar({ onMenuOpen }: TopbarProps) {
  const { user, logout, isReady } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  /** Single stable dep — avoids "dependency array changed size" (e.g. after Fast Refresh). */
  const shopOwnerKey =
    isReady && user?.uid ? user.uid : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!shopOwnerKey || !isFirebaseConfigured) {
      setShopId(null);
      return;
    }
    const db = getFirebaseDb();
    if (!db) return;

    let cancelled = false;
    (async () => {
      const snap = await getDocs(
        query(
          collection(db, "shops"),
          where("ownerId", "==", shopOwnerKey),
          limit(1)
        )
      );
      if (cancelled) return;
      setShopId(snap.docs[0]?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [shopOwnerKey]);

  useEffect(() => {
    if (!shopId) {
      setOrders([]);
      return;
    }
    const db = getFirebaseDb();
    if (!db) return;

    const q = query(collection(db, "orders"), where("shopId", "==", shopId));
    const unsub = onSnapshot(q, (snap) => {
      const rows: OrderRow[] = snap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id,
          totalPrice:
            typeof x.totalPrice === "number"
              ? x.totalPrice
              : Number(x.totalPrice) || 0,
          status: typeof x.status === "string" ? x.status : "pending",
          createdAt: x.createdAt,
        };
      });
      rows.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setOrders(rows);
    });
    return () => unsub();
  }, [shopId]);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const pendingCount = pendingOrders.length;
  const recentPending = pendingOrders.slice(0, 5);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 bg-surface/95 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        className="rounded-xl p-2 text-ink hover:bg-gray-100 md:hidden"
        aria-label="Open menu"
        onClick={onMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative min-w-0 max-w-md flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          id="dashboard-search"
          className="!py-2.5 !pl-10"
          placeholder="Search products, orders..."
          aria-label="Search"
        />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-muted transition-colors hover:bg-gray-100 hover:text-ink"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            ) : null}
          </button>

          {notifOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-gray-100 bg-surface py-2 shadow-soft-lg">
              <div className="border-b border-gray-100 px-3 pb-2">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <p className="text-xs text-muted">Pending orders for your shop</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {!shopId ? (
                  <p className="px-3 py-4 text-sm text-muted">
                    Create a shop to receive order alerts here.
                  </p>
                ) : recentPending.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted">
                    No pending orders right now.
                  </p>
                ) : (
                  <ul className="py-1">
                    {recentPending.map((o) => (
                      <li key={o.id}>
                        <Link
                          href="/dashboard/orders"
                          className="block px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
                          onClick={() => setNotifOpen(false)}
                        >
                          <span className="font-medium text-ink">
                            New order · Rs{" "}
                            {o.totalPrice.toLocaleString("en-PK")}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {formatTime(o.createdAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-gray-100 px-2 pt-2">
                <Link
                  href="/dashboard/orders"
                  className="block rounded-xl px-3 py-2 text-center text-sm font-medium text-secondary hover:bg-secondary/5"
                  onClick={() => setNotifOpen(false)}
                >
                  View all orders
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-100 bg-background px-2 py-1.5 pr-3 transition-colors hover:bg-gray-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden max-w-[8rem] truncate text-left text-sm font-medium text-ink sm:block">
              {user?.name ?? "User"}
            </span>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-gray-100 bg-surface py-2 shadow-soft-lg">
              <div className="border-b border-gray-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-ink">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-muted hover:bg-gray-50 hover:text-ink"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  router.push("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
