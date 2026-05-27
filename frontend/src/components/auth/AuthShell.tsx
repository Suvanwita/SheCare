"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { HeartPulse, Moon, Sun } from "lucide-react";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
}

export default function AuthShell({
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLinkText,
}: AuthShellProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute right-0 top-0 -z-10 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-primary/25 to-secondary/25 opacity-30 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 opacity-20 blur-3xl" />

      <section className="glass-card w-full max-w-md rounded-3xl border border-border/60 p-6 shadow-xl shadow-foreground/5 sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" aria-label="SheCare home">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SheCare
            </span>
          </Link>

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

        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight font-display">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link href={footerHref} className="font-bold text-primary hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </section>
    </main>
  );
}
