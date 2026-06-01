"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertCircle,
  CalendarDays,
  Droplet,
  Filter,
  HeartPulse,
  Loader2,
  Moon,
  Plus,
  Scale,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { useHealthLogStore } from "../../../store/healthLogStore";
import type {
  HealthLog,
  HealthMood,
  HealthSymptom,
} from "../../../services/healthLog.service";
import { cn, formatDate } from "../../../lib/utils";

const HEALTH_MOOD_OPTIONS: Array<{ value: HealthMood; label: string }> = [
  { value: "happy", label: "Happy" },
  { value: "calm", label: "Calm" },
  { value: "tired", label: "Tired" },
  { value: "stressed", label: "Stressed" },
  { value: "sad", label: "Sad" },
  { value: "neutral", label: "Neutral" },
];

const HEALTH_SYMPTOM_OPTIONS: Array<{ value: HealthSymptom; label: string }> = [
  { value: "cramps", label: "Cramps" },
  { value: "headache", label: "Headache" },
  { value: "acne", label: "Acne" },
  { value: "bloating", label: "Bloating" },
  { value: "fatigue", label: "Fatigue" },
  { value: "nausea", label: "Nausea" },
  { value: "mood_swings", label: "Mood swings" },
];

const healthLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  mood: z.enum(["happy", "calm", "tired", "stressed", "sad", "neutral"], {
    message: "Choose a mood",
  }),
  symptoms: z
    .array(
      z.enum([
        "cramps",
        "headache",
        "acne",
        "bloating",
        "fatigue",
        "nausea",
        "mood_swings",
      ])
    )
    .min(1, "Select at least one symptom"),
  sleepHours: z.coerce
    .number({ message: "Sleep hours are required" })
    .min(0, "Sleep cannot be negative")
    .max(24, "Sleep cannot exceed 24 hours"),
  waterIntake: z.coerce
    .number({ message: "Water intake is required" })
    .min(0, "Water intake cannot be negative")
    .max(10000, "Water intake looks too high"),
  weightKg: z.coerce
    .number({ message: "Weight is required" })
    .min(20, "Enter a valid weight")
    .max(300, "Enter a valid weight"),
  painLevel: z.coerce
    .number({ message: "Pain level is required" })
    .min(0, "Pain level cannot be below 0")
    .max(10, "Pain level cannot exceed 10"),
  stressLevel: z.coerce
    .number({ message: "Stress level is required" })
    .min(0, "Stress level cannot be below 0")
    .max(10, "Stress level cannot exceed 10"),
  notes: z.string().max(280, "Notes cannot exceed 280 characters").optional(),
});

type HealthLogFormInput = z.input<typeof healthLogSchema>;
type HealthLogFormValues = z.output<typeof healthLogSchema>;
type MoodFilter = "all" | HealthMood;
type SymptomFilter = "all" | HealthSymptom;

const moodTone: Record<HealthMood, string> = {
  happy: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  calm: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
  tired: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  stressed: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  sad: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
  neutral: "bg-muted border-border text-muted-foreground",
};

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

function parseDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatSymptomLabel(symptom: HealthSymptom) {
  return HEALTH_SYMPTOM_OPTIONS.find((option) => option.value === symptom)?.label ?? symptom;
}

function getMostCommon<T extends string>(items: T[]) {
  if (items.length === 0) {
    return "No data";
  }

  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
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

export default function HealthLogsDashboardPage() {
  const logs = useHealthLogStore((state) => state.logs);
  const pagination = useHealthLogStore((state) => state.pagination);
  const isLoading = useHealthLogStore((state) => state.isLoading);
  const isSubmitting = useHealthLogStore((state) => state.isSubmitting);
  const error = useHealthLogStore((state) => state.error);
  const fetchLogs = useHealthLogStore((state) => state.fetchLogs);
  const createLog = useHealthLogStore((state) => state.createLog);
  const deleteLog = useHealthLogStore((state) => state.deleteLog);
  const clearError = useHealthLogStore((state) => state.clearError);
  const [moodFilter, setMoodFilter] = useState<MoodFilter>("all");
  const [symptomFilter, setSymptomFilter] = useState<SymptomFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HealthLogFormInput, unknown, HealthLogFormValues>({
    resolver: zodResolver(healthLogSchema),
    defaultValues: {
      date: "",
      mood: "calm",
      symptoms: [],
      sleepHours: undefined,
      waterIntake: undefined,
      weightKg: undefined,
      painLevel: undefined,
      stressLevel: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    fetchLogs({
      page: 1,
      limit: 20,
      mood: moodFilter,
      symptom: symptomFilter,
      startDate,
      endDate,
    });
  }, [endDate, fetchLogs, moodFilter, startDate, symptomFilter]);

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()
      ),
    [logs]
  );

  const averageSleep = useMemo(() => {
    const sleepLogs = logs.filter((log) => typeof log.sleepHours === "number");
    if (sleepLogs.length === 0) {
      return "0 hrs";
    }

    const average =
      sleepLogs.reduce((sum, log) => sum + (log.sleepHours ?? 0), 0) / sleepLogs.length;
    return `${average.toFixed(1)} hrs`;
  }, [logs]);

  const averageWater = useMemo(() => {
    const waterLogs = logs.filter((log) => typeof log.waterIntake === "number");
    if (waterLogs.length === 0) {
      return "0 ml";
    }

    const average = Math.round(
      waterLogs.reduce((sum, log) => sum + (log.waterIntake ?? 0), 0) / waterLogs.length
    );
    return `${average.toLocaleString()} ml`;
  }, [logs]);

  const mostCommonSymptom = useMemo(() => {
    const symptom = getMostCommon(logs.flatMap((log) => log.symptoms));
    return symptom === "No data" ? symptom : formatSymptomLabel(symptom as HealthSymptom);
  }, [logs]);

  const moodThisWeek = useMemo(() => {
    const latestLogDate = sortedLogs[0]?.date;
    if (!latestLogDate) {
      return "No data";
    }

    const latestTime = parseDate(latestLogDate).getTime();
    const weekMood = sortedLogs
      .filter((log) => latestTime - parseDate(log.date).getTime() <= 6 * 24 * 60 * 60 * 1000)
      .map((log) => log.mood);
    const mood = getMostCommon(weekMood);
    return mood === "No data" ? mood : mood.charAt(0).toUpperCase() + mood.slice(1);
  }, [sortedLogs]);

  const resetForm = () => {
    reset({
      date: "",
      mood: "calm",
      symptoms: [],
      sleepHours: undefined,
      waterIntake: undefined,
      weightKg: undefined,
      painLevel: undefined,
      stressLevel: undefined,
      notes: "",
    });
  };

  const onSubmit = async (data: HealthLogFormValues) => {
    setFormError("");
    clearError();

    try {
      await createLog({
        date: data.date,
        mood: data.mood,
        symptoms: data.symptoms,
        sleepHours: data.sleepHours,
        waterIntake: data.waterIntake,
        weightKg: data.weightKg,
        painLevel: data.painLevel,
        stressLevel: data.stressLevel,
        notes: data.notes?.trim() || undefined,
      });
      resetForm();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Unable to save health log."
      );
    }
  };

  const handleDelete = async (log: HealthLog) => {
    setFormError("");
    clearError();

    try {
      await deleteLog(log._id);
    } catch (deleteError) {
      setFormError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete health log."
      );
    }
  };

  const clearFilters = () => {
    setMoodFilter("all");
    setSymptomFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const filtersActive =
    moodFilter !== "all" || symptomFilter !== "all" || Boolean(startDate) || Boolean(endDate);

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          SheCare journal
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Health Logs
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Log symptoms, mood, sleep, hydration, and notes.
        </p>
      </section>

      {(error || formError) && (
        <div className="flex items-start gap-2 rounded-3xl border border-destructive/25 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Average sleep" value={averageSleep} icon={Moon} />
        <SummaryCard label="Average water intake" value={averageWater} icon={Droplet} />
        <SummaryCard label="Most common symptom" value={mostCommonSymptom} icon={HeartPulse} />
        <SummaryCard label="Mood this week" value={moodThisWeek} icon={Smile} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-black text-foreground">Add health log</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Entries are saved securely to your SheCare account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Date
              </span>
              <input
                type="date"
                {...register("date")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.date ? "border-destructive/60" : "border-border/80"
                )}
              />
              <FieldError message={errors.date?.message} />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Mood
              </span>
              <select
                {...register("mood")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.mood ? "border-destructive/60" : "border-border/80"
                )}
              >
                {HEALTH_MOOD_OPTIONS.map((mood) => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.mood?.message} />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Symptoms
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {HEALTH_SYMPTOM_OPTIONS.map((symptom) => (
                <label
                  key={symptom.value}
                  className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/10 px-3 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    value={symptom.value}
                    {...register("symptoms")}
                    className="h-4 w-4 accent-primary"
                  />
                  {symptom.label}
                </label>
              ))}
            </div>
            <FieldError message={errors.symptoms?.message} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Sleep hours
              </span>
              <input
                type="number"
                step="0.1"
                {...register("sleepHours")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.sleepHours ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="7.5"
              />
              <FieldError message={errors.sleepHours?.message} />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Water intake
              </span>
              <input
                type="number"
                {...register("waterIntake")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.waterIntake ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="2000 ml"
              />
              <FieldError message={errors.waterIntake?.message} />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Weight
              </span>
              <input
                type="number"
                step="0.1"
                {...register("weightKg")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.weightKg ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="63.5 kg"
              />
              <FieldError message={errors.weightKg?.message} />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Pain level
              </span>
              <input
                type="number"
                min={0}
                max={10}
                {...register("painLevel")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.painLevel ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="0-10"
              />
              <FieldError message={errors.painLevel?.message} />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Stress level
              </span>
              <input
                type="number"
                min={0}
                max={10}
                {...register("stressLevel")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.stressLevel ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="0-10"
              />
              <FieldError message={errors.stressLevel?.message} />
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Notes
            </span>
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Food, symptoms, medication, stressors, care notes..."
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
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isSubmitting ? "Saving..." : "Save health log"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-black text-foreground">Filters</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Mood
                </span>
                <select
                  value={moodFilter}
                  onChange={(event) => setMoodFilter(event.target.value as MoodFilter)}
                  className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
                >
                  <option value="all">All moods</option>
                  {HEALTH_MOOD_OPTIONS.map((mood) => (
                    <option key={mood.value} value={mood.value}>
                      {mood.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Symptom
                </span>
                <select
                  value={symptomFilter}
                  onChange={(event) => setSymptomFilter(event.target.value as SymptomFilter)}
                  className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
                >
                  <option value="all">All symptoms</option>
                  {HEALTH_SYMPTOM_OPTIONS.map((symptom) => (
                    <option key={symptom.value} value={symptom.value}>
                      {symptom.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Start date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  End date
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
                />
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/10 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Backend filters are applied automatically.
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Mood, symptom, and date range query params are sent to the API.
              </p>
            </div>

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
              <Moon className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-xs font-bold text-muted-foreground">Sleep target</p>
              <p className="text-lg font-black">7-9 hrs</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
              <Droplet className="h-5 w-5 text-sky-500" />
              <p className="mt-2 text-xs font-bold text-muted-foreground">Water target</p>
              <p className="text-lg font-black">2,500 ml</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
              <Scale className="h-5 w-5 text-emerald-500" />
              <p className="mt-2 text-xs font-bold text-muted-foreground">Weight logs</p>
              <p className="text-lg font-black">{pagination.total}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">Recent logs timeline</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing {logs.length} of {pagination.total} saved entries.
            </p>
          </div>
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading logs...
            </span>
          )}
        </div>

        <div className="relative space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-border">
          {!isLoading && sortedLogs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm font-bold text-foreground">No logs match these filters.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try clearing filters or adding a new health log.
              </p>
            </div>
          ) : (
            sortedLogs.map((log) => (
              <article key={log._id} className="relative pl-10">
                <span className="absolute left-2 top-5 h-4 w-4 rounded-full border-4 border-background bg-primary shadow-sm" />
                <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {formatDate(log.date)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-black capitalize",
                            moodTone[log.mood]
                          )}
                        >
                          {log.mood}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {log.sleepHours ?? 0}h sleep
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {(log.waterIntake ?? 0).toLocaleString()}ml water
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {log.weightKg ?? "-"}kg
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          Pain {log.painLevel ?? 0}/10
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          Stress {log.stressLevel ?? 0}/10
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(log)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {log.symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"
                      >
                        {formatSymptomLabel(symptom)}
                      </span>
                    ))}
                  </div>

                  {log.notes && (
                    <p className="mt-4 rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
                      {log.notes}
                    </p>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
