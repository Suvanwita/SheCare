"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  CalendarDays,
  Gauge,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  FLOW_INTENSITY_VALUES,
  MOCK_CYCLE_ENTRIES,
  type CycleEntry,
} from "../../../data/mockCycle";
import { cn, formatDate } from "../../../lib/utils";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const cycleSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    flowIntensity: z.enum(["light", "medium", "heavy"], {
      message: "Select a flow intensity",
    }),
    notes: z.string().max(240, "Notes cannot exceed 240 characters").optional(),
  })
  .refine((data) => parseDate(data.endDate) >= parseDate(data.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

type CycleFormValues = z.infer<typeof cycleSchema>;

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getInclusiveLength(startDate: string, endDate: string) {
  return Math.max(1, Math.round((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / DAY_IN_MS) + 1);
}

function getSortedEntries(entries: CycleEntry[]) {
  return [...entries].sort(
    (a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
  );
}

function getStartDateIntervals(entries: CycleEntry[]) {
  const sortedEntries = getSortedEntries(entries);
  return sortedEntries.slice(1).map((entry, index) => {
    const previousEntry = sortedEntries[index];
    return Math.round(
      (parseDate(entry.startDate).getTime() - parseDate(previousEntry.startDate).getTime()) /
        DAY_IN_MS
    );
  });
}

function getAverageCycleLength(entries: CycleEntry[]) {
  const intervals = getStartDateIntervals(entries);
  if (intervals.length === 0) {
    return 28;
  }

  return Math.round(intervals.reduce((sum, length) => sum + length, 0) / intervals.length);
}

function getCycleStatus(entries: CycleEntry[]) {
  const intervals = getStartDateIntervals(entries);
  if (intervals.length < 2) {
    return "Regular";
  }

  return Math.max(...intervals) - Math.min(...intervals) <= 7 ? "Regular" : "Irregular";
}

function getLatestEntry(entries: CycleEntry[]) {
  return [...entries].sort(
    (a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
  )[0];
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="flex items-center gap-1 text-xs font-semibold text-destructive">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

function PredictionMetric({
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

export default function CycleDashboardPage() {
  const [entries, setEntries] = useState<CycleEntry[]>(MOCK_CYCLE_ENTRIES);
  const [chartsReady, setChartsReady] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      flowIntensity: "medium",
      notes: "",
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const latestEntry = useMemo(() => getLatestEntry(entries), [entries]);
  const averageCycleLength = useMemo(() => getAverageCycleLength(entries), [entries]);
  const cycleStatus = useMemo(() => getCycleStatus(entries), [entries]);
  const currentCycleDay = useMemo(() => {
    if (!latestEntry) {
      return 1;
    }

    return Math.max(
      1,
      Math.round((new Date().getTime() - parseDate(latestEntry.startDate).getTime()) / DAY_IN_MS) +
        1
    );
  }, [latestEntry]);

  const predictedNextPeriod = latestEntry
    ? formatDate(addDays(parseDate(latestEntry.startDate), averageCycleLength))
    : "Add a cycle";

  const sortedEntriesDescending = useMemo(
    () =>
      [...entries].sort(
        (a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
      ),
    [entries]
  );

  const cycleLengthTrend = useMemo(() => {
    const sortedEntries = getSortedEntries(entries);
    return sortedEntries.slice(1).map((entry, index) => {
      const previousEntry = sortedEntries[index];
      return {
        cycle: formatDate(entry.startDate),
        length: Math.round(
          (parseDate(entry.startDate).getTime() - parseDate(previousEntry.startDate).getTime()) /
            DAY_IN_MS
        ),
      };
    });
  }, [entries]);

  const flowTrend = useMemo(
    () =>
      getSortedEntries(entries).map((entry) => ({
        cycle: formatDate(entry.startDate),
        flow: FLOW_INTENSITY_VALUES[entry.flowIntensity],
        label: entry.flowIntensity,
      })),
    [entries]
  );

  const onSubmit = (data: CycleFormValues) => {
    setEntries((currentEntries) => [
      {
        id: `cycle-local-${currentEntries.length + 1}-${data.startDate}`,
        startDate: data.startDate,
        endDate: data.endDate,
        flowIntensity: data.flowIntensity,
        notes: data.notes?.trim() || undefined,
      },
      ...currentEntries,
    ]);
    reset({
      startDate: "",
      endDate: "",
      flowIntensity: "medium",
      notes: "",
    });
  };

  const deleteEntry = (id: string) => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              SheCare cycles
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
              Cycle Tracker
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your menstrual cycle and understand your patterns.
            </p>
          </div>

          <div
            className={cn(
              "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black",
              cycleStatus === "Regular"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {cycleStatus}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-black text-foreground">Add cycle entry</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              New entries update predictions, history, and charts immediately.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Start date
              </span>
              <input
                type="date"
                {...register("startDate")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.startDate ? "border-destructive/60" : "border-border/80"
                )}
              />
              <FieldError message={errors.startDate?.message} />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                End date
              </span>
              <input
                type="date"
                {...register("endDate")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.endDate ? "border-destructive/60" : "border-border/80"
                )}
              />
              <FieldError message={errors.endDate?.message} />
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Flow intensity
            </span>
            <select
              {...register("flowIntensity")}
              className={cn(
                "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm capitalize outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                errors.flowIntensity ? "border-destructive/60" : "border-border/80"
              )}
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
            <FieldError message={errors.flowIntensity?.message} />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Notes
            </span>
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Symptoms, mood, medication, or care notes..."
              className={cn(
                "w-full resize-none rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                errors.notes ? "border-destructive/60" : "border-border/80"
              )}
            />
            <FieldError message={errors.notes?.message} />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Plus className="h-4 w-4" />
            Add cycle
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          <PredictionMetric label="Current cycle day" value={`Day ${currentCycleDay}`} icon={CalendarDays} />
          <PredictionMetric label="Average cycle length" value={`${averageCycleLength} days`} icon={TrendingUp} />
          <PredictionMetric label="Predicted next period" value={predictedNextPeriod} icon={Sparkles} />
          <PredictionMetric label="Fertile window" value="Day 12-17 estimate" icon={Gauge} />
        </div>
      </section>

      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">Cycle history</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Local entries are kept in state for this session.
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">{entries.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Start date</th>
                <th className="px-3 py-2">End date</th>
                <th className="px-3 py-2">Length</th>
                <th className="px-3 py-2">Flow</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntriesDescending.map((entry) => (
                <tr key={entry.id} className="rounded-2xl bg-card shadow-sm">
                  <td className="rounded-l-2xl px-3 py-3 font-bold text-foreground">
                    {formatDate(entry.startDate)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(entry.endDate)}</td>
                  <td className="px-3 py-3 font-semibold">
                    {getInclusiveLength(entry.startDate, entry.endDate)} days
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold capitalize text-primary">
                      {entry.flowIntensity}
                    </span>
                  </td>
                  <td className="max-w-xs px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                    {entry.notes || "No notes"}
                  </td>
                  <td className="rounded-r-2xl px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteEntry(entry.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete cycle entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <h3 className="text-lg font-black text-foreground">Cycle length trend</h3>
          <p className="mt-1 text-xs text-muted-foreground">Based on days between period start dates.</p>
          <div className="mt-5 h-[300px] min-w-0">
            {chartsReady && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleLengthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                  <XAxis dataKey="cycle" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[20, 36]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                    }}
                  />
                  <Line type="monotone" dataKey="length" name="Cycle length" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <h3 className="text-lg font-black text-foreground">Flow intensity</h3>
          <p className="mt-1 text-xs text-muted-foreground">Light = 1, medium = 2, heavy = 3.</p>
          <div className="mt-5 h-[300px] min-w-0">
            {chartsReady && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.45)" />
                  <XAxis dataKey="cycle" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 3]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                    }}
                  />
                  <Bar dataKey="flow" name="Flow intensity" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
