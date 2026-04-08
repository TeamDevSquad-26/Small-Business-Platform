"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";

type TopbarProps = {
  onMenuOpen: () => void;
};

export function Topbar({ onMenuOpen }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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

      <div className="relative min-w-0 flex-1 max-w-md">
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
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-muted transition-colors hover:bg-gray-100 hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
            3
          </span>
        </button>

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
