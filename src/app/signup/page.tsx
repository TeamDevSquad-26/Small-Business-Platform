"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const { user, isReady, signup } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isReady && user) router.replace("/dashboard");
  }, [isReady, user, router]);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up, then set up your shop."
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const fd = new FormData(e.currentTarget);
          const result = await signup({
            name: String(fd.get("name") ?? ""),
            email: String(fd.get("email") ?? ""),
            password: String(fd.get("password") ?? ""),
            shopName: String(fd.get("shopName") ?? ""),
          });
          if (!result.ok) {
            setError(result.message);
            return;
          }
          router.push("/dashboard");
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
        <Input
          label="Shop name"
          name="shopName"
          placeholder="e.g. Lahore Bakers"
          required
        />
        <Button variant="primary" className="w-full !py-3" type="submit">
          Sign up &amp; continue
        </Button>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
