"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminRouteGuard from "./AdminRouteGuard";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { useAuthStore } from "../../store/authStore";

const ADMIN_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/doctors": "Doctors",
  "/admin/articles": "Articles",
  "/admin/users": "Users",
  "/admin/appointments": "Appointments",
  "/admin/reports": "Reports",
  "/admin/notifications": "Notifications",
  "/admin/analytics": "Analytics",
  "/admin/tools": "Tools",
};

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const title = useMemo(() => {
    return ADMIN_TITLES[pathname] ?? "Admin";
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen bg-muted/20 text-foreground">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          {user ? (
            <AdminTopbar
              title={title}
              user={user}
              onMenuToggle={() => setSidebarOpen(true)}
              onLogout={handleLogout}
            />
          ) : null}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
