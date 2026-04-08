"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { user, isReady, login } = useAuth();

  useEffect(() => {
    if (isReady && user) router.replace("/dashboard");
  }, [isReady, user, router]);

  return (
    <AuthShell
      title="Login"
      subtitle="Apne Karobaar account mein dakhil hon."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") ?? "");
          const password = String(fd.get("password") ?? "");
          login(email, password);
          router.push("/dashboard");
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
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <Button variant="primary" className="w-full !py-3" type="submit">
          Login
        </Button>
        <p className="text-center text-sm text-muted">
          Demo: koi bhi email + password — dashboard open ho jayega.
        </p>
        <p className="text-center text-sm text-muted">
          Naya hain?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Create Shop / Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
