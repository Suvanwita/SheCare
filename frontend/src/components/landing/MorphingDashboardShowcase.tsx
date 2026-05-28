"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  FileText,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";
import { cn } from "../../lib/utils";

const showcaseViews = [
  {
    title: "Cycle View",
    tab: "Cycle",
    description: "Understand cycle timing, fertile windows, and next-period estimates in one glance.",
    icon: CalendarDays,
    tone: "text-rose-500 bg-rose-500/10",
    data: ["Day 22 Of 28", "Next Period In 6 Days", "Cycle Stability Good"],
    previewTitle: "Cycle Forecast",
    previewSubtitle: "Cycle rhythm and next-period timing",
    metrics: [
      { label: "Cycle Progress", value: "78%", level: 78 },
      { label: "Fertile Window", value: "Day 12-17", level: 54 },
      { label: "Stability", value: "Good", level: 68 },
    ],
    previewItems: ["Period Days", "Fertile Window", "Next Period"],
  },
  {
    title: "Health Logs View",
    tab: "Logs",
    description: "Capture symptoms, mood, sleep, hydration, and pain patterns as they happen.",
    icon: HeartPulse,
    tone: "text-emerald-500 bg-emerald-500/10",
    data: ["Sleep 7.4h", "Mood 8/10", "Hydration 2.1L"],
    previewTitle: "Daily Wellness Log",
    previewSubtitle: "Symptoms, mood, sleep, and hydration together",
    metrics: [
      { label: "Sleep Score", value: "74%", level: 74 },
      { label: "Mood Balance", value: "82%", level: 82 },
      { label: "Hydration", value: "66%", level: 66 },
    ],
    previewItems: ["Cramps Mild", "Mood 8/10", "Water 2.1L"],
  },
  {
    title: "Reminders View",
    tab: "Reminders",
    description: "Keep care routines visible with medication, check-in, and appointment reminders.",
    icon: Bell,
    tone: "text-amber-500 bg-amber-500/10",
    data: ["Iron 8:30 PM", "Water Check-In", "Doctor Visit Friday"],
    previewTitle: "Care Schedule",
    previewSubtitle: "Medication, check-ins, and appointments in sync",
    metrics: [
      { label: "Medication Consistency", value: "88%", level: 88 },
      { label: "Check-In Completion", value: "64%", level: 64 },
      { label: "Appointment Readiness", value: "72%", level: 72 },
    ],
    previewItems: ["8:30 PM Iron", "9:00 PM Hydration", "Friday Visit"],
  },
  {
    title: "Reports View",
    tab: "Reports",
    description: "Organize lab reports, prescriptions, and consultation notes before every visit.",
    icon: FileText,
    tone: "text-sky-500 bg-sky-500/10",
    data: ["3 New Reports", "2 Shared Notes", "1 Follow-Up"],
    previewTitle: "Report Organizer",
    previewSubtitle: "Visit-ready health documents and follow-ups",
    metrics: [
      { label: "Lab Reports", value: "58%", level: 58 },
      { label: "Shared Notes", value: "76%", level: 76 },
      { label: "Follow-Up Tasks", value: "46%", level: 46 },
    ],
    previewItems: ["CBC Report", "Ultrasound Note", "Prescription"],
  },
  {
    title: "PCOS Assessment View",
    tab: "PCOS",
    description: "Review informational risk levels with contributing factors and next-step guidance.",
    icon: ShieldAlert,
    tone: "text-pink-500 bg-pink-500/10",
    data: ["Risk Low", "Score 32%", "5 Factors Reviewed"],
    previewTitle: "Risk Insight Summary",
    previewSubtitle: "Informational signals with next-step guidance",
    metrics: [
      { label: "Risk Score", value: "32%", level: 32 },
      { label: "Symptom Signals", value: "48%", level: 48 },
      { label: "Review Confidence", value: "70%", level: 70 },
    ],
    previewItems: ["Cycle Length", "Follicle Count", "AMH Level"],
  },
];

export default function MorphingDashboardShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeView = showcaseViews[activeIndex];
  const Icon = activeView.icon;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % showcaseViews.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 42, -18, 0], y: [0, -24, 18, 0], scale: [1, 1.08, 0.98, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/4 top-12 h-80 w-80 rounded-full bg-primary/18 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -32, 22, 0], y: [0, 20, -16, 0], scale: [1, 0.96, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-1/4 h-72 w-72 rounded-full bg-secondary/16 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase text-primary">Complete Health Workspace</p>
          <h2 className="mt-3 font-display text-3xl font-black text-foreground sm:text-4xl">
            More Than A Tracker, A Daily Health Command Center
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Move between cycle tracking, logs, reminders, reports, and risk insights without losing context.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-white/45 bg-white/55 p-3 shadow-2xl shadow-primary/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
          <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-border/70 bg-background/80 p-2">
            {showcaseViews.map((view, index) => (
              <button
                key={view.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative flex-1 rounded-2xl px-3 py-2 text-xs font-black text-muted-foreground transition hover:text-foreground sm:min-w-28",
                  activeIndex === index && "text-foreground"
                )}
              >
                {activeIndex === index && (
                  <motion.span
                    layoutId="showcase-active-tab"
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  />
                )}
                <span className="relative">{view.tab}</span>
              </button>
            ))}
          </div>

          <div className="relative mt-3 overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/95 p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView.title}
                initial={{ opacity: 0, x: 34, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -34, scale: 0.98 }}
                transition={{ duration: 0.42, ease: "easeOut" }}
                className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", activeView.tone)}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-2xl font-black text-foreground">{activeView.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {activeView.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {activeView.data.map((item) => (
                      <div key={item} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <p className="text-sm font-black text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">{activeView.previewSubtitle}</p>
                      <p className="mt-1 text-lg font-black text-foreground">{activeView.previewTitle}</p>
                    </div>
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", activeView.tone)}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {activeView.metrics.map((metric, index) => (
                      <div key={metric.label}>
                        <div className="mb-2 flex justify-between text-xs font-bold text-muted-foreground">
                          <span>{metric.label}</span>
                          <span>{metric.value}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.level}%` }}
                            transition={{ duration: 0.72, delay: index * 0.08, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {activeView.previewItems.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.18 + index * 0.08 }}
                        className="rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm"
                      >
                        <div className="mb-3 flex gap-1.5">
                          {Array.from({ length: 4 }).map((_, dotIndex) => (
                            <span
                              key={dotIndex}
                              className={cn(
                                "h-1.5 flex-1 rounded-full",
                                dotIndex <= index ? "bg-primary/70" : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-black text-foreground">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
