"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const role = roleParam === "customer" ? "customer" : "vendor";
  const { user, isReady, signup } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user)
      router.replace(role === "customer" ? "/shops" : "/dashboard");
  }, [isReady, user, router, role]);

  const isVendor = role === "vendor";

  const roleToggle = (
    <div
      className="flex rounded-2xl bg-stone-100/90 p-1 ring-1 ring-stone-200/80"
      role="tablist"
      aria-label="Account type"
    >
      <Link
        href="/signup?role=customer"
        role="tab"
        aria-selected={!isVendor}
        className={cn(
          "flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition-all",
          !isVendor
            ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-100"
            : "text-stone-600 hover:text-stone-900"
        )}
      >
        Buyer
      </Link>
      <Link
        href="/signup?role=vendor"
        role="tab"
        aria-selected={isVendor}
        className={cn(
          "flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition-all",
          isVendor
            ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-100"
            : "text-stone-600 hover:text-stone-900"
        )}
      >
        Vendor · Shop
      </Link>
    </div>
  );

  return (
    <AuthShell
      title={isVendor ? "Create your shop account" : "Create your buyer account"}
      subtitle={
        isVendor
          ? "Sign up as a vendor, then set up your shop."
          : "Sign up to browse shops and place orders."
      }
      headerExtra={roleToggle}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const fd = new FormData(e.currentTarget);
          setSubmitting(true);
          try {
            const result = await signup({
              name: String(fd.get("name") ?? ""),
              email: String(fd.get("email") ?? ""),
              password: String(fd.get("password") ?? ""),
              shopName: isVendor ? String(fd.get("shopName") ?? "") : "",
              role,
            });
            if (!result.ok) {
              setError(result.message);
              return;
            }
            router.push(role === "customer" ? "/shops" : "/dashboard");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Input label="Full name" name="name" placeholder="Your name" required />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          error={error}
        />
        {isVendor ? (
          <Input
            label="Shop name"
            name="shopName"
            placeholder="e.g. Lahore Bakers"
            required
          />
        ) : null}
        <Button variant="primary" className="w-full !py-3" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign up & continue"}
        </Button>
        <p className="text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function SignupFallback() {
  return (
    <AuthShell title="Create your account" subtitle="Loading…">
      <div className="h-40 animate-pulse rounded-xl bg-orange-100/40" />
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}
