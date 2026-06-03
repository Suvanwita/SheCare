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
  Loader2,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useCycleStore } from "../../../store/cycleStore";
import type { Cycle, FlowIntensity } from "../../../services/cycle.service";
import {
  predictCycleIrregularity,
  type CycleIrregularityPrediction,
} from "../../../services/cycleMl.service";
import { cn, formatDate } from "../../../lib/utils";

const FLOW_INTENSITY_VALUES: Record<FlowIntensity, number> = {
  light: 1,
  medium: 2,
  heavy: 3,
};

const CYCLE_SYMPTOM_OPTIONS = [
  "cramps",
  "headache",
  "bloating",
  "fatigue",
  "nausea",
  "mood_swings",
  "back_pain",
];

const cycleSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    flowIntensity: z.enum(["light", "medium", "heavy"], {
      message: "Select a flow intensity",
    }),
    symptoms: z.array(z.string()).default([]),
    age: z.coerce.number({ message: "Age is required" }).min(10, "Enter a valid age").max(65, "Enter a valid age"),
    cycle_length: z.coerce.number({ message: "Cycle length is required" }).min(1, "Enter cycle length").max(120, "Check this value"),
    period_duration: z.coerce.number({ message: "Period duration is required" }).min(1, "Enter period duration").max(30, "Check this value"),
    stress_level: z.coerce.number({ message: "Stress level is required" }).min(0, "Use 0-10").max(10, "Use 0-10"),
    sleep_hours: z.coerce.number({ message: "Sleep hours are required" }).min(0, "Cannot be negative").max(24, "Cannot exceed 24"),
    exercise_frequency: z.coerce.number({ message: "Exercise frequency is required" }).min(0, "Cannot be negative").max(7, "Use days per week"),
    bmi: z.coerce.number({ message: "BMI is required" }).min(1, "Enter BMI").max(80, "Check this value"),
    mood_score: z.coerce.number({ message: "Mood score is required" }).min(0, "Use 0-10").max(10, "Use 0-10"),
    pain_level: z.coerce.number({ message: "Pain level is required" }).min(0, "Use 0-10").max(10, "Use 0-10"),
    weight_change: z.coerce.number({ message: "Weight change is required" }).min(-50, "Check this value").max(50, "Check this value"),
    previous_cycle_length: z.coerce.number({ message: "Previous cycle length is required" }).min(1, "Enter previous cycle length").max(120, "Check this value"),
    notes: z.string().max(240, "Notes cannot exceed 240 characters").optional(),
  })
  .refine((data) => parseDate(data.endDate) >= parseDate(data.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

type CycleFormInput = z.input<typeof cycleSchema>;
type CycleFormValues = z.output<typeof cycleSchema>;

function parseDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getLatestCycle(cycles: Cycle[]) {
  return [...cycles].sort(
    (a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
  )[0];
}

function getCurrentCycleDay(latestCycle?: Cycle) {
  if (!latestCycle) {
    return 1;
  }

  const dayInMs = 24 * 60 * 60 * 1000;
  return Math.max(
    1,
    Math.round((new Date().getTime() - parseDate(latestCycle.startDate).getTime()) / dayInMs) +
      1
  );
}

function formatSymptomLabel(symptom: string) {
  return symptom.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
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

function NumericField({
  label,
  registration,
  error,
  placeholder,
  step,
}: {
  label: string;
  registration: ReturnType<typeof useForm<CycleFormInput>>["register"] extends (
    name: infer Name
  ) => infer RegisterReturn
    ? RegisterReturn
    : never;
  error?: string;
  placeholder: string;
  step?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
        {label}
      </span>
      <input
        type="number"
        step={step}
        {...registration}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
          error ? "border-destructive/60" : "border-border/80"
        )}
      />
      <FieldError message={error} />
    </label>
  );
}

function InsightBadge({ level }: { level: CycleIrregularityPrediction["risk_level"] }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-black",
        level === "Low" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        level === "Moderate" &&
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        level === "High" &&
          "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
      )}
    >
      {level}
    </span>
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
        <span className="text-xs font-bold tracking-wide text-muted-foreground">
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
  const cycles = useCycleStore((state) => state.cycles);
  const pagination = useCycleStore((state) => state.pagination);
  const isLoading = useCycleStore((state) => state.isLoading);
  const isSubmitting = useCycleStore((state) => state.isSubmitting);
  const error = useCycleStore((state) => state.error);
  const fetchCycles = useCycleStore((state) => state.fetchCycles);
  const createCycle = useCycleStore((state) => state.createCycle);
  const deleteCycle = useCycleStore((state) => state.deleteCycle);
  const clearError = useCycleStore((state) => state.clearError);
  const [chartsReady, setChartsReady] = useState(false);
  const [formError, setFormError] = useState("");
  const [cycleInsight, setCycleInsight] = useState<CycleIrregularityPrediction | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CycleFormInput, unknown, CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      flowIntensity: "medium",
      symptoms: [],
      age: undefined,
      cycle_length: undefined,
      period_duration: undefined,
      stress_level: 5,
      sleep_hours: undefined,
      exercise_frequency: undefined,
      bmi: undefined,
      mood_score: 5,
      pain_level: 0,
      weight_change: 0,
      previous_cycle_length: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const latestCycle = useMemo(() => getLatestCycle(cycles), [cycles]);
  const sortedCyclesDescending = useMemo(
    () =>
      [...cycles].sort(
        (a, b) => parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime()
      ),
    [cycles]
  );
  const cycleStatus = cycleInsight?.cycle_pattern ?? "Awaiting ML result";
  const currentCycleDay = getCurrentCycleDay(latestCycle);
  const averageCycleLength = useMemo(() => {
    const lengths = cycles
      .map((cycle) => cycle.cycleLength)
      .filter((length): length is number => typeof length === "number");

    if (lengths.length === 0) {
      return 28;
    }

    return Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length);
  }, [cycles]);
  const averagePeriodDuration = useMemo(() => {
    const durations = cycles
      .map((cycle) => cycle.periodDuration)
      .filter((duration): duration is number => typeof duration === "number");

    if (durations.length === 0) {
      return 0;
    }

    return Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length);
  }, [cycles]);

  const cycleLengthTrend = useMemo(
    () =>
      [...cycles]
        .sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime())
        .filter((cycle) => typeof cycle.cycleLength === "number")
        .map((cycle) => ({
          cycle: formatDate(cycle.startDate),
          length: cycle.cycleLength,
        })),
    [cycles]
  );

  const flowTrend = useMemo(
    () =>
      [...cycles]
        .sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime())
        .map((cycle) => ({
          cycle: formatDate(cycle.startDate),
          flow: FLOW_INTENSITY_VALUES[cycle.flowIntensity],
          label: cycle.flowIntensity,
        })),
    [cycles]
  );

  const resetCycleForm = () => {
    reset({
      startDate: "",
      endDate: "",
      flowIntensity: "medium",
      symptoms: [],
      age: undefined,
      cycle_length: undefined,
      period_duration: undefined,
      stress_level: 5,
      sleep_hours: undefined,
      exercise_frequency: undefined,
      bmi: undefined,
      mood_score: 5,
      pain_level: 0,
      weight_change: 0,
      previous_cycle_length: undefined,
      notes: "",
    });
  };

  const onSubmit = async (data: CycleFormValues) => {
    setFormError("");
    setInsightError(null);
    setCycleInsight(null);
    clearError();

    try {
      await createCycle({
        startDate: data.startDate,
        endDate: data.endDate,
        flowIntensity: data.flowIntensity,
        symptoms: data.symptoms,
        notes: data.notes?.trim() || undefined,
      });
      resetCycleForm();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Unable to save cycle.");
      return;
    }

    try {
      const insight = await predictCycleIrregularity({
        age: data.age,
        cycle_length: data.cycle_length,
        period_duration: data.period_duration,
        stress_level: data.stress_level,
        sleep_hours: data.sleep_hours,
        exercise_frequency: data.exercise_frequency,
        bmi: data.bmi,
        mood_score: data.mood_score,
        pain_level: data.pain_level,
        weight_change: data.weight_change,
        previous_cycle_length: data.previous_cycle_length,
      });
      setCycleInsight(insight);
    } catch {
      setInsightError("Cycle saved, but ML cycle insight is temporarily unavailable.");
    }
  };

  const handleDelete = async (cycle: Cycle) => {
    setFormError("");
    clearError();

    try {
      await deleteCycle(cycle._id);
    } catch (deleteError) {
      setFormError(deleteError instanceof Error ? deleteError.message : "Unable to delete cycle.");
    }
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
              Track your menstrual cycle. Entries are stored in SheCare; results come from the ML model.
            </p>
          </div>

          <div
            className={cn(
              "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black",
              cycleStatus === "Regular"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : cycleStatus === "Irregular"
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border bg-card text-muted-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {cycleStatus}
          </div>
        </div>
      </section>

      {(error || formError) && (
        <div className="flex items-start gap-2 rounded-3xl border border-destructive/25 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-black text-foreground">Add cycle entry</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cycle dates are saved to the backend. The insight below is generated by the ML model.
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

          <div className="mt-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Symptoms
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {CYCLE_SYMPTOM_OPTIONS.map((symptom) => (
                <label
                  key={symptom}
                  className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/10 px-3 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    value={symptom}
                    {...register("symptoms")}
                    className="h-4 w-4 accent-primary"
                  />
                  {formatSymptomLabel(symptom)}
                </label>
              ))}
            </div>
            <FieldError message={errors.symptoms?.message} />
          </div>

          <div className="mt-5 border-t border-border/60 pt-5">
            <h4 className="text-sm font-black text-foreground">Cycle Insight Inputs</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              These values are sent only to the cycle ML service and are not stored in the database.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumericField label="Age" registration={register("age")} error={errors.age?.message} placeholder="29" />
              <NumericField label="Cycle length (days)" registration={register("cycle_length")} error={errors.cycle_length?.message} placeholder="28" />
              <NumericField label="Period duration (days)" registration={register("period_duration")} error={errors.period_duration?.message} placeholder="5" />
              <NumericField label="Previous cycle length" registration={register("previous_cycle_length")} error={errors.previous_cycle_length?.message} placeholder={`${averageCycleLength}`} />
              <NumericField label="Stress level (0-10)" registration={register("stress_level")} error={errors.stress_level?.message} placeholder="5" />
              <NumericField label="Sleep hours" registration={register("sleep_hours")} error={errors.sleep_hours?.message} placeholder="7" step="0.1" />
              <NumericField label="Exercise days/week" registration={register("exercise_frequency")} error={errors.exercise_frequency?.message} placeholder="3" />
              <NumericField label="BMI" registration={register("bmi")} error={errors.bmi?.message} placeholder="24.5" step="0.1" />
              <NumericField label="Mood score (0-10)" registration={register("mood_score")} error={errors.mood_score?.message} placeholder="6" />
              <NumericField label="Pain level (0-10)" registration={register("pain_level")} error={errors.pain_level?.message} placeholder="3" />
              <NumericField label="Weight change (kg)" registration={register("weight_change")} error={errors.weight_change?.message} placeholder="0" step="0.1" />
            </div>
          </div>

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
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isSubmitting ? "Saving and analyzing..." : "Add cycle"}
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          <PredictionMetric label="Current cycle day" value={`Day ${currentCycleDay}`} icon={CalendarDays} />
          <PredictionMetric label="Stored average cycle" value={`${averageCycleLength} days`} icon={TrendingUp} />
          <PredictionMetric label="Stored average period" value={`${averagePeriodDuration} days`} icon={Gauge} />
          <PredictionMetric label="ML pattern" value={cycleInsight?.cycle_pattern ?? "Run analysis"} icon={Sparkles} />
        </div>
      </section>

      {(cycleInsight || insightError) && (
        <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-black text-foreground">Cycle Insight</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                ML-backed cycle irregularity analysis from the cycle service.
              </p>
            </div>
          </div>
          {cycleInsight && <InsightBadge level={cycleInsight.risk_level} />}
        </div>

        {insightError ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-semibold text-amber-700 dark:text-amber-300">
            {insightError}
          </div>
        ) : null}

        {cycleInsight ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Cycle Pattern
              </p>
              <p className="mt-2 text-3xl font-black text-foreground">
                {cycleInsight.cycle_pattern}
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Probability
              </p>
              <p className="mt-1 text-2xl font-black text-foreground">
                {Math.round(cycleInsight.probability * 100)}%
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {cycleInsight.contributing_factors.map((factor) => (
                  <div
                    key={factor.factor}
                    className="rounded-2xl border border-border/60 bg-card p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-foreground">
                        {formatSymptomLabel(factor.factor)}
                      </p>
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-black text-primary">
                        {Math.round(factor.impact * 100)}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {factor.description}
                    </p>
                  </div>
                ))}
              </div>

              <p className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
                {cycleInsight.recommendation}
              </p>
              <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs leading-relaxed text-muted-foreground">
                {cycleInsight.disclaimer}
              </p>
            </div>
          </div>
        ) : null}
        </section>
      )}

      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">Cycle history</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing saved cycle entries from your SheCare account.
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {isLoading ? "Loading..." : `${pagination.total} entries`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Start date</th>
                <th className="px-3 py-2">End date</th>
                <th className="px-3 py-2">Cycle length</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Flow</th>
                <th className="px-3 py-2">Symptoms</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCyclesDescending.length === 0 ? (
                <tr>
                  <td colSpan={8} className="rounded-2xl bg-card px-3 py-6 text-center text-sm font-semibold text-muted-foreground">
                    No cycle entries yet.
                  </td>
                </tr>
              ) : (
                sortedCyclesDescending.map((cycle) => (
                  <tr key={cycle._id} className="rounded-2xl bg-card shadow-sm">
                    <td className="rounded-l-2xl px-3 py-3 font-bold text-foreground">
                      {formatDate(cycle.startDate)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {cycle.endDate ? formatDate(cycle.endDate) : "-"}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {cycle.cycleLength ?? "-"} days
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {cycle.periodDuration ?? "-"} days
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold capitalize text-primary">
                        {cycle.flowIntensity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {cycle.symptoms.length > 0
                        ? cycle.symptoms.map(formatSymptomLabel).join(", ")
                        : "None"}
                    </td>
                    <td className="max-w-xs px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                      {cycle.notes || "No notes"}
                    </td>
                    <td className="rounded-r-2xl px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(cycle)}
                        disabled={isSubmitting}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Delete cycle entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <h3 className="text-lg font-black text-foreground">Cycle length trend</h3>
          <p className="mt-1 text-xs text-muted-foreground">Based on stored cycle history.</p>
          <div className="mt-5 h-[300px] min-w-0">
            {chartsReady && cycleLengthTrend.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm font-bold text-muted-foreground">
                Cycle length trend appears after cycle records are added.
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <h3 className="text-lg font-black text-foreground">Flow intensity</h3>
          <p className="mt-1 text-xs text-muted-foreground">Light = 1, medium = 2, heavy = 3.</p>
          <div className="mt-5 h-[300px] min-w-0">
            {chartsReady && flowTrend.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm font-bold text-muted-foreground">
                Flow trend appears after cycle records are added.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
