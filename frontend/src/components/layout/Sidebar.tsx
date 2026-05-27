"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { NAVIGATION_ITEMS } from "../../constants";
import * as Icons from "lucide-react";
import { Heart, ChevronLeft, Sparkles } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-border/40 bg-card/90 backdrop-blur-md transition-all duration-300 md:sticky md:top-0 md:h-[calc(100vh)]",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header Branding (Mobile Close Button) */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-white shadow-sm">
              <Heart className="h-4.5 w-4.5 fill-white/20" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              SheCare
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted md:hidden"
            aria-label="Close menu"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {NAVIGATION_ITEMS.map((item) => {
            // Dynamically lookup the Lucide icon from its name
            const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.iconName] || Icons.HelpCircle;
            const isActive = item.href === pathname;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-2 border-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                )}
              >
                <IconComponent
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Premium Bottom Sidebar Box */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent border border-primary/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Self-Care Focus</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
            {"\"Your body listens to everything your mind says. Keep nourishing it.\""}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-semibold">Streak</span>
            <span className="text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full">
              🔥 12 Days
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
