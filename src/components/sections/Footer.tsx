import Link from "next/link";

const footerLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Create Shop" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-ink px-4 py-14 text-gray-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr] md:gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="text-center md:text-left">
          <p className="text-lg font-bold text-white">Karobaar</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">
            A modern commerce stack for small businesses — launch fast, scale
            with confidence.
          </p>
        </div>
        <nav
          className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 md:items-start md:justify-end"
          aria-label="Footer"
        >
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-center text-xs">
        © {new Date().getFullYear()} Karobaar. All rights reserved.
      </p>
    </footer>
  );
}
