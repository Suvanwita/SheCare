"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { LogOut, Menu, Moon, Search, ShieldCheck, Sun } from "lucide-react";
import type { AuthUser } from "../../services/auth.service";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface AdminTopbarProps {
  title: string;
  user: AuthUser;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export default function AdminTopbar({
  title,
  user,
  onMenuToggle,
  onLogout,
}: AdminTopbarProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuToggle}
              className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open admin sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Admin Console
              </p>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 sm:w-72">
            <span className="sr-only">Search admin modules</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search admin workspace..."
              className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/30"
            />
          </label>

          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
              )}
            </button>
          )}

          <div className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-xs font-bold text-foreground">
                {user.fullName}
              </span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Admin
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
