"use client";

import React, { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Activity,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  Info,
  Moon,
  Scale,
  ShieldAlert,
  Sparkles,
  Utensils,
} from "lucide-react";
import {
  PCOS_BASE_FACTORS,
  PCOS_HEALTH_TIPS,
  PCOS_RISK_PROFILES,
  type PcosRiskLevel,
  type PcosRiskProfile,
} from "../../../data/mockPCOS";
import { cn } from "../../../lib/utils";

const yesNoSchema = z.enum(["yes", "no"], {
  message: "Choose yes or no",
});

const pcosSchema = z.object({
  age: z.coerce.number({ message: "Age is required" }).min(12, "Enter a valid age").max(60, "Enter a valid age"),
  weight: z.coerce.number({ message: "Weight is required" }).min(20, "Enter a valid weight").max(250, "Enter a valid weight"),
  height: z.coerce.number({ message: "Height is required" }).min(100, "Enter height in cm").max(230, "Enter height in cm"),
  cycleLength: z.coerce.number({ message: "Cycle length is required" }).min(15, "Cycle length looks too short").max(90, "Cycle length looks too long"),
  irregularCycle: yesNoSchema,
  weightGain: yesNoSchema,
  hairGrowth: yesNoSchema,
  skinDarkening: yesNoSchema,
  pimples: yesNoSchema,
  fastFoodFrequency: z.coerce.number({ message: "Fast food frequency is required" }).min(0, "Cannot be negative").max(21, "Enter weekly frequency"),
  exerciseFrequency: z.coerce.number({ message: "Exercise frequency is required" }).min(0, "Cannot be negative").max(14, "Enter weekly frequency"),
  sleepHours: z.coerce.number({ message: "Sleep hours are required" }).min(0, "Sleep cannot be negative").max(24, "Sleep cannot exceed 24 hours"),
  stressLevel: z.coerce.number({ message: "Stress level is required" }).min(1, "Use a 1-10 scale").max(10, "Use a 1-10 scale"),
});

type PcosFormInput = z.input<typeof pcosSchema>;
type PcosFormValues = z.output<typeof pcosSchema>;

const riskTone: Record<PcosRiskLevel, string> = {
  "Low Risk": "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Moderate Risk": "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "High Risk": "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function calculateBmi(weight?: number, height?: number) {
  if (!weight || !height) {
    return 0;
  }

  const heightMeters = height / 100;
  return Number((weight / (heightMeters * heightMeters)).toFixed(1));
}

function createRiskResult(data: PcosFormValues): PcosRiskProfile {
  const bmi = calculateBmi(data.weight, data.height);
  let score = 8;

  if (data.irregularCycle === "yes") score += 18;
  if (data.cycleLength < 21 || data.cycleLength > 35) score += 12;
  if (data.weightGain === "yes") score += 10;
  if (data.hairGrowth === "yes") score += 12;
  if (data.skinDarkening === "yes") score += 10;
  if (data.pimples === "yes") score += 8;
  if (bmi >= 25) score += 10;
  if (data.fastFoodFrequency >= 4) score += 6;
  if (data.exerciseFrequency <= 1) score += 6;
  if (data.sleepHours < 6) score += 5;
  if (data.stressLevel >= 7) score += 5;

  const probability = Math.min(94, score);
  const level: PcosRiskLevel =
    probability >= 65 ? "High Risk" : probability >= 35 ? "Moderate Risk" : "Low Risk";

  return {
    level,
    probability,
    ...PCOS_RISK_PROFILES[level],
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-xs font-semibold text-destructive">
      {message}
    </p>
  );
}

function MetricInput({
  label,
  registration,
  error,
  placeholder,
  step,
}: {
  label: string;
  registration: ReturnType<typeof useForm<PcosFormInput>>["register"] extends (
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

function YesNoField({
  label,
  name,
  register,
  error,
}: {
  label: string;
  name: keyof Pick<PcosFormInput, "irregularCycle" | "weightGain" | "hairGrowth" | "skinDarkening" | "pimples">;
  register: ReturnType<typeof useForm<PcosFormInput>>["register"];
  error?: string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-bold uppercase tracking-wide text-foreground/80">
        {label}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {["yes", "no"].map((value) => (
          <label
            key={value}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-muted/10 px-3 py-2.5 text-xs font-bold capitalize text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <input
              type="radio"
              value={value}
              {...register(name)}
              className="h-4 w-4 accent-primary"
            />
            {value}
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

function FactorCard({
  label,
  description,
  value,
  icon: Icon,
}: {
  label: string;
  description: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="text-xs font-black text-muted-foreground">{value}%</span>
      </div>
      <p className="mt-3 text-sm font-black text-foreground">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function PcosRiskDashboardPage() {
  const [result, setResult] = useState<PcosRiskProfile | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PcosFormInput, unknown, PcosFormValues>({
    resolver: zodResolver(pcosSchema),
    defaultValues: {
      irregularCycle: "no",
      weightGain: "no",
      hairGrowth: "no",
      skinDarkening: "no",
      pimples: "no",
      fastFoodFrequency: undefined,
      exerciseFrequency: undefined,
      sleepHours: undefined,
      stressLevel: 5,
    },
  });

  const watchedWeight = useWatch({ control, name: "weight" });
  const watchedHeight = useWatch({ control, name: "height" });
  const bmi = useMemo(
    () => calculateBmi(Number(watchedWeight), Number(watchedHeight)),
    [watchedHeight, watchedWeight]
  );

  const onSubmit = (data: PcosFormValues) => {
    setResult(createRiskResult(data));
  };

  const probability = result?.probability ?? 0;
  const circumference = 2 * Math.PI * 72;
  const offset = circumference - (probability / 100) * circumference;
  const factorValues = [
    result ? Math.min(100, Math.round(probability * 0.9 + 8)) : 18,
    result ? Math.min(100, Math.round(probability * 0.8 + 10)) : 22,
    result ? Math.min(100, Math.round(probability * 0.65 + 14)) : 24,
    result ? Math.min(100, Math.round(probability * 0.7 + 12)) : 20,
  ];
  const factorIcons = [CalendarDays, Sparkles, Moon, Scale];

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          SheCare assessment
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          PCOS Risk Assessment
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Analyze symptoms and lifestyle indicators to estimate PCOS risk.
        </p>
      </section>

      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="text-sm font-black text-foreground">Informational assessment only</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              This is not a medical diagnosis. Risk estimation is informational and based on mocked
              frontend logic. Consult qualified healthcare professionals for medical advice,
              diagnosis, and treatment.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-black text-foreground">Assessment form</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              BMI is calculated automatically from weight and height.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricInput label="Age" registration={register("age")} error={errors.age?.message} placeholder="26" />
            <MetricInput label="Weight (kg)" registration={register("weight")} error={errors.weight?.message} placeholder="63.5" step="0.1" />
            <MetricInput label="Height (cm)" registration={register("height")} error={errors.height?.message} placeholder="164" step="0.1" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Auto-calculated BMI</p>
              <p className="mt-2 text-3xl font-black text-foreground">{bmi || "--"}</p>
            </div>
            <MetricInput label="Cycle length (days)" registration={register("cycleLength")} error={errors.cycleLength?.message} placeholder="28" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <YesNoField label="Irregular cycle" name="irregularCycle" register={register} error={errors.irregularCycle?.message} />
            <YesNoField label="Recent weight gain" name="weightGain" register={register} error={errors.weightGain?.message} />
            <YesNoField label="Excess hair growth" name="hairGrowth" register={register} error={errors.hairGrowth?.message} />
            <YesNoField label="Skin darkening" name="skinDarkening" register={register} error={errors.skinDarkening?.message} />
            <YesNoField label="Pimples/acne" name="pimples" register={register} error={errors.pimples?.message} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricInput label="Fast food / week" registration={register("fastFoodFrequency")} error={errors.fastFoodFrequency?.message} placeholder="3" />
            <MetricInput label="Exercise / week" registration={register("exerciseFrequency")} error={errors.exerciseFrequency?.message} placeholder="4" />
            <MetricInput label="Sleep hours" registration={register("sleepHours")} error={errors.sleepHours?.message} placeholder="7.5" step="0.1" />
            <MetricInput label="Stress level (1-10)" registration={register("stressLevel")} error={errors.stressLevel?.message} placeholder="5" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <BrainCircuit className="h-4 w-4" />
            Estimate PCOS risk
          </button>
        </form>

        <aside className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-secondary to-rose-500 p-6 text-white shadow-xl shadow-primary/20">
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">Risk result</p>
            <div className="mt-5 flex flex-col items-center text-center">
              <div className="relative h-44 w-44">
                <svg className="h-full w-full -rotate-90">
                  <circle cx="88" cy="88" r="72" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="14" />
                  <circle
                    cx="88"
                    cy="88"
                    r="72"
                    fill="none"
                    stroke="white"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">{probability}%</span>
                  <span className="text-xs font-bold text-white/75">Probability</span>
                </div>
              </div>

              <span
                className={cn(
                  "mt-4 rounded-full border bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur",
                  result ? riskTone[result.level] : "border-white/25 text-white"
                )}
              >
                {result?.level ?? "Awaiting assessment"}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-black text-foreground">Recommendations</h3>
            </div>
            <div className="mt-4 space-y-3">
              {(result?.recommendations ?? ["Complete the form to generate tailored mock recommendations."]).map((item) => (
                <p key={item} className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <h3 className="text-lg font-black text-foreground">Contributing factors</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Factor weights are placeholders for future ML-backed explanation.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {PCOS_BASE_FACTORS.map((factor, index) => (
              <FactorCard
                key={factor.label}
                label={factor.label}
                description={factor.description}
                value={factorValues[index]}
                icon={factorIcons[index]}
              />
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black text-foreground">Suggested next actions</h3>
          </div>
          <div className="mt-4 space-y-3">
            {(result?.nextActions ?? ["Submit the assessment to see suggested next actions."]).map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-xs leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black text-foreground">Health tips</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PCOS_HEALTH_TIPS.map((tip, index) => {
            const icons = [CalendarDays, Activity, Moon, Utensils];
            const Icon = icons[index];
            return (
              <div key={tip} className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{tip}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
