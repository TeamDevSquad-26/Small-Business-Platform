"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center mesh-hero text-stone-500">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fffbf7]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuOpen={() => setSidebarOpen(true)} />
        <div className="relative flex-1 overflow-x-auto mesh-hero">
          <div
            className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.18]"
            aria-hidden
          />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
