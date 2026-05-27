"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, X } from "lucide-react";
import { DASHBOARD_NAVIGATION } from "../../constants/navigation";
import { cn } from "../../lib/utils";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-card/95 shadow-xl shadow-foreground/5 backdrop-blur-xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link href="/" className="flex items-center gap-2" aria-label="SheCare home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SheCare
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {DASHBOARD_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200",
                  isActive
                    ? "border-primary/20 bg-gradient-to-r from-primary/12 to-secondary/12 text-primary shadow-sm"
                    : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-4 rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-4">
          <p className="text-xs font-bold text-foreground">Care workspace</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Mock protected mode is active until the backend auth flow is connected.
          </p>
        </div>
      </aside>
    </>
  );
}
