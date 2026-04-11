"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

type SubpagePlaceholderProps = {
  title: string;
  description: string;
};

export function SubpagePlaceholder({
  title,
  description,
}: SubpagePlaceholderProps) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <Card hover={false} className="p-8">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-muted">{description}</p>
          <p className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-muted">
            Demo screen — connect your real workflow here when the backend is ready.
          </p>
        </Card>
      </div>
    </div>
  );
}
