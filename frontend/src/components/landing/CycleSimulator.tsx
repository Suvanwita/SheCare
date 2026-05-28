"use client";

import React, { useMemo, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Activity, Droplets, Moon, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { cn } from "../../lib/utils";

type Stability = "Low" | "Moderate" | "Good";

const controls = [
  {
    key: "stress",
    label: "Stress Level",
    min: 1,
    max: 10,
    suffix: "/10",
    icon: Waves,
    tone: "text-rose-500 bg-rose-500/10",
  },
  {
    key: "sleep",
    label: "Sleep Hours",
    min: 3,
    max: 10,
    suffix: "h",
    icon: Moon,
    tone: "text-indigo-500 bg-indigo-500/10",
  },
  {
    key: "exercise",
    label: "Exercise Frequency",
    min: 0,
    max: 7,
    suffix: " days/week",
    icon: Activity,
    tone: "text-emerald-500 bg-emerald-500/10",
  },
  {
    key: "hydration",
    label: "Hydration",
    min: 1,
    max: 10,
    suffix: "/10",
    icon: Droplets,
    tone: "text-sky-500 bg-sky-500/10",
  },
] as const;

function getStability(score: number): Stability {
  if (score < 45) return "Low";
  if (score < 72) return "Moderate";
  return "Good";
}

function getInsight(values: Record<(typeof controls)[number]["key"], number>) {
  if (values.stress >= 8) {
    return "High stress can affect cycle regularity.";
  }
  if (values.sleep < 6) {
    return "Better sleep consistency may support cycle stability.";
  }
  if (values.hydration >= 7 && values.exercise >= 3) {
    return "Hydration and movement habits look balanced.";
  }
  if (values.exercise <= 1) {
    return "Gentle movement may help support steadier wellness patterns.";
  }
  return "Your habits show a steady foundation for cycle wellness.";
}

function calculateScore(values: Record<(typeof controls)[number]["key"], number>) {
  const sleepScore = ((values.sleep - 3) / 7) * 30;
  const exerciseScore = (values.exercise / 7) * 24;
  const hydrationScore = ((values.hydration - 1) / 9) * 24;
  const stressScore = ((10 - values.stress) / 9) * 22;

  return Math.round(Math.max(0, Math.min(100, sleepScore + exerciseScore + hydrationScore + stressScore)));
}

export default function CycleSimulator() {
  const [values, setValues] = useState({
    stress: 5,
    sleep: 7,
    exercise: 3,
    hydration: 7,
  });

  const score = useMemo(() => calculateScore(values), [values]);
  const stability = getStability(score);
  const insight = getInsight(values);
  const circumference = 2 * Math.PI * 64;
  const progress = useSpring(score, { stiffness: 80, damping: 18, mass: 0.4 });
  const strokeOffset = useTransform(progress, (latest) => circumference - (latest / 100) * circumference);

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-500/10" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Demo
          </p>
          <h2 className="mt-4 font-display text-3xl font-black text-foreground sm:text-4xl">
            See How Daily Habits Influence Your Cycle Wellness
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            This is a frontend-only wellness simulator. It is not ML and is not medical advice.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-xl shadow-foreground/5 backdrop-blur"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {controls.map((control) => {
                const Icon = control.icon;
                const value = values[control.key];

                return (
                  <motion.label
                    key={control.key}
                    whileHover={{ y: -4 }}
                    className="rounded-3xl border border-border/70 bg-background/70 p-5 shadow-sm transition hover:border-primary/25 hover:shadow-[0_0_28px_hsl(var(--primary)/0.12)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", control.tone)}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-sm font-black text-foreground">{control.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {value}
                            {control.suffix}
                          </span>
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      value={value}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [control.key]: Number(event.target.value),
                        }))
                      }
                      className="mt-5 h-2 w-full cursor-pointer accent-primary"
                    />
                    <div className="mt-2 flex justify-between text-[11px] font-bold text-muted-foreground">
                      <span>{control.min}</span>
                      <span>{control.max}</span>
                    </div>
                  </motion.label>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-6 shadow-2xl shadow-primary/10"
          >
            <motion.div
              animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="relative h-44 w-44">
                <svg className="h-full w-full -rotate-90">
                  <circle cx="88" cy="88" r="64" fill="none" stroke="hsl(var(--muted))" strokeWidth="14" />
                  <motion.circle
                    cx="88"
                    cy="88"
                    r="64"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: strokeOffset }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={score}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-black text-foreground"
                  >
                    {score}%
                  </motion.span>
                  <span className="text-xs font-bold text-muted-foreground">Wellness Score</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2">
                <ShieldCheck
                  className={cn(
                    "h-4 w-4",
                    stability === "Good" && "text-emerald-500",
                    stability === "Moderate" && "text-amber-500",
                    stability === "Low" && "text-rose-500"
                  )}
                />
                <span className="text-sm font-black text-foreground">
                  Cycle Stability: {stability}
                </span>
              </div>

              <motion.p
                key={insight}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground"
              >
                {insight}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
