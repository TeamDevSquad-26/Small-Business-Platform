"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/shops", label: "Shops" },
  { href: "/login", label: "Login" },
];

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
          "sticky top-0 z-50 border-b backdrop-blur-md transition-[box-shadow,background-color,border-color] duration-300",
          scrolled
            ? "border-gray-200 bg-background/95 shadow-md"
            : "border-gray-200/80 bg-background/90 shadow-sm"
        )}
      >
        <div className="mx-auto flex h-[5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[5.5rem] sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-w-0 shrink-0 items-center rounded-lg bg-transparent px-1 py-1 transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/karobaar-logo.png"
              alt="Karobaar"
              width={480}
              height={131}
              priority
              sizes="(max-width: 768px) 250px 340px"
              className="h-[3.75rem] w-auto max-w-[min(320px,74vw)] bg-transparent object-contain object-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)] sm:h-[4.25rem] md:max-w-[min(360px,40vw)]"
            />
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex md:gap-2 lg:gap-3 xl:gap-5"
            aria-label="Main"
          >
            {navLinks
              .filter((item) => !(user && item.href === "/login"))
              .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-2 text-sm font-medium text-muted underline-offset-4 transition-colors hover:bg-gray-100 hover:text-ink hover:underline lg:px-3"
              >
                {item.label}
              </Link>
            ))}
            {isReady && user ? (
              <>
                <Link
                  href="/my-orders"
                  className="rounded-lg px-2 py-2 text-sm font-medium text-muted underline-offset-4 transition-colors hover:bg-gray-100 hover:text-ink hover:underline lg:px-3"
                >
                  My orders
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-2 py-2 text-sm font-medium text-muted underline-offset-4 transition-colors hover:bg-gray-100 hover:text-ink hover:underline lg:px-3"
                >
                  Dashboard
                </Link>
              </>
            ) : null}
            <LinkButton
              href="/signup"
              variant="primary"
              className="!ml-1 !px-4 !py-2 text-sm lg:!ml-3"
            >
              Create Shop
            </LinkButton>
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <LinkButton
              href="/signup"
              variant="primary"
              className="!px-3 !py-2 text-xs sm:text-sm"
            >
              Create Shop
            </LinkButton>
            <button
              type="button"
              className="rounded-xl p-2 text-ink hover:bg-gray-100"
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
              className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-gray-100 bg-surface shadow-soft-lg"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <span className="font-semibold text-ink">Menu</span>
                <button
                  type="button"
                  className="rounded-xl p-2 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Mobile">
                {navLinks
                  .filter((item) => !(user && item.href === "/login"))
                  .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {isReady && user ? (
                  <>
                    <Link
                      href="/my-orders"
                      className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      My orders
                    </Link>
                    <Link
                      href="/dashboard"
                      className="rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </>
                ) : null}
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <Link
                    href="/signup"
                    className="block rounded-xl bg-secondary px-3 py-3 text-center text-sm font-semibold text-white shadow-soft hover:bg-secondary/90"
                    onClick={() => setOpen(false)}
                  >
                    Create Shop
                  </Link>
                </div>
              </nav>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
