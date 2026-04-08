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
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuOpen={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
