"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MOCK_WELLNESS_HISTORY } from "../../data/mockData";
import {
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { Moon, Droplet, Footprints } from "lucide-react";
import { cn } from "../../lib/utils";

type ChartTab = "sleep" | "hydration" | "activity";

export default function VitalsCharts() {
  const [activeTab, setActiveTab] = useState<ChartTab>("sleep");
  const [mounted, setMounted] = useState(false);

  // Eliminate hydration mismatches in Next.js when rendering Recharts SVGs
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-card rounded-3xl p-6 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full"
    >
      {/* Header and Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Analytics</span>
          <h3 className="text-xl font-bold mt-0.5 text-foreground font-sans">Wellness Trends</h3>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-muted rounded-2xl gap-0.5 border border-border/50 shrink-0">
          <button
            onClick={() => setActiveTab("sleep")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
              activeTab === "sleep"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
            Sleep
          </button>
          <button
            onClick={() => setActiveTab("hydration")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
              activeTab === "hydration"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Droplet className="h-3.5 w-3.5 text-sky-500" />
            Vitals
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
              activeTab === "activity"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Footprints className="h-3.5 w-3.5 text-emerald-500" />
            Activity
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-[280px] w-full mt-6 relative">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "sleep" ? (
            <ComposedChart data={MOCK_WELLNESS_HISTORY} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "1rem",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                }}
                labelStyle={{ fontWeight: "bold", fontSize: "11px", marginBottom: "4px" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
              
              <Area yAxisId="left" type="monotone" dataKey="sleepScore" name="Sleep Quality (%)" fill="url(#sleepGrad)" stroke="hsl(var(--secondary))" strokeWidth={2} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="sleepHours" name="Sleep Duration (h)" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
            </ComposedChart>
          ) : activeTab === "hydration" ? (
            <ComposedChart data={MOCK_WELLNESS_HISTORY} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} domain={[0, 3000]} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "1rem",
                }}
                labelStyle={{ fontWeight: "bold", fontSize: "11px", marginBottom: "4px" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
              
              <Bar yAxisId="left" dataKey="hydrationMl" name="Water Intake (ml)" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={30} />
              <Line yAxisId="right" type="monotone" dataKey="stressLevel" name="Stress Level (1-10)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          ) : (
            <BarChart data={MOCK_WELLNESS_HISTORY} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }} domain={[0, 12000]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "1rem",
                }}
                labelStyle={{ fontWeight: "bold", fontSize: "11px", marginBottom: "4px" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
              
              <Bar dataKey="steps" name="Steps count" fill="url(#stepGrad)" radius={[6, 6, 0, 0]} maxBarSize={35} />
              
              <defs>
                <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-3 gap-3.5 mt-6 pt-4 border-t border-border/40">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg Sleep</span>
          <span className="text-sm font-bold text-foreground/90">7.3 hrs</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg Water</span>
          <span className="text-sm font-bold text-foreground/90">1,850 ml</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Avg Steps</span>
          <span className="text-sm font-bold text-foreground/90">8,100 steps</span>
        </div>
      </div>
    </motion.div>
  );
}
