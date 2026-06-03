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
  AlertCircle,
  BrainCircuit,
  CalendarDays,
  Droplet,
  HeartPulse,
  Loader2,
  Moon,
  Pill,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAnalyticsStore } from "../../../store/analyticsStore";
import type { AnalyticsSummary } from "../../../services/analytics.service";

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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm font-bold text-muted-foreground">
      {message}
    </div>
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

function mostCommonSymptom(summary: AnalyticsSummary) {
  return summary.healthSummary.mostCommonSymptoms[0]?.symptom ?? "No symptoms logged";
}

function wellnessFactors(summary: AnalyticsSummary) {
  return [
    {
      label: "Cycle stability",
      value: Math.max(0, Math.min(100, 100 - summary.cycleSummary.irregularCycleCount * 15)),
    },
    {
      label: "Sleep consistency",
      value: Math.max(0, Math.min(100, Math.round((summary.healthSummary.averageSleep / 8) * 100))),
    },
    {
      label: "Hydration",
      value: Math.max(0, Math.min(100, Math.round((summary.healthSummary.averageWaterIntake / 2500) * 100))),
    },
    {
      label: "Reminder adherence",
      value: summary.reminderSummary.adherencePercentage,
    },
  ];
}

function healthScore(summary: AnalyticsSummary) {
  const factors = wellnessFactors(summary);
  return Math.round(factors.reduce((sum, factor) => sum + factor.value, 0) / factors.length);
}

function insights(summary: AnalyticsSummary) {
  return [
    {
      title: "Cycle pattern",
      description: summary.cycleSummary.averageCycleLength
        ? `Average cycle length is ${summary.cycleSummary.averageCycleLength} days with ${summary.cycleSummary.irregularCycleCount} irregular cycles.`
        : "Cycle analytics will appear after cycle records are added.",
    },
    {
      title: "Symptoms and stress",
      description: summary.healthSummary.mostCommonSymptoms.length
        ? `${mostCommonSymptom(summary)} is the most common logged symptom. Average stress is ${summary.healthSummary.averageStressLevel}/10.`
        : "Symptom insights will appear after health logs are added.",
    },
    {
      title: "PCOS assessments",
      description: summary.pcosSummary.assessmentCount
        ? `Latest PCOS risk is ${summary.pcosSummary.latestRiskLevel} at ${Math.round((summary.pcosSummary.latestProbability || 0) * 100)}%.`
        : "PCOS assessment insights will appear after the first assessment.",
    },
  ];
}

function suggestions(summary: AnalyticsSummary) {
  const items = [];

  if (summary.healthSummary.averageWaterIntake && summary.healthSummary.averageWaterIntake < 2000) {
    items.push("Increase water intake toward a steady 2L+ daily rhythm.");
  }

  if (summary.healthSummary.averageSleep && summary.healthSummary.averageSleep < 7) {
    items.push("Protect a longer sleep window when fatigue or pain levels rise.");
  }

  if (summary.reminderSummary.missedReminders > 0) {
    items.push("Review missed reminders and move care routines to easier time slots.");
  }

  if (summary.appointmentSummary.upcomingAppointments > 0) {
    items.push("Prepare recent cycles, logs, reports, and assessments for upcoming appointments.");
  }

  return items.length ? items : ["Add more logs, cycles, and reminders to unlock richer suggestions."];
}

export default function AnalyticsDashboardPage() {
  const [chartsReady, setChartsReady] = useState(false);
  const summary = useAnalyticsStore((state) => state.summary);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const error = useAnalyticsStore((state) => state.error);
  const fetchSummary = useAnalyticsStore((state) => state.fetchSummary);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const cycleTrend = summary?.cycleSummary.cycleLengthTrend.map((point) => ({
    ...point,
    month: point.label,
  })) ?? [];
  const symptomFrequency = summary?.healthSummary.mostCommonSymptoms ?? [];
  const healthTrend = summary?.chartData.healthTrend.map((point) => ({
    ...point,
    day: point.label,
    waterMl: point.waterIntake,
  })) ?? [];
  const adherenceData = summary
    ? [
        { name: "Completed", value: summary.reminderSummary.adherencePercentage, fill: "hsl(var(--primary))" },
        { name: "Missed", value: 100 - summary.reminderSummary.adherencePercentage, fill: "hsl(var(--muted))" },
      ]
    : [];

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

      {(error || isLoading) && (
        <section
          className={`rounded-3xl border px-5 py-4 text-sm font-bold ${
            error
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-border/60 bg-card text-muted-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {isLoading && !error ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
            {error || "Loading analytics..."}
          </span>
        </section>
      )}

      {!isLoading && !error && !summary && (
        <section className="rounded-3xl border border-dashed border-border bg-card p-6 text-center text-sm font-bold text-muted-foreground">
          Analytics will appear after your first health record is saved.
        </section>
      )}

      {summary && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <SummaryCard label="Average cycle length" value={`${summary.cycleSummary.averageCycleLength || 0} days`} icon={CalendarDays} />
            <SummaryCard label="Average sleep" value={`${summary.healthSummary.averageSleep || 0} hrs`} icon={Moon} />
            <SummaryCard label="Average water intake" value={`${summary.healthSummary.averageWaterIntake || 0} ml`} icon={Droplet} />
            <SummaryCard label="PCOS risk" value={summary.pcosSummary.latestRiskLevel ?? "No assessment"} icon={BrainCircuit} />
            <SummaryCard label="Reminder adherence" value={`${summary.reminderSummary.adherencePercentage}%`} icon={Pill} />
            <SummaryCard label="Most common symptom" value={mostCommonSymptom(summary)} icon={HeartPulse} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Cycle trend" description="Cycle length across recent cycle records.">
              {chartsReady && cycleTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle()} />
                    <Line type="monotone" dataKey="cycleLength" name="Cycle length" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Cycle trend appears after cycle records are added." />
              )}
            </ChartCard>

            <ChartCard title="Symptom frequency" description="Most frequently logged symptoms.">
              {chartsReady && symptomFrequency.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                    <XAxis dataKey="symptom" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle()} />
                    <Bar dataKey="count" name="Logs" radius={[8, 8, 0, 0]} maxBarSize={42} isAnimationActive>
                      {symptomFrequency.map((entry, index) => (
                        <Cell key={entry.symptom} fill={index % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Symptom frequency appears after health logs are added." />
              )}
            </ChartCard>

            <ChartCard title="Pain and stress" description="Logged pain and stress levels over time.">
              {chartsReady && healthTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 10]} />
                    <Tooltip contentStyle={chartTooltipStyle()} />
                    <Area type="monotone" dataKey="stressLevel" name="Stress level" stroke="hsl(var(--secondary))" strokeWidth={3} fill="url(#stressGradient)" isAnimationActive />
                    <Line type="monotone" dataKey="painLevel" name="Pain level" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Pain and stress trends appear after health logs are added." />
              )}
            </ChartCard>

            <ChartCard title="Sleep and hydration" description="Daily sleep hours and water intake.">
              {chartsReady && healthTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis yAxisId="sleep" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 10]} />
                    <YAxis yAxisId="water" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip contentStyle={chartTooltipStyle()} />
                    <Line yAxisId="sleep" type="monotone" dataKey="sleepHours" name="Sleep hours" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
                    <Line yAxisId="water" type="monotone" dataKey="waterMl" name="Water intake" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Sleep and hydration trends appear after health logs are added." />
              )}
            </ChartCard>

            <ChartCard title="Medication adherence" description="Reminder completion rate." className="xl:col-span-2">
              {chartsReady && (
                <div className="grid h-full gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={adherenceData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar dataKey="value" cornerRadius={12} background isAnimationActive />
                      <Tooltip contentStyle={chartTooltipStyle()} />
                    </RadialBarChart>
                  </ResponsiveContainer>

                  <div className="flex flex-col justify-center rounded-3xl border border-border/60 bg-muted/20 p-5">
                    <p className="text-5xl font-black tracking-tight text-foreground">
                      {summary.reminderSummary.adherencePercentage}%
                    </p>
                    <p className="mt-2 text-sm font-bold text-muted-foreground">
                      Reminder adherence
                    </p>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      {summary.reminderSummary.totalReminders
                        ? `${summary.reminderSummary.completedReminders} completed and ${summary.reminderSummary.missedReminders} missed reminders are included in this score.`
                        : "Add reminders and mark them complete to calculate adherence."}
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
                {insights(summary).map((insight) => (
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
                    {healthScore(summary)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white/85">Overall health score</p>
                </div>
                <Activity className="h-9 w-9 text-white/80" />
              </div>

              <div className="mt-6 space-y-3">
                {wellnessFactors(summary).map((factor) => (
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
                  {suggestions(summary).map((suggestion) => (
                    <li key={suggestion} className="flex gap-2">
                      <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
