"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function safeInternalPath(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const p = decodeURIComponent(raw).trim();
    if (!p.startsWith("/") || p.startsWith("//")) return null;
    return p;
  } catch {
    return null;
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl");
  const { user, isReady, login } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace(safeInternalPath(returnUrl ?? null) ?? "/dashboard");
    }
  }, [isReady, user, router, returnUrl]);

  return (
    <AuthShell
      title="Log in"
      subtitle="Sign in to your Karobaar account."
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") ?? "");
          const password = String(fd.get("password") ?? "");
          const result = await login(email, password);
          if (!result.ok) {
            setError(result.message);
            return;
          }
          router.push(safeInternalPath(returnUrl ?? null) ?? "/dashboard");
        }}
      >
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <div className="space-y-1.5">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            error={error}
          />
          <p className="text-right text-sm">
            <Link
              href="/forgot-email"
              className="font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
        <Button variant="primary" className="w-full !py-3" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Log in"}
        </Button>
        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Create a shop / Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mesh-hero flex min-h-screen items-center justify-center px-4 py-12">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-orange-200/50" aria-hidden />
          <span className="sr-only">Loading</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
