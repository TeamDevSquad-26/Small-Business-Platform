"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import {
  ArrowLeft,
  ExternalLink,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseDb } from "@/lib/firebase/client";
import { Card } from "@/components/ui/Card";

type ShopRow = {
  id: string;
  shopName: string;
  city: string;
};

export default function ShopAdminPage() {
  const router = useRouter();
  const { user, isReady, isFirebaseConfigured } = useAuth();
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  useEffect(() => {
    if (!isReady || !user?.uid || !isFirebaseConfigured) {
      setLoading(false);
      setShop(null);
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
        const snap = await getDocs(
          query(
            collection(db, "shops"),
            where("ownerId", "==", user.uid),
            limit(1)
          )
        );
        if (cancelled) return;
        const d = snap.docs[0];
        if (!d) {
          setShop(null);
          return;
        }
        const x = d.data();
        setShop({
          id: d.id,
          shopName: typeof x.shopName === "string" ? x.shopName : "Shop",
          city: typeof x.city === "string" ? x.city : "",
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

  if (!isReady || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Shop admin
          </h1>
          <p className="mt-1 text-sm text-muted">
            Apni shop ka control center — products, orders, aur settings yahan se.
          </p>
        </div>

        {!shop ? (
          <Card hover={false} className="p-8 text-center">
            <Store className="mx-auto h-10 w-10 text-secondary" />
            <p className="mt-4 text-muted">Abhi koi shop create nahi hui.</p>
            <Link
              href="/dashboard/create-shop"
              className="mt-4 inline-block text-sm font-semibold text-secondary hover:underline"
            >
              Shop create karo
            </Link>
          </Card>
        ) : (
          <>
            <Card hover className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Your shop
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-ink">{shop.shopName}</h2>
                  {shop.city ? (
                    <p className="text-sm text-muted">{shop.city}</p>
                  ) : null}
                </div>
                <Link
                  href={`/shops/${shop.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-secondary transition hover:border-secondary/40"
                >
                  Public shop dekho
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminTile
                href="/dashboard/products"
                icon={Package}
                title="Products"
                desc="Add / edit products — har product par Buy button public page par dikhe ga."
              />
              <AdminTile
                href="/dashboard/orders"
                icon={ShoppingCart}
                title="Orders"
                desc="Customer orders aur payment status yahan manage karo."
              />
              <AdminTile
                href="/dashboard/settings"
                icon={Settings}
                title="Shop settings"
                desc="Payment numbers (JazzCash / EasyPaisa), profile, aur coupons."
              />
              <AdminTile
                href="/dashboard"
                icon={LayoutDashboard}
                title="Overview"
                desc="Dashboard par quick stats aur recent orders."
              />
            </div>

            <p className="text-center text-xs text-muted">
              Har shop ka apna cart public page par alag save hota hai (browser storage).
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function AdminTile({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card
        hover
        className="flex h-full flex-col gap-2 p-5 transition hover:border-secondary/30"
      >
        <Icon className="h-6 w-6 text-secondary" />
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-muted">{desc}</p>
      </Card>
    </Link>
  );
}
