import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  /** Extra block under subtitle (e.g. signup role toggle) */
  headerExtra?: ReactNode;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, headerExtra, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen mesh-hero px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.22]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 rounded-xl px-1 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-orange-50/80 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-orange-600/90" aria-hidden />
          Back to home
        </Link>

        <div className="overflow-hidden rounded-3xl border border-orange-100/90 bg-white shadow-[0_24px_65px_-28px_rgba(234,88,12,0.18),0_8px_24px_-12px_rgba(28,25,23,0.08)]">
          <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" aria-hidden />

          <div className="px-6 pb-8 pt-7 sm:px-9 sm:pb-9 sm:pt-8">
            <div className="mb-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl outline-none ring-orange-500/0 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                <Image
                  src="/karobaar-logo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="size-9 shrink-0 rounded-lg object-contain sm:size-10"
                  priority
                />
                <span className="font-heading text-xl font-semibold tracking-tight text-orange-600 sm:text-2xl">
                  Karobaar.pk
                </span>
              </Link>
              <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.65rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-pretty text-sm leading-relaxed text-stone-600">{subtitle}</p>
              ) : null}
              {headerExtra ? <div className="mt-5">{headerExtra}</div> : null}
            </div>
            {children}
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-stone-500">
          Secure sign-in · Built for shops and buyers across Pakistan
        </p>
      </div>
    </div>
  );
}
