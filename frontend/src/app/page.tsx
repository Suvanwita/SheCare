"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Heart,
  HeartPulse,
  Lock,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  X,
} from "lucide-react";
import { LANDING_NAV_ITEMS } from "../constants";
import { cn } from "../lib/utils";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const featureCards = [
  {
    icon: CalendarDays,
    title: "Cycle Tracker",
    description: "Track period dates, flow intensity, trends, and predicted windows.",
    href: "/dashboard/cycle",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    icon: HeartPulse,
    title: "Health Logs",
    description: "Capture symptoms, mood, sleep, hydration, weight, and notes.",
    href: "/dashboard/health-logs",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Manage medicines, appointments, cycle reminders, and check-ins.",
    href: "/dashboard/reminders",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: CalendarCheck,
    title: "Appointments",
    description: "Search doctors, book visits, and organize upcoming consultations.",
    href: "/dashboard/appointments",
    color: "text-sky-500 bg-sky-500/10",
  },
  {
    icon: FileText,
    title: "Medical Reports",
    description: "Upload, filter, preview, and organize health documents.",
    href: "/dashboard/reports",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics & PCOS Risk",
    description: "Visualize wellness patterns and run informational risk assessments.",
    href: "/dashboard/analytics",
    color: "text-pink-500 bg-pink-500/10",
  },
];

const journeySteps = [
  "Log daily health signals",
  "Review patterns in one place",
  "Prepare better doctor visits",
  "Act on gentle reminders",
];

const previewRows = [
  { label: "Cycle day", value: "22", accent: "bg-rose-500" },
  { label: "Sleep score", value: "82%", accent: "bg-indigo-500" },
  { label: "Hydration", value: "1.8L", accent: "bg-sky-500" },
];

const revealUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const staggerGrid = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-border/70 bg-background/85 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-background/70 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="SheCare home">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">SheCare</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl border border-border/70 bg-card/70 p-1 text-xs font-bold text-muted-foreground md:flex">
            {LANDING_NAV_ITEMS.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600" />
                )}
              </button>
            )}
            <Link
              href="/login"
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-bold text-background transition hover:opacity-90"
            >
              Get Started
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-lg border border-border bg-card p-2 text-muted-foreground"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border bg-card px-4 py-4 md:hidden"
            >
              <div className="flex flex-col gap-2 text-sm font-bold text-muted-foreground">
                {[...LANDING_NAV_ITEMS.slice(0, 3), { title: "Login", href: "/login" }, { title: "Register", href: "/register" }].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2 hover:bg-muted hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="px-4 pb-16 pt-10 sm:px-6 md:pb-20 md:pt-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
                <Heart className="h-4 w-4" />
                One calm workspace for women’s health
              </div>

              <h1 className="mt-6 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                SheCare
                <span className="mt-2 block bg-gradient-to-r from-primary via-secondary to-rose-500 bg-clip-text text-transparent">
                  turns daily signals into care-ready clarity.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                Track cycles, symptoms, reports, reminders, appointments, analytics, and PCOS risk
                checks from a single private dashboard.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/15 transition hover:opacity-95 sm:w-auto"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-black text-foreground shadow-sm transition hover:bg-muted sm:w-auto"
                >
                  Login
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, rotateX: 1.5, rotateY: -1.5 }}
              className="rounded-[2rem] border border-border/70 bg-card p-3 shadow-2xl shadow-foreground/5"
            >
              <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background">
                <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {["bg-rose-400", "bg-amber-400", "bg-emerald-400"].map((color, index) => (
                      <motion.span
                        key={color}
                        animate={{ scale: [1, 1.25, 1] }}
                        transition={{
                          duration: 1.8,
                          delay: index * 0.25,
                          repeat: Infinity,
                          repeatDelay: 2.4,
                        }}
                        className={cn("h-2.5 w-2.5 rounded-full", color)}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">Live dashboard preview</span>
                </div>

                <div className="grid gap-4 p-4 sm:grid-cols-[0.75fr_1fr]">
                  <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-5 text-white">
                    <p className="text-xs font-bold uppercase text-white/75">Current cycle</p>
                    <motion.p
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35, type: "spring", stiffness: 130, damping: 12 }}
                      className="mt-3 text-5xl font-black"
                    >
                      22
                    </motion.p>
                    <p className="mt-1 text-sm font-semibold text-white/85">Day of 28</p>
                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/25">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "78%" }}
                        transition={{ delay: 0.5, duration: 1.1, ease: "easeOut" }}
                        className="h-full rounded-full bg-white"
                      />
                    </div>
                  </div>

                  <motion.div
                    variants={staggerGrid}
                    initial="hidden"
                    animate="show"
                    className="grid gap-3"
                  >
                    {previewRows.map((row) => (
                      <motion.div
                        key={row.label}
                        variants={revealUp}
                        transition={{ type: "spring", stiffness: 120, damping: 16 }}
                        className="rounded-2xl border border-border/70 bg-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.span
                              animate={{ opacity: [0.55, 1, 0.55] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={cn("h-2.5 w-2.5 rounded-full", row.accent)}
                            />
                            <span className="text-xs font-bold uppercase text-muted-foreground">{row.label}</span>
                          </div>
                          <span className="text-lg font-black text-foreground">{row.value}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <motion.div
                  variants={staggerGrid}
                  initial="hidden"
                  animate="show"
                  className="grid gap-4 border-t border-border/70 p-4 md:grid-cols-3"
                >
                  <motion.div variants={revealUp} className="rounded-2xl border border-border/70 bg-card p-4">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-black">Symptoms</p>
                    <p className="mt-1 text-xs text-muted-foreground">Cramps, fatigue, acne</p>
                  </motion.div>
                  <motion.div variants={revealUp} className="rounded-2xl border border-border/70 bg-card p-4">
                    <Stethoscope className="h-5 w-5 text-secondary" />
                    <p className="mt-3 text-sm font-black">Next visit</p>
                    <p className="mt-1 text-xs text-muted-foreground">Dr. Meera, Fri 11:30</p>
                  </motion.div>
                  <motion.div variants={revealUp} className="rounded-2xl border border-border/70 bg-card p-4">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    <p className="mt-3 text-sm font-black">Wellness score</p>
                    <p className="mt-1 text-xs text-muted-foreground">84, improving</p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="border-y border-border/60 bg-muted/20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-primary">Your health toolkit</p>
                <h2 className="mt-2 max-w-2xl font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Everything you need to track, plan, and understand your wellness.
                </h2>
              </div>
              <Link href="/dashboard" className="text-sm font-black text-primary hover:underline">
                Explore dashboard
              </Link>
            </div>

            <motion.div
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={revealUp}
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 180, damping: 18 }}
                  >
                    <Link
                      href={feature.href}
                      className="group block h-full rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <motion.div
                          whileHover={{ rotate: -6, scale: 1.08 }}
                          className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", feature.color)}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                      <h3 className="mt-5 text-base font-black text-foreground">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-secondary">How it works</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                A calmer loop for personal health tracking.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                The interface is designed for repeated use: quick logging, readable trends,
                practical reminders, and useful context before appointments.
              </p>
            </div>

            <motion.div
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step}
                  variants={revealUp}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm"
                >
                  <span className="text-3xl font-black text-primary/25">0{index + 1}</span>
                  <p className="mt-4 text-sm font-black text-foreground">{step}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="privacy" className="border-y border-border/60 bg-muted/20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-500">Privacy first</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground">
                Sensitive health data deserves a serious interface.
              </h2>
            </div>

            {[
              {
                icon: ShieldCheck,
                title: "Local mock auth for now",
                desc: "Authentication stays frontend-only until the backend is intentionally added.",
              },
              {
                icon: Lock,
                title: "No backend calls",
                desc: "Current dashboard pages use local state and mock data while the product shape matures.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
                >
                  <Icon className="h-6 w-6 text-emerald-500" />
                  <h3 className="mt-5 text-base font-black text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="mx-auto max-w-3xl rounded-[2rem] border border-border/70 bg-card p-8 shadow-sm"
          >
            <CheckCircle2 className="mx-auto h-9 w-9 text-primary" />
            <h2 className="mt-5 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Start with the dashboard, refine as the product grows.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Login or register to enter the protected mock dashboard and try the new modules.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-2xl bg-foreground px-6 py-3 text-sm font-black text-background transition hover:opacity-90"
              >
                Register
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-border bg-background px-6 py-3 text-sm font-black text-foreground transition hover:bg-muted"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-black text-foreground">SheCare</span>
          </div>
          <p>Frontend prototype for cycle, wellness, appointments, reports, analytics, and PCOS risk.</p>
        </div>
      </footer>
    </div>
  );
}
