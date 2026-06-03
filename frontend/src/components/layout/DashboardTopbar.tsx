"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserCircle,
} from "lucide-react";
import type { AuthUser } from "../../services/auth.service";
import { cn } from "../../lib/utils";
import { useNotificationStore } from "../../store/notificationStore";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface DashboardTopbarProps {
  title: string;
  user: AuthUser;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export default function DashboardTopbar({ title, user, onMenuToggle, onLogout }: DashboardTopbarProps) {
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const notificationsLoading = useNotificationStore((state) => state.isLoading);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    fetchNotifications({ page: 1, limit: 10 });
  }, [fetchNotifications]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuToggle}
              className="rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Dashboard
              </p>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 sm:w-72">
            <span className="sr-only">Search dashboard</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search health records..."
              className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-primary/70 focus:ring-1 focus:ring-primary/30"
            />
          </label>

          <div className="hidden items-center gap-2 lg:flex">
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
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((current) => !current)}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close notifications"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-2 shadow-xl shadow-foreground/5">
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="text-xs font-black text-foreground">Notifications</p>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {unreadCount} unread
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => markAllRead()}
                      disabled={unreadCount === 0}
                      className="rounded-xl px-2 py-1 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:text-muted-foreground"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto px-1 pb-1">
                    {notificationsLoading && (
                      <p className="rounded-xl px-3 py-3 text-xs font-bold text-muted-foreground">
                        Loading notifications...
                      </p>
                    )}

                    {!notificationsLoading &&
                      notifications.slice(0, 6).map((notification) => (
                        <button
                          type="button"
                          key={notification._id}
                          onClick={() => markRead(notification._id)}
                          className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted"
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                              notification.isRead
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-black text-foreground">
                              {notification.title}
                            </span>
                            {notification.message && (
                              <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-muted-foreground">
                                {notification.message}
                              </span>
                            )}
                          </span>
                        </button>
                      ))}

                    {!notificationsLoading && notifications.length === 0 && (
                      <p className="rounded-xl px-3 py-3 text-xs font-bold text-muted-foreground">
                        No notifications yet.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className="flex h-11 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 text-left transition-colors hover:bg-muted sm:w-auto"
              aria-expanded={profileOpen}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCircle className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-foreground">
                    {user.fullName}
                  </span>
                  <span className="block truncate text-[10px] font-semibold text-muted-foreground">
                    {user.role === "doctor" ? "Doctor" : "User"}
                  </span>
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-foreground/5">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-foreground">{user.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="hidden h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive xl:flex"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
