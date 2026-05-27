"use client";

import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BrainCircuit,
  CalendarDays,
  Droplet,
  HeartPulse,
  Moon,
  Pill,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  AI_INSIGHTS,
  ANALYTICS_SUMMARY,
  CYCLE_TREND,
  IMPROVEMENT_SUGGESTIONS,
  MEDICATION_ADHERENCE,
  MOOD_TREND,
  SLEEP_WATER_TREND,
  SYMPTOM_FREQUENCY,
  WELLNESS_FACTORS,
} from "../../../data/mockAnalytics";

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass-card rounded-3xl border border-border/60 p-6 shadow-sm ${className}`}>
      <div className="mb-5">
        <h3 className="text-lg font-black text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="h-[310px] min-w-0">{children}</div>
    </section>
  );
}

function chartTooltipStyle() {
  return {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "1rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
  };
}

export default function AnalyticsDashboardPage() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          SheCare intelligence
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Health Analytics
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Visualize trends in your cycle, symptoms, sleep, hydration, and wellness.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SummaryCard label="Average cycle length" value={ANALYTICS_SUMMARY.averageCycleLength} icon={CalendarDays} />
        <SummaryCard label="Average sleep" value={ANALYTICS_SUMMARY.averageSleep} icon={Moon} />
        <SummaryCard label="Water intake trend" value={ANALYTICS_SUMMARY.waterIntakeTrend} icon={Droplet} />
        <SummaryCard label="Mood score" value={ANALYTICS_SUMMARY.moodScore} icon={BrainCircuit} />
        <SummaryCard label="Medication adherence" value={`${ANALYTICS_SUMMARY.medicationAdherence}%`} icon={Pill} />
        <SummaryCard label="Most common symptom" value={ANALYTICS_SUMMARY.mostCommonSymptom} icon={HeartPulse} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Cycle trend" description="Monthly cycle length across recent months.">
          {chartsReady && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CYCLE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[24, 32]} />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Line type="monotone" dataKey="cycleLength" name="Cycle length" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Symptom frequency" description="Most frequently logged symptoms.">
          {chartsReady && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SYMPTOM_FREQUENCY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                <XAxis dataKey="symptom" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Bar dataKey="count" name="Logs" radius={[8, 8, 0, 0]} maxBarSize={42} isAnimationActive>
                  {SYMPTOM_FREQUENCY.map((entry, index) => (
                    <Cell key={entry.symptom} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Mood trend" description="Weekly mood score trend.">
          {chartsReady && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOOD_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[60, 100]} />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Area type="monotone" dataKey="moodScore" name="Mood score" stroke="hsl(var(--secondary))" strokeWidth={3} fill="url(#moodGradient)" isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Sleep and hydration" description="Daily sleep hours and water intake.">
          {chartsReady && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SLEEP_WATER_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis yAxisId="sleep" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 10]} />
                <YAxis yAxisId="water" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 3000]} />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Line yAxisId="sleep" type="monotone" dataKey="sleepHours" name="Sleep hours" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
                <Line yAxisId="water" type="monotone" dataKey="waterMl" name="Water intake" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Medication adherence" description="Supplement and medicine completion rate." className="xl:col-span-2">
          {chartsReady && (
            <div className="grid h-full gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={MEDICATION_ADHERENCE}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={12} background isAnimationActive />
                  <Tooltip contentStyle={chartTooltipStyle()} />
                </RadialBarChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center rounded-3xl border border-border/60 bg-muted/20 p-5">
                <p className="text-5xl font-black tracking-tight text-foreground">
                  {ANALYTICS_SUMMARY.medicationAdherence}%
                </p>
                <p className="mt-2 text-sm font-bold text-muted-foreground">
                  Medication adherence this month
                </p>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Most missed reminders occur during evening routines. Keeping reminders near dinner time may improve consistency.
                </p>
              </div>
            </div>
          )}
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black text-foreground">Health insights</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {AI_INSIGHTS.map((insight) => (
              <div key={insight.title} className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-black text-foreground">{insight.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-secondary to-emerald-500 p-6 text-white shadow-xl shadow-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                Wellness score
              </p>
              <p className="mt-2 text-6xl font-black tracking-tight">
                {ANALYTICS_SUMMARY.overallHealthScore}
              </p>
              <p className="mt-1 text-sm font-bold text-white/85">Overall health score</p>
            </div>
            <Activity className="h-9 w-9 text-white/80" />
          </div>

          <div className="mt-6 space-y-3">
            {WELLNESS_FACTORS.map((factor) => (
              <div key={factor.label}>
                <div className="flex justify-between text-xs font-bold text-white/85">
                  <span>{factor.label}</span>
                  <span>{factor.value}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${factor.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-white/15 p-4 backdrop-blur">
            <p className="text-sm font-black">Improvement suggestions</p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-white/85">
              {IMPROVEMENT_SUGGESTIONS.map((suggestion) => (
                <li key={suggestion} className="flex gap-2">
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
