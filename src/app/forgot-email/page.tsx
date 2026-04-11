"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { getFirebaseConfigurationHelpMessage } from "@/lib/firebase/env";

export default function ForgotEmailPage() {
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) router.replace("/dashboard");
  }, [isReady, user, router]);

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you used for your account. We’ll send a link to reset your password."
    >
      {success ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-ink">
            If an account exists for that email, you’ll receive a message with reset
            instructions shortly. Check your inbox and spam folder.
          </p>
          <Button
            variant="primary"
            className="w-full !py-3"
            type="button"
            onClick={() => router.push("/login")}
          >
            Back to log in
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setSuccess(false);

            if (!isFirebaseConfigured || !auth) {
              setError(getFirebaseConfigurationHelpMessage());
              return;
            }

            const fd = new FormData(e.currentTarget);
            const email = String(fd.get("email") ?? "").trim().toLowerCase();
            if (!email) {
              setError("Please enter your email address.");
              return;
            }

            setSubmitting(true);
            try {
              await sendPasswordResetEmail(auth, email);
            } catch {
              // Don’t reveal whether the email exists (avoid account enumeration).
            } finally {
              setSubmitting(false);
            }
            setSuccess(true);
          }}
        >
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            error={error}
          />
          <Button
            variant="primary"
            className="w-full !py-3"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-muted">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
