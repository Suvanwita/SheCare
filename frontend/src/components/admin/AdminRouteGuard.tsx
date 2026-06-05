"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    fetchMe()
      .then(() => {
        const currentUser = useAuthStore.getState().user;

        if (currentUser?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setHasCheckedSession(true);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [fetchMe, hasHydrated, isAuthenticated, router]);

  if (
    !hasHydrated ||
    !hasCheckedSession ||
    isLoading ||
    !isAuthenticated ||
    !user ||
    user.role !== "admin"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <div className="glass-card flex items-center gap-3 rounded-lg px-5 py-4 text-sm font-bold text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Verifying admin access...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
