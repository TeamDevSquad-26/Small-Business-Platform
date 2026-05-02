"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";

const navLinkClass =
  "rounded-lg px-2 py-2 text-sm font-medium text-stone-700 underline-offset-4 transition-colors hover:bg-orange-50 hover:text-stone-900 hover:underline lg:px-3";

/** Solid orange CTA — explicit classes so brand + buttons match clearly on white header */
const orangeBtn =
  "bg-orange-600 text-white shadow-[0_8px_24px_-8px_rgba(234,88,12,0.45)] hover:bg-orange-700";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isReady } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-orange-100/80 bg-white backdrop-blur-xl transition-[box-shadow] duration-300",
          scrolled ? "shadow-[0_8px_24px_-12px_rgba(234,88,12,0.08)]" : "shadow-none"
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="-ml-1 inline-flex min-w-0 shrink-0 items-center rounded-lg px-2 py-1 font-heading text-xl font-semibold tracking-tight text-orange-600 transition-colors hover:text-orange-700 sm:text-2xl"
          >
            Karobaar.pk
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex md:gap-2 lg:gap-3 xl:gap-5"
            aria-label="Main"
          >
            <Link href="/#about" className={navLinkClass}>
              About
            </Link>
            <Link href="/#features" className={navLinkClass}>
              Features
            </Link>
            <Link href="/shops" className={navLinkClass}>
              Browse shops
            </Link>
            {!user ? (
              <Link href="/login" className={navLinkClass}>
                Login
              </Link>
            ) : null}
            {isReady && user ? (
              <>
                <Link href="/my-orders" className={navLinkClass}>
                  My orders
                </Link>
                <Link href="/dashboard" className={navLinkClass}>
                  Dashboard
                </Link>
              </>
            ) : null}
            {!user ? (
              <div className="group/signup relative ml-1 lg:ml-3">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition",
                    orangeBtn,
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                  )}
                  aria-haspopup="menu"
                  aria-label="Sign up — customer or vendor"
                >
                  Sign up
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/signup:rotate-180 group-focus-within/signup:rotate-180"
                    aria-hidden
                  />
                </button>
                <div
                  role="menu"
                  aria-label="Sign up as"
                  className="invisible absolute right-0 top-full z-50 min-w-[14rem] pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover/signup:visible group-hover/signup:opacity-100 group-focus-within/signup:visible group-focus-within/signup:opacity-100"
                >
                  <div className="overflow-hidden rounded-xl border border-orange-100 bg-white p-1.5 shadow-[0_16px_48px_-12px_rgba(234,88,12,0.22)]">
                    <Link
                      href="/signup?role=customer"
                      role="menuitem"
                      className={cn(
                        "block rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition",
                        orangeBtn
                      )}
                    >
                      Sign up as a customer
                    </Link>
                    <Link
                      href="/signup?role=vendor"
                      role="menuitem"
                      className={cn(
                        "mt-1.5 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition",
                        orangeBtn
                      )}
                    >
                      Sign up as a vendor
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </nav>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="rounded-xl p-2.5 text-ink hover:bg-orange-50"
              aria-expanded={open}
              aria-controls="mobile-drawer"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-drawer"
            id="mobile-drawer"
            className="fixed inset-0 z-[100] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute right-0 top-0 flex h-full w-[min(100%,21rem)] flex-col border-l border-orange-100 bg-surface shadow-[0_0_40px_-12px_rgba(234,88,12,0.15)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-orange-100 px-4 py-4">
                <span className="font-semibold text-ink">Menu</span>
                <button
                  type="button"
                  className="rounded-xl p-2 hover:bg-orange-50"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Mobile">
                <Link
                  href="/#about"
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-orange-50"
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/#features"
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-orange-50"
                  onClick={() => setOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/shops"
                  className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-orange-50"
                  onClick={() => setOpen(false)}
                >
                  Browse shops
                </Link>
                {!user ? (
                  <Link
                    href="/login"
                    className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-orange-50"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                ) : null}
                {isReady && user ? (
                  <>
                    <Link
                      href="/my-orders"
                      className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-orange-50"
                      onClick={() => setOpen(false)}
                    >
                      My orders
                    </Link>
                    <Link
                      href="/dashboard"
                      className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-orange-50"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </>
                ) : null}
                {!user ? (
                  <div className="mt-3 border-t border-orange-100 pt-3">
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                      Sign up
                    </p>
                    <Link
                      href="/signup?role=customer"
                      className={cn(
                        "block rounded-xl px-3 py-3 text-center text-sm font-semibold text-white transition",
                        orangeBtn
                      )}
                      onClick={() => setOpen(false)}
                    >
                      Sign up as a customer
                    </Link>
                    <Link
                      href="/signup?role=vendor"
                      className={cn(
                        "mt-1 block rounded-xl px-3 py-3 text-center text-sm font-semibold text-white transition",
                        orangeBtn
                      )}
                      onClick={() => setOpen(false)}
                    >
                      Sign up as a vendor
                    </Link>
                  </div>
                ) : null}
              </nav>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
