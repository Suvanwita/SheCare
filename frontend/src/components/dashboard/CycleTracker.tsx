"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MOCK_CYCLE_STATUS } from "../../data/mockData";
import { CYCLE_PHASES_DETAILS } from "../../constants";
import { Calendar, ChevronRight, Activity, Salad, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export default function CycleTracker() {
  const [loggedToday, setLoggedToday] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const status = MOCK_CYCLE_STATUS;
  const phaseInfo = CYCLE_PHASES_DETAILS[status.phase];

  const progressPercent = (status.cycleDay / status.totalCycleLength) * 100;
  
  // Calculate SVG stroke offset for the radial progress
  const strokeRadius = 70;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (progressPercent / 100) * strokeCircumference;

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleLogPeriod = () => {
    setLoggedToday(true);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setLoggedToday(false);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden"
    >
      {/* Dynamic phase-based accent highlight light effect in background */}
      <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br", phaseInfo.bgGradient)} />

      {/* Header Info */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menstrual Status</span>
          <h3 className="text-xl font-bold mt-0.5 text-foreground">Cycle Insights</h3>
        </div>
        <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border shadow-sm transition-colors duration-300", phaseInfo.badgeColor)}>
          {phaseInfo.name}
        </span>
      </div>

      {/* Circle & Details Split Layout */}
      <div className="flex flex-col sm:flex-row items-center gap-6 my-6 z-10">
        
        {/* Circular Progress Display */}
        <div className="relative flex items-center justify-center h-44 w-44 shrink-0 select-none">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="88"
              cy="88"
              r={strokeRadius}
              className="stroke-muted"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Gradient Overlay */}
            <defs>
              <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
            {/* Progress Circle with active colors */}
            <motion.circle
              cx="88"
              cy="88"
              r={strokeRadius}
              stroke="url(#circleGrad)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={strokeCircumference}
              initial={{ strokeDashoffset: strokeCircumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Inner Content */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-tr from-primary to-secondary bg-clip-text text-transparent">
              Day {status.cycleDay}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">
              of {status.totalCycleLength} days
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="flex-1 space-y-3.5">
          <div>
            <h4 className={cn("text-base font-bold", phaseInfo.textColor)}>
              {status.daysUntilNext} Days Remaining
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {phaseInfo.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-border/60 bg-muted/20 p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Next Predict</span>
              <span className="font-bold flex items-center gap-1 mt-0.5 text-foreground/80">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                June 2
              </span>
            </div>
            
            <div className="border border-border/60 bg-muted/20 p-2.5 rounded-xl flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Window</span>
              <span className="font-bold flex items-center gap-1 mt-0.5 text-foreground/80">
                {status.ovulationWindow ? "✨ Peak Fertile" : "❄️ Low Fertility"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Recs & Buttons */}
      <div className="space-y-4 pt-4 border-t border-border/40 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex gap-2.5 items-start text-xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary mt-0.5">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground/90">Sync Workouts</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{phaseInfo.exerciseRec}</p>
            </div>
          </div>

          <div className="flex gap-2.5 items-start text-xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
              <Salad className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground/90">Sync Diet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{phaseInfo.dietRec}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogPeriod}
          disabled={loggedToday}
          className={cn(
            "w-full py-3 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md",
            loggedToday
              ? "bg-emerald-500 text-white shadow-emerald-500/10"
              : "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95 shadow-primary/10 active:scale-98 cursor-pointer"
          )}
        >
          {loggedToday ? (
            <>
              <Check className="h-4 w-4 animate-bounce" /> Logged! Feel better today.
            </>
          ) : (
            <>
              Log Cycle Metrics <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

    </motion.div>
  );
}
