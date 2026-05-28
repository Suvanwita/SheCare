"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import CountUp from "react-countup";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
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
import CycleSimulator from "../components/landing/CycleSimulator";
import { cn } from "../lib/utils";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const revealUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const featureCards = [
  {
    icon: CalendarDays,
    title: "Cycle Tracker",
    description: "Track period dates, flow, predicted windows, and cycle irregularity insights.",
    href: "/dashboard/cycle",
    gradient: "from-rose-500/18 via-pink-400/10 to-transparent",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    icon: HeartPulse,
    title: "Health Logs",
    description: "Capture symptoms, mood, sleep, hydration, weight, pain, and personal notes.",
    href: "/dashboard/health-logs",
    gradient: "from-emerald-500/18 via-teal-400/10 to-transparent",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Keep medication, appointment, cycle, and wellness reminders in one calm place.",
    href: "/dashboard/reminders",
    gradient: "from-amber-500/20 via-orange-300/10 to-transparent",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: CalendarCheck,
    title: "Appointments",
    description: "Organize upcoming visits and keep context ready for every consultation.",
    href: "/dashboard/appointments",
    gradient: "from-sky-500/18 via-cyan-300/10 to-transparent",
    color: "text-sky-500 bg-sky-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Private Records",
    description: "Upload and review reports, care notes, and documents with less friction.",
    href: "/dashboard/reports",
    gradient: "from-violet-500/18 via-fuchsia-300/10 to-transparent",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: Activity,
    title: "Risk Insights",
    description: "Run informational PCOS and cycle irregularity checks from dedicated ML services.",
    href: "/dashboard/pcos-risk",
    gradient: "from-pink-500/18 via-rose-300/10 to-transparent",
    color: "text-pink-500 bg-pink-500/10",
  },
];

const journeySteps = [
  {
    day: "Day 1",
    title: "Period Started",
    description: "Log flow, pain, and quick notes as the cycle begins.",
  },
  {
    day: "Day 5",
    title: "Symptoms Logged",
    description: "Track energy, mood, hydration, and recurring symptoms.",
  },
  {
    day: "Day 14",
    title: "Fertile Window Insight",
    description: "Review estimated fertile timing and cycle context.",
  },
  {
    day: "Day 24",
    title: "Medication Reminder",
    description: "Stay consistent with care routines and appointments.",
  },
  {
    day: "Day 28",
    title: "Next Cycle Prediction",
    description: "See the next expected period date and changing patterns.",
  },
];

const testimonials = [
  {
    name: "Ananya R.",
    role: "Product designer, Bengaluru",
    text: "SheCare makes my cycle notes, symptoms, and reminders feel organized instead of scattered across apps and screenshots.",
  },
  {
    name: "Maya S.",
    role: "Graduate student, Pune",
    text: "The dashboard gives me a calmer way to spot patterns before appointments. It feels practical and respectful.",
  },
  {
    name: "Dr. Neha Kapoor",
    role: "Gynecology resident",
    text: "A timeline like this can help patients bring clearer context to consultations without overcomplicating daily tracking.",
  },
];

function AnimatedBlob({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{
        x: [0, 28, -12, 0],
        y: [0, -18, 24, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{
        duration: 14,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "pointer-events-none absolute rounded-[45%] blur-3xl",
        className
      )}
    />
  );
}

function HeroHealthPreview({
  mouseX,
  mouseY,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
}) {
  const x = useTransform(mouseX, [-0.5, 0.5], [18, -18]);
  const y = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);
  const smoothX = useSpring(x, { stiffness: 80, damping: 18 });
  const smoothY = useSpring(y, { stiffness: 80, damping: 18 });

  return (
    <motion.div
      style={{ x: smoothX, y: smoothY }}
      initial={{ opacity: 0, y: 34, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="relative mx-auto max-w-xl rounded-[2rem] border border-white/60 bg-white/65 p-3 shadow-2xl shadow-rose-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10"
    >
      <motion.div
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -inset-1 rounded-[2.2rem] bg-gradient-to-r from-rose-400/25 via-sky-400/20 to-emerald-400/25 blur-xl"
      />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/95">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            {["bg-rose-400", "bg-amber-400", "bg-emerald-400"].map((color, index) => (
              <motion.span
                key={color}
                animate={{ scale: [1, 1.28, 1] }}
                transition={{ duration: 1.7, delay: index * 0.24, repeat: Infinity, repeatDelay: 2.4 }}
                className={cn("h-2.5 w-2.5 rounded-full", color)}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-muted-foreground">Live Health Preview</span>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[0.82fr_1fr]">
          <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-violet-500 p-5 text-white">
            <p className="text-xs font-bold uppercase text-white/75">Cycle Progress</p>
            <div className="mt-5 flex items-center justify-center">
              <div className="relative h-36 w-36">
                <svg className="h-full w-full -rotate-90">
                  <circle cx="72" cy="72" r="56" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="12" />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="56"
                    fill="none"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 56}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: (1 - 0.78) * 2 * Math.PI * 56 }}
                    transition={{ duration: 1.5, delay: 0.35, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">22</span>
                  <span className="text-xs font-bold text-white/75">Day Of 28</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Cramps", "Calm Mood", "Hydrated"].map((badge, index) => (
                <motion.span
                  key={badge}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, delay: index * 0.35, repeat: Infinity }}
                  className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-bold text-white"
                >
                  {badge}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-3xl border border-border/70 bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Heart Rate</p>
                  <p className="mt-1 text-2xl font-black text-foreground">76 bpm</p>
                </div>
                <HeartPulse className="h-6 w-6 text-rose-500" />
              </div>
              <svg viewBox="0 0 220 70" className="mt-3 h-16 w-full">
                <motion.path
                  d="M4 42 C 30 42, 34 20, 52 42 S 78 62, 96 35 S 124 18, 142 40 S 174 62, 216 26"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
              </svg>
            </div>

            <motion.div
              initial={{ x: 42, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.55 }}
              className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
                  <Bell className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-foreground">Reminder In 20 Min</p>
                  <p className="mt-1 text-xs text-muted-foreground">Iron supplement and water check-in</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-border/70 bg-card p-4">
                <p className="text-xs font-bold text-muted-foreground">PCOS Risk</p>
                <p className="mt-2 text-3xl font-black text-foreground">
                  <CountUp end={32} duration={2.4} enableScrollSpy />%
                </p>
                <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">Low</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground">Calendar</p>
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {Array.from({ length: 21 }).map((_, index) => (
                    <motion.span
                      key={index}
                      animate={index === 14 ? { scale: [1, 1.35, 1] } : undefined}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={cn(
                        "h-2 rounded-full bg-muted",
                        index >= 8 && index <= 12 && "bg-rose-300",
                        index === 14 && "bg-primary"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedFeatureCard({ feature }: { feature: (typeof featureCards)[number] }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={revealUp}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <Link
        href={feature.href}
        className="group relative block h-full overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10"
      >
        <motion.div
          className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100", feature.gradient)}
          whileHover={{ x: 10, y: -8 }}
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <motion.div
              whileHover={{ rotate: [-3, 5, -2, 0], scale: 1.12 }}
              transition={{ duration: 0.55 }}
              className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", feature.color)}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <h3 className="mt-5 text-base font-black text-foreground">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function HealthJourneyTimeline() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={revealUp}
          className="max-w-2xl"
        >
          <p className="text-xs font-black uppercase text-secondary">Live Health Journey</p>
          <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
            A living timeline from first symptom to next-cycle clarity.
          </h2>
        </motion.div>

        <div className="relative mt-10">
          <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-primary via-secondary to-rose-400 shadow-[0_0_28px_hsl(var(--primary)/0.55)] md:block" />
          <motion.div
            aria-hidden="true"
            initial={{ scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute left-4 top-0 hidden h-full w-2 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/35 via-secondary/30 to-rose-400/35 blur-md md:block"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-4"
          >
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.day}
                variants={revealUp}
                whileHover={{ y: -4, scale: 1.005 }}
                className="relative grid gap-4 overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:border-primary/25 hover:shadow-[0_0_34px_hsl(var(--primary)/0.16)] md:ml-12 md:grid-cols-[140px_1fr]"
              >
                <motion.span
                  aria-hidden="true"
                  animate={{ opacity: [0.24, 0.58, 0.24], scale: [1, 1.12, 1] }}
                  transition={{ duration: 3.2, delay: index * 0.25, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent"
                />
                <motion.span
                  aria-hidden="true"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.65, 1, 0.65] }}
                  transition={{ duration: 2.6, delay: index * 0.25, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-[3.25rem] top-6 hidden h-8 w-8 rounded-full border-4 border-background bg-gradient-to-tr from-primary to-secondary shadow-[0_0_26px_hsl(var(--primary)/0.75)] md:block"
                />
                <div>
                  <p className="text-xs font-black uppercase text-primary">{step.day}</p>
                  <p className="mt-1 text-sm font-black text-foreground">Step {index + 1}</p>
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AnimatedStats() {
  const stats = [
    { end: 10, suffix: "K+", label: "Health Logs" },
    { end: 92, suffix: "%", label: "Reminder Consistency" },
    { end: 24, suffix: "/7", label: "Personal Health Timeline" },
    { end: 3, suffix: "", label: "Risk Insight Levels" },
  ];

  return (
    <section className="border-y border-border/60 bg-muted/20 px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={revealUp}
            whileHover={{ y: -5 }}
            className="rounded-3xl border border-border/70 bg-card p-6 text-center shadow-sm"
          >
            <p className="text-4xl font-black text-foreground">
              <CountUp end={stat.end} duration={2.2} enableScrollSpy scrollSpyOnce />
              {stat.suffix}
            </p>
            <p className="mt-2 text-xs font-black uppercase text-muted-foreground">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={revealUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-black uppercase text-primary">Trusted By Women</p>
          <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
            Designed for the quiet work of understanding your body.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.45, delay: index * 0.08 },
                y: { duration: 5.5, delay: index * 0.6, repeat: Infinity, ease: "easeInOut" },
              }}
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
            >
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Sparkles key={starIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">“{testimonial.text}”</p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="text-sm font-black text-foreground">{testimonial.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/30 bg-gradient-to-br from-rose-500 via-pink-500 to-violet-600 p-8 text-center text-white shadow-2xl shadow-rose-500/20 sm:p-12"
      >
        <motion.div
          animate={{ rotate: [0, 8, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-6 top-8 hidden rounded-2xl bg-white/15 p-4 backdrop-blur md:block"
        >
          <CalendarDays className="h-6 w-6" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -8, 0], y: [0, 10, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 right-7 hidden rounded-2xl bg-white/15 p-4 backdrop-blur md:block"
        >
          <ShieldCheck className="h-6 w-6" />
        </motion.div>

        <CheckCircle2 className="mx-auto h-10 w-10" />
        <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-black sm:text-5xl">
          Build a more readable health story, one gentle log at a time.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/82 sm:text-base">
          Start with cycle tracking, symptoms, reminders, reports, appointments, and risk insights in a single calm dashboard.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-rose-600 shadow-lg shadow-white/20 transition hover:scale-[1.02]"
          >
            Register
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/18"
          >
            View Dashboard
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot
  );

  const navItems = useMemo(() => LANDING_NAV_ITEMS.slice(0, 3), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleHeroMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    mouseY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-border/70 bg-background/78 shadow-lg shadow-foreground/5 backdrop-blur-2xl"
            : "border-white/20 bg-background/55 backdrop-blur-xl"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="SheCare home">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.06 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-md shadow-primary/20"
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
            <span className="text-xl font-black text-foreground">SheCare</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl border border-white/35 bg-card/55 p-1 text-xs font-bold text-muted-foreground shadow-sm backdrop-blur-xl md:flex dark:border-white/10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative rounded-xl px-3 py-2 transition-colors hover:text-foreground"
              >
                {item.title}
                <span className="absolute bottom-1 left-3 h-0.5 w-0 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-[calc(100%-1.5rem)]" />
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
                {[...navItems, { title: "Login", href: "/login" }, { title: "Register", href: "/register" }].map((item) => (
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
        <section
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
          className="relative px-4 pb-20 pt-12 sm:px-6 md:pb-24 md:pt-18 lg:px-8"
        >
          <AnimatedBlob className="-left-24 top-16 h-72 w-72 bg-rose-300/30 dark:bg-rose-500/16" />
          <AnimatedBlob className="right-0 top-28 h-80 w-80 bg-sky-300/28 dark:bg-sky-500/14" delay={1.4} />
          <AnimatedBlob className="bottom-8 left-1/3 h-72 w-72 bg-emerald-300/24 dark:bg-emerald-500/12" delay={2.1} />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
                <Heart className="h-4 w-4" />
                One Calm Workspace For Women’s Health
              </div>

              <h1 className="mt-6 font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
                SheCare
                <span className="mt-2 block bg-gradient-to-r from-primary via-secondary to-rose-500 bg-clip-text text-transparent">
                  Turns Daily Signals Into Care-Ready Clarity.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                Track cycles, symptoms, reports, reminders, appointments, analytics, and risk insights from a single private dashboard.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:scale-[1.02] sm:w-auto"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-6 py-3.5 text-sm font-black text-foreground shadow-sm backdrop-blur transition hover:bg-muted sm:w-auto"
                >
                  View Dashboard
                </Link>
              </div>
            </motion.div>

            <HeroHealthPreview mouseX={mouseX} mouseY={mouseY} />
          </div>
        </section>

        <section id="features" className="border-y border-border/60 bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase text-primary">Your Health Toolkit</p>
                <h2 className="mt-2 max-w-2xl font-display text-3xl font-black text-foreground sm:text-4xl">
                  Everything You Need To Track, Plan, And Understand Your Wellness.
                </h2>
              </div>
              <Link href="/dashboard" className="text-sm font-black text-primary hover:underline">
                Explore Dashboard
              </Link>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {featureCards.map((feature) => (
                <AnimatedFeatureCard key={feature.title} feature={feature} />
              ))}
            </motion.div>
          </div>
        </section>

        <HealthJourneyTimeline />
        <CycleSimulator />
        <AnimatedStats />
        <Testimonials />

        <section id="privacy" className="border-y border-border/60 bg-muted/20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-xs font-black uppercase text-emerald-500">Privacy First</p>
              <h2 className="mt-2 font-display text-3xl font-black text-foreground">
                Sensitive Health Data Deserves A Serious Interface.
              </h2>
            </div>

            {[
              {
                icon: ShieldCheck,
                title: "Private By Design",
                desc: "The product is shaped around sensitive personal context and careful health journaling.",
              },
              {
                icon: Lock,
                title: "Backend-Free Landing",
                desc: "This page stays visual and product-focused without connecting to backend or ML services.",
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

        <FinalCTA />
      </main>

      <footer className="border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-secondary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-black text-foreground">SheCare</span>
          </div>
          <p>Frontend prototype for cycles, wellness, appointments, reports, analytics, and risk insights.</p>
        </div>
      </footer>
    </div>
  );
}
