"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import DailyChecklist from "../../components/dashboard/DailyChecklist";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import SymptomLogger from "../../components/dashboard/SymptomLogger";
import WellnessTips from "../../components/dashboard/WellnessTips";
import KnowledgeHubFeatured from "../../components/dashboard/KnowledgeHubFeatured";
import { Moon, Droplet, Heart, Pill } from "lucide-react";
import { useAnalyticsStore } from "../../store/analyticsStore";

export default function DashboardPage() {
  const summary = useAnalyticsStore((state) => state.summary);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const error = useAnalyticsStore((state) => state.error);
  const fetchSummary = useAnalyticsStore((state) => state.fetchSummary);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const sleepHours = summary?.healthSummary.averageSleep;
  const waterIntake = summary?.healthSummary.averageWaterIntake;
  const adherence = summary?.reminderSummary.adherencePercentage;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* 1. Welcoming Hero Banner */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Welcome back, Sophia ✨
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-primary fill-primary/10" />
            Syncing your daily self-care and wellness activities.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-border bg-card/60 backdrop-blur-sm px-4 py-2.5 rounded-2xl self-start md:self-center shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-foreground/80">Self-Care Sync Active</span>
        </div>
      </motion.div>

      {(isLoading || error || !summary) && (
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl border px-4 py-3 text-xs font-bold ${
            error
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-border/60 bg-card text-muted-foreground"
          }`}
        >
          {error || (isLoading ? "Loading dashboard analytics..." : "Add health data to personalize this overview.")}
        </motion.div>
      )}

      {/* 2. Key Stats Vitals Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Stat 1: Sleep Quality */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider">Sleep Quality</span>
            <h4 className="text-2xl font-black font-sans text-foreground">
              {sleepHours ? `${Math.round((sleepHours / 8) * 100)}%` : "82%"}
            </h4>
            <p className="text-[11px] text-indigo-500 font-medium">
              {sleepHours ? `${sleepHours}h average` : "7.5h slept"} • Good
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Moon className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 2: Hydration Status */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Hydration</span>
            <h4 className="text-2xl font-black font-sans text-foreground">
              {waterIntake ? `${(waterIntake / 1000).toFixed(1)}L` : "1.8L"}
            </h4>
            <p className="text-[11px] text-sky-500 font-medium">
              Goal: 2.5L • {waterIntake ? `${Math.min(100, Math.round((waterIntake / 2500) * 100))}% done` : "72% done"}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
            <Droplet className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 3: Daily Activity */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider">Reminder Adherence</span>
            <h4 className="text-2xl font-black font-sans text-foreground">
              {adherence !== undefined ? `${adherence}%` : "84%"}
            </h4>
            <p className="text-[11px] text-emerald-500 font-medium">
              {summary ? `${summary.reminderSummary.completedReminders} completed reminders` : "Goal: 10k • 84% done"}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Pill className="h-6 w-6" />
          </div>
        </div>

      </motion.div>

      {/* 3. Daily Checklist & Activity Timeline split layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div id="daily-checklist" className="lg:col-span-3 scroll-mt-24">
          <DailyChecklist />
        </div>
        <div id="recent-activity" className="lg:col-span-2 scroll-mt-24">
          <ActivityTimeline />
        </div>
      </motion.div>

      {/* 4. Symptom Logging Interactive Panel */}
      <motion.div id="wellness-logs" variants={itemVariants} className="scroll-mt-24">
        <SymptomLogger />
      </motion.div>

      {/* 5. Self-Care tips & Featured educational guides split layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <WellnessTips />
        </div>
        <div id="featured-guides" className="lg:col-span-3 scroll-mt-24">
          <KnowledgeHubFeatured />
        </div>
      </motion.div>
    </motion.div>
  );
}
