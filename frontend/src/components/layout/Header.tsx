"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Bell, Menu, Sparkles, User } from "lucide-react";
import { LANDING_NAV_ITEMS, NAVIGATION_ITEMS } from "../../constants";
import { cn } from "../../lib/utils";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const headerNavItems = [
    { title: "Home", href: "/" },
    ...NAVIGATION_ITEMS,
    ...LANDING_NAV_ITEMS.filter((item) => item.href !== "/dashboard"),
  ];

  const isActive = (href: string) => href === pathname;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/" className="flex items-center gap-2" aria-label="SheCare home">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5 fill-white/20" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SheCare
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase border border-border px-1.5 py-0.5 rounded-md">
                v1.0
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden xl:flex items-center gap-1 rounded-2xl border border-border/60 bg-card/70 p-1 text-xs font-bold text-muted-foreground">
          {headerNavItems.map((item) => (
            <Link
              key={`${item.title}-${item.href}`}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2 transition-colors hover:text-foreground",
                isActive(item.href) && "bg-muted text-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right Side: Quick Action Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all duration-200 hover:bg-muted"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ y: 8, opacity: 0, rotate: 45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -8, opacity: 0, rotate: -45 }}
                  transition={{ duration: 0.15 }}
                >
                  <Sun className="h-5 w-5 text-amber-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ y: 8, opacity: 0, rotate: -45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -8, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                >
                  <Moon className="h-5 w-5 text-indigo-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all duration-200 hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
            </button>

            {/* Notification Dropdown Container */}
            <AnimatePresence>
              {notificationsOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 z-40 w-80 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/5 focus:outline-none"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                      <h4 className="font-semibold text-sm">Notifications</h4>
                      <span className="text-xs text-primary font-medium hover:underline cursor-pointer">Mark all as read</span>
                    </div>
                    
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-3 text-xs p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                          ⚡
                        </div>
                        <div>
                          <p className="font-semibold">Luteal Phase Activity Sync</p>
                          <p className="text-muted-foreground mt-0.5">Your body is in the Luteal phase. Pilates and low stress forms of workouts are recommended today.</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">10m ago</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 text-xs p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          💧
                        </div>
                        <div>
                          <p className="font-semibold">Hydration Check-in</p>
                          <p className="text-muted-foreground mt-0.5">You are 700ml away from your daily goal. Take a quick sip!</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">2h ago</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 border-l border-border/80 pl-3 sm:pl-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold">Sophia Sterling</span>
              <span className="text-[10px] text-muted-foreground font-medium">Luteal Phase • Day 22</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200">
              <User className="h-5 w-5" />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
