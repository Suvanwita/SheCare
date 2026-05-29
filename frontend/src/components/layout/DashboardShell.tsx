"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import { getDashboardPageTitle } from "../../constants/navigation";
import type { AuthUser } from "../../lib/authApi";

interface DashboardShellProps {
  children: React.ReactNode;
}

const DEMO_USER: AuthUser = {
  id: "demo-user",
  fullName: "SheCare User",
  email: "demo@shecare.local",
  role: "user",
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          title={getDashboardPageTitle(pathname)}
          user={DEMO_USER}
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
