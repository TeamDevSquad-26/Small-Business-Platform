"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Store,
  Package,
  ShoppingCart,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/shop", label: "Shop admin", icon: Building2 },
  { href: "/dashboard/create-shop", label: "Create Shop", icon: Store },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const NavInner = (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Dashboard">
      {links.map(({ href, label, icon: Icon }) => {
        const p = pathname ?? "";
        const active =
          href === "/dashboard" ? p === "/dashboard" : p.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => onClose()}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-orange-500/10 font-semibold text-orange-800 ring-1 ring-orange-200/80"
                : "text-stone-600 hover:bg-orange-50/80 hover:text-stone-900"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-orange-100/80 bg-white md:flex md:flex-col md:shadow-[4px_0_24px_-12px_rgba(234,88,12,0.06)]">
        <div className="border-b border-orange-100/70 bg-gradient-to-br from-orange-50/50 to-white px-4 py-4">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-tight text-orange-600 transition hover:text-orange-700"
          >
            Karobaar.pk
          </Link>
          <p className="mt-0.5 text-xs text-stone-500">Vendor dashboard</p>
        </div>
        {NavInner}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[100] flex w-[min(100%,18rem)] flex-col border-r border-orange-100/80 bg-white shadow-[8px_0_32px_-12px_rgba(234,88,12,0.12)] md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-orange-100/70 bg-gradient-to-br from-orange-50/50 to-white px-4 py-4">
                <div>
                  <span className="font-heading text-lg font-semibold tracking-tight text-orange-600">
                    Karobaar.pk
                  </span>
                  <p className="text-xs text-stone-500">Vendor dashboard</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 hover:bg-gray-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {NavInner}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
