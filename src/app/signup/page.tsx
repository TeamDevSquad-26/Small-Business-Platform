"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const { user, isReady, signup } = useAuth();

  useEffect(() => {
    if (isReady && user) router.replace("/dashboard");
  }, [isReady, user, router]);

  return (
    <AuthShell
      title="Account banayein"
      subtitle="Signup ke baad apna shop setup karein."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          signup({
            name: String(fd.get("name") ?? ""),
            email: String(fd.get("email") ?? ""),
            password: String(fd.get("password") ?? ""),
            shopName: String(fd.get("shopName") ?? ""),
          });
          router.push("/dashboard");
        }}
      >
        <Input label="Pura naam" name="name" placeholder="Aap ka naam" required />
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
        />
        <Input
          label="Shop ka naam"
          name="shopName"
          placeholder="e.g. Lahore Bakers"
          required
        />
        <Button variant="primary" className="w-full !py-3" type="submit">
          Sign up &amp; continue
        </Button>
        <p className="text-center text-sm text-muted">
          Pehle se account hai?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
