"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BriefcaseMedical,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  Newspaper,
  Settings2,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";

const ADMIN_NAVIGATION = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { title: "Articles", href: "/admin/articles", icon: Newspaper },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
  { title: "Reports", href: "/admin/reports", icon: FileText },
  { title: "Notifications", href: "/admin/notifications", icon: Bell },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Tools", href: "/admin/tools", icon: Settings2 },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/70 bg-card/95 shadow-xl shadow-foreground/5 backdrop-blur-xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-5">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Admin home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <BriefcaseMedical className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight text-foreground">
                SheCare Admin
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Operations
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close admin sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {ADMIN_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

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
                <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-4 rounded-3xl border border-secondary/10 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-4">
          <p className="text-xs font-bold text-foreground">Admin foundation</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Module data will connect in the next implementation pass.
          </p>
        </div>
      </aside>
    </>
  );
}
