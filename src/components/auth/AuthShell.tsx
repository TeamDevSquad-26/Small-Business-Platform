import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-surface p-8 shadow-soft-lg">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-primary"
            >
              Karobaar
            </Link>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
