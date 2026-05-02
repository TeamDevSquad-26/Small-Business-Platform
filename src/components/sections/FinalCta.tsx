import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section
      className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-secondary/[0.12] via-background to-primary/[0.08] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="final-cta-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          Ready to launch
        </p>
        <h2
          id="final-cta-heading"
          className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
        >
          Ready to put your shop in one link?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Create your Karobaar storefront in minutes, or browse shops that are already live.
        </p>
        <div className="mx-auto mt-5 grid max-w-2xl gap-2.5 text-sm text-ink/90 sm:grid-cols-3">
          <p className="rounded-xl border border-gray-200/80 bg-white/80 px-3 py-2">
            Seller onboarding in minutes
          </p>
          <p className="rounded-xl border border-gray-200/80 bg-white/80 px-3 py-2">
            Trust-first buyer checkout
          </p>
          <p className="rounded-xl border border-gray-200/80 bg-white/80 px-3 py-2">
            Built for mobile traffic
          </p>
        </div>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary px-8 py-3.5 text-base font-semibold text-white shadow-soft transition-shadow hover:shadow-soft-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            Create your shop
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/shops"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white/90 px-8 py-3.5 text-base font-semibold text-ink shadow-soft backdrop-blur-sm transition-colors hover:border-gray-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            Browse shops
          </Link>
        </div>
      </div>
    </section>
  );
}
