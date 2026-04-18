import Link from "next/link";

const explore = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/shops", label: "Browse shops" },
];

const account = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Create shop" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink px-4 py-16 text-gray-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr_1fr] md:gap-10 lg:gap-14">
        <div className="text-center md:text-left">
          <p className="font-heading text-2xl font-semibold tracking-tight text-white">
            Karobaar
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Shops for vendors, discovery for buyers one platform for local commerce
            and small brands.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Explore
          </p>
          <nav className="mt-4 flex flex-col gap-2.5" aria-label="Explore">
            {explore.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-300 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Account
          </p>
          <nav className="mt-4 flex flex-col gap-2.5" aria-label="Account">
            {account.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-300 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <p className="mx-auto mt-14 max-w-6xl border-t border-white/10 pt-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Karobaar. All rights reserved.
      </p>
    </footer>
  );
}
