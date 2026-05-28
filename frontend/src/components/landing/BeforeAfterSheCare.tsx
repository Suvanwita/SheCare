"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BellOff,
  BellRing,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  EyeOff,
  Files,
  FolderOpen,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";

const beforeItems = [
  {
    icon: BellOff,
    title: "Missed Medication Reminders",
    description: "Care routines slip when reminders live in memory or scattered apps.",
  },
  {
    icon: CalendarX,
    title: "Forgotten Cycle Dates",
    description: "Period history becomes difficult to trust when logs are inconsistent.",
  },
  {
    icon: Files,
    title: "Scattered Medical Reports",
    description: "Lab results, prescriptions, and notes are hard to find before visits.",
  },
  {
    icon: EyeOff,
    title: "No Symptom Pattern Visibility",
    description: "Recurring changes stay hidden without a clear health timeline.",
  },
];

const afterItems = [
  {
    icon: BellRing,
    title: "Smart Reminders",
    description: "Medication, water, appointments, and check-ins stay visible.",
  },
  {
    icon: CalendarCheck,
    title: "Organized Cycle Tracking",
    description: "Cycle dates, predictions, and wellness context stay together.",
  },
  {
    icon: FolderOpen,
    title: "Secure Report Management",
    description: "Health documents are easier to organize for every consultation.",
  },
  {
    icon: BarChart3,
    title: "Visual Health Analytics",
    description: "Patterns become easier to review through clear, calm visuals.",
  },
];

const revealLeft = {
  hidden: { opacity: 0, x: -34 },
  show: { opacity: 1, x: 0 },
};

const revealRight = {
  hidden: { opacity: 0, x: 34 },
  show: { opacity: 1, x: 0 },
};

function ComparisonCard({
  item,
  tone,
  index,
}: {
  item: (typeof beforeItems)[number];
  tone: "before" | "after";
  index: number;
}) {
  const Icon = item.icon;
  const positive = tone === "after";

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 210, damping: 18 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition",
        positive
          ? "border-emerald-400/25 bg-emerald-50/75 hover:shadow-emerald-500/15 dark:bg-emerald-500/10"
          : "border-rose-300/25 bg-rose-50/65 hover:shadow-rose-500/10 dark:bg-rose-500/8"
      )}
    >
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.4, delay: index * 0.18, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl",
          positive ? "bg-emerald-400" : "bg-rose-300"
        )}
      />
      <div className="relative flex gap-3">
        <motion.span
          animate={{ y: [0, -3, 0], rotate: positive ? [0, 4, 0] : [0, -4, 0] }}
          transition={{ duration: 3, delay: index * 0.16, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            positive
              ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300"
              : "bg-rose-500/12 text-rose-600 dark:text-rose-300"
          )}
        >
          <Icon className="h-5 w-5" />
        </motion.span>
        <div>
          <h3 className="text-sm font-black text-foreground">{item.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function BeforeAfterSheCare() {
  const [split, setSplit] = useState(50);

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.28, 0.46, 0.28], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-16 h-80 w-80 rounded-full bg-emerald-300/18 blur-3xl dark:bg-emerald-500/10"
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.48 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-black uppercase text-primary">Before And After SheCare</p>
          <h2 className="mt-3 font-display text-3xl font-black text-foreground sm:text-4xl">
            Replace scattered health chaos with one calm workspace.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Compare the everyday friction of managing care manually with the clarity of a dedicated women’s health dashboard.
          </p>
        </motion.div>

        <div className="mt-10 hidden rounded-[2rem] border border-border/70 bg-card/80 p-3 shadow-2xl shadow-primary/10 backdrop-blur-xl md:block">
          <div className="mb-3 flex items-center justify-between rounded-[1.4rem] border border-border/70 bg-background/75 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-black text-muted-foreground">
              <XCircle className="h-4 w-4 text-rose-500" />
              Before
            </div>
            <label className="flex items-center gap-3 text-xs font-black text-muted-foreground">
              <span>Drag To Compare</span>
              <input
                type="range"
                min="38"
                max="62"
                value={split}
                onChange={(event) => setSplit(Number(event.target.value))}
                className="h-2 w-44 accent-primary"
                aria-label="Compare Before And After SheCare"
              />
            </label>
            <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              After
            </div>
          </div>

          <div
            className="relative grid min-h-[520px] gap-3"
            style={{ gridTemplateColumns: `${split}fr ${100 - split}fr` }}
          >
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="rounded-[1.5rem] border border-rose-300/25 bg-gradient-to-br from-rose-50 via-background to-background p-5 dark:from-rose-500/10"
            >
              <motion.div variants={revealLeft} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-rose-500">Before SheCare</p>
                  <h3 className="mt-2 text-2xl font-black text-foreground">Care details are easy to lose.</h3>
                </div>
                <span className="rounded-2xl bg-rose-500/10 p-3 text-rose-500">
                  <XCircle className="h-6 w-6" />
                </span>
              </motion.div>
              <div className="mt-6 grid gap-3">
                {beforeItems.map((item, index) => (
                  <motion.div key={item.title} variants={revealLeft}>
                    <ComparisonCard item={item} tone="before" index={index} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="relative overflow-hidden rounded-[1.5rem] border border-emerald-300/35 bg-gradient-to-br from-emerald-50 via-background to-primary/5 p-5 shadow-[0_0_42px_hsl(var(--primary)/0.16)] dark:from-emerald-500/12"
            >
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [0.18, 0.38, 0.18], x: [0, 18, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-emerald-400/18 to-transparent"
              />
              <motion.div variants={revealRight} className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-300">After SheCare</p>
                  <h3 className="mt-2 text-2xl font-black text-foreground">Your health story becomes readable.</h3>
                </div>
                <span className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck className="h-6 w-6" />
                </span>
              </motion.div>
              <div className="relative mt-6 grid gap-3">
                {afterItems.map((item, index) => (
                  <motion.div key={item.title} variants={revealRight}>
                    <ComparisonCard item={item} tone="after" index={index} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              aria-hidden="true"
              animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-background/80 text-primary shadow-2xl shadow-primary/25 backdrop-blur-xl"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:hidden">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-[1.5rem] border border-rose-300/25 bg-rose-50/70 p-5 dark:bg-rose-500/10"
          >
            <p className="text-xs font-black uppercase text-rose-500">Before SheCare</p>
            <h3 className="mt-2 text-xl font-black text-foreground">Care details are easy to lose.</h3>
            <div className="mt-5 grid gap-3">
              {beforeItems.map((item, index) => (
                <ComparisonCard key={item.title} item={item} tone="before" index={index} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-[1.5rem] border border-emerald-300/35 bg-emerald-50/75 p-5 shadow-[0_0_38px_hsl(var(--primary)/0.15)] dark:bg-emerald-500/10"
          >
            <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-300">After SheCare</p>
            <h3 className="mt-2 text-xl font-black text-foreground">Your health story becomes readable.</h3>
            <div className="mt-5 grid gap-3">
              {afterItems.map((item, index) => (
                <ComparisonCard key={item.title} item={item} tone="after" index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
