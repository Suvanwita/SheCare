"use client";

import React from "react";
import { motion } from "framer-motion";
import CycleTracker from "../../components/dashboard/CycleTracker";
import VitalsCharts from "../../components/dashboard/VitalsCharts";
import SymptomLogger from "../../components/dashboard/SymptomLogger";
import WellnessTips from "../../components/dashboard/WellnessTips";
import AIConsultationMock from "../../components/dashboard/AIConsultationMock";
import { Moon, Droplet, Footprints, Heart } from "lucide-react";

export default function DashboardPage() {
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
            Syncing self-care details for Day 22 of your menstrual cycle.
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

      {/* 2. Key Stats Vitals Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Stat 1: Sleep Quality */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider">Sleep Quality</span>
            <h4 className="text-2xl font-black font-sans text-foreground">82%</h4>
            <p className="text-[11px] text-indigo-500 font-medium">7.5h slept • Good</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Moon className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 2: Hydration Status */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Hydration</span>
            <h4 className="text-2xl font-black font-sans text-foreground">1.8L</h4>
            <p className="text-[11px] text-sky-500 font-medium">Goal: 2.5L • 72% done</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
            <Droplet className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 3: Daily Activity */}
        <div className="glass-card rounded-2xl p-5 border border-border/50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider">Activity Steps</span>
            <h4 className="text-2xl font-black font-sans text-foreground">8,430</h4>
            <p className="text-[11px] text-emerald-500 font-medium">Goal: 10k • 84% done</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Footprints className="h-6 w-6" />
          </div>
        </div>

      </motion.div>

      {/* 3. Menstrual Cycle Tracker & Vitals Charts split layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div id="cycle-analytics" className="lg:col-span-3 scroll-mt-24">
          <CycleTracker />
        </div>
        <div className="lg:col-span-2">
          <VitalsCharts />
        </div>
      </motion.div>

      {/* 4. Symptom Logging Interactive Panel */}
      <motion.div id="wellness-logs" variants={itemVariants} className="scroll-mt-24">
        <SymptomLogger />
      </motion.div>

      {/* 5. Self-Care tips & AI Conversation assistant split layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <WellnessTips />
        </div>
        <div id="ai-assistant" className="lg:col-span-3 scroll-mt-24">
          <AIConsultationMock />
        </div>
      </motion.div>
    </motion.div>
  );
}
