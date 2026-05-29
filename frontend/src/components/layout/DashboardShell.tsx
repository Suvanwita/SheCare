"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import { getDashboardPageTitle } from "../../constants/navigation";
import { getCurrentUser, logout, type AuthUser } from "../../lib/authApi";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!active) {
          return;
        }

        setUser(currentUser);
        setAuthStatus("authenticated");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setAuthStatus("unauthenticated");
        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAuthStatus("unauthenticated");
    router.replace("/login");
  };

  if (authStatus !== "authenticated" || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="glass-card rounded-3xl border border-border/60 p-6 text-center shadow-lg shadow-foreground/5">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold">Checking your SheCare session...</p>
          <p className="mt-1 text-xs text-muted-foreground">Redirecting to sign in if needed.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          title={getDashboardPageTitle(pathname)}
          user={user}
          onMenuToggle={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
