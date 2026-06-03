"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Activity,
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  HeartPulse,
  Info,
  Loader2,
  Microscope,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { cn, formatDate } from "../../../lib/utils";
import { usePcosStore } from "../../../store/pcosStore";
import type {
  PcosContributingFactor,
  PcosInput,
  PcosPredictionResult,
  PcosRiskLevel,
} from "../../../services/pcos.service";

const yesNoNumberSchema = z.coerce
  .number({ message: "Choose yes or no" })
  .refine((value) => value === 0 || value === 1, "Choose yes or no");

const pcosSchema = z.object({
  age_yrs: z.coerce.number({ message: "Age is required" }).min(12, "Enter a valid age").max(60, "Enter a valid age"),
  weight_kg: z.coerce.number({ message: "Weight is required" }).min(20, "Enter a valid weight").max(250, "Enter a valid weight"),
  height_cm: z.coerce.number({ message: "Height is required" }).min(100, "Enter height in cm").max(230, "Enter height in cm"),
  bmi: z.coerce.number().min(1, "BMI is calculated from weight and height"),
  cycle_r_i: z.coerce.number({ message: "Choose cycle regularity" }).refine((value) => value === 2 || value === 4, "Choose cycle regularity"),
  cycle_length_days: z.coerce.number({ message: "Cycle length is required" }).min(1, "Enter cycle length").max(120, "Cycle length looks too long"),
  weight_gain_y_n: yesNoNumberSchema,
  hair_growth_y_n: yesNoNumberSchema,
  skin_darkening_y_n: yesNoNumberSchema,
  hair_loss_y_n: yesNoNumberSchema,
  pimples_y_n: yesNoNumberSchema,
  fast_food_y_n: yesNoNumberSchema,
  reg_exercise_y_n: yesNoNumberSchema,
  follicle_no_l: z.coerce.number({ message: "Left follicle count is required" }).min(0, "Cannot be negative").max(100, "Check this value"),
  follicle_no_r: z.coerce.number({ message: "Right follicle count is required" }).min(0, "Cannot be negative").max(100, "Check this value"),
  amh_ng_ml: z.coerce.number({ message: "AMH is required" }).min(0, "Cannot be negative").max(100, "Check this value"),
  fsh_miu_ml: z.coerce.number({ message: "FSH is required" }).min(0, "Cannot be negative").max(200, "Check this value"),
  lh_miu_ml: z.coerce.number({ message: "LH is required" }).min(0.01, "LH must be greater than 0").max(200, "Check this value"),
  fsh_lh: z.coerce.number().min(0, "FSH/LH is calculated from lab values"),
  tsh_miu_l: z.coerce.number({ message: "TSH is required" }).min(0, "Cannot be negative").max(100, "Check this value"),
  vit_d3_ng_ml: z.coerce.number({ message: "Vitamin D3 is required" }).min(0, "Cannot be negative").max(300, "Check this value"),
  waist_inch: z.coerce.number({ message: "Waist is required" }).min(10, "Enter waist in inches").max(100, "Check this value"),
  hip_inch: z.coerce.number({ message: "Hip is required" }).min(10, "Enter hip in inches").max(100, "Check this value"),
  waist_hip_ratio: z.coerce.number().min(0.1, "Waist-hip ratio is calculated from waist and hip"),
});

type PcosFormInput = z.input<typeof pcosSchema>;
type PcosFormValues = z.output<typeof pcosSchema>;

const riskTone: Record<PcosRiskLevel, string> = {
  Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Moderate: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  High: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const featureLabels: Record<string, string> = {
  age_yrs: "Age",
  weight_kg: "Weight",
  height_cm: "Height",
  bmi: "BMI",
  cycle_r_i: "Cycle regularity",
  cycle_length_days: "Cycle length",
  weight_gain_y_n: "Weight gain",
  hair_growth_y_n: "Hair growth",
  skin_darkening_y_n: "Skin darkening",
  hair_loss_y_n: "Hair loss",
  pimples_y_n: "Pimples",
  fast_food_y_n: "Fast food",
  reg_exercise_y_n: "Regular exercise",
  follicle_no_l: "Follicle count left",
  follicle_no_r: "Follicle count right",
  amh_ng_ml: "AMH",
  fsh_miu_ml: "FSH",
  lh_miu_ml: "LH",
  fsh_lh: "FSH/LH Ratio",
  tsh_miu_l: "TSH",
  vit_d3_ng_ml: "Vitamin D3",
  waist_inch: "Waist",
  hip_inch: "Hip",
  waist_hip_ratio: "Waist-hip ratio",
};

function calculateBmi(weight?: number, height?: number) {
  if (!weight || !height) return 0;
  const heightMeters = height / 100;
  return Number((weight / (heightMeters * heightMeters)).toFixed(2));
}

function calculateRatio(numerator?: number, denominator?: number) {
  if (!numerator || !denominator) return 0;
  return Number((numerator / denominator).toFixed(3));
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-semibold text-destructive">{message}</p>;
}

function MetricInput({
  label,
  registration,
  error,
  placeholder,
  step,
  readOnly,
  value,
}: {
  label: string;
  registration?: ReturnType<typeof useForm<PcosFormInput>>["register"] extends (
    name: infer Name
  ) => infer RegisterReturn
    ? RegisterReturn
    : never;
  error?: string;
  placeholder: string;
  step?: string;
  readOnly?: boolean;
  value?: number;
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
        value={readOnly ? value || "" : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
          readOnly ? "cursor-default border-primary/20 bg-primary/10 font-bold text-primary" : "",
          error ? "border-destructive/60" : "border-border/80"
        )}
      />
      <FieldError message={error} />
    </label>
  );
}

function SelectField({
  label,
  registration,
  error,
  options,
}: {
  label: string;
  registration: ReturnType<typeof useForm<PcosFormInput>>["register"] extends (
    name: infer Name
  ) => infer RegisterReturn
    ? RegisterReturn
    : never;
  error?: string;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
        {label}
      </span>
      <select
        {...registration}
        className={cn(
          "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
          error ? "border-destructive/60" : "border-border/80"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  );
}

function FactorRow({
  feature,
  value,
  importance,
}: {
  feature: string;
  value: number;
  importance: number;
}) {
  const percent = Math.min(100, Math.round(importance * 100));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-foreground">
            {featureLabels[feature] ?? feature}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Input value: {value}</p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
          {percent}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function HistoryItem({
  createdAt,
  result,
}: {
  createdAt?: string;
  result: PcosPredictionResult;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-foreground">
            {Math.round(result.probability * 100)}% probability
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {createdAt ? formatDate(createdAt) : "Recent assessment"}
          </p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-black", riskTone[result.risk_level])}>
          {result.risk_level}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {result.message}
      </p>
    </div>
  );
}

export default function PcosRiskDashboardPage() {
  const currentAssessment = usePcosStore((state) => state.currentAssessment);
  const history = usePcosStore((state) => state.history);
  const isLoading = usePcosStore((state) => state.isLoading);
  const isSubmitting = usePcosStore((state) => state.isSubmitting);
  const error = usePcosStore((state) => state.error);
  const predictPcos = usePcosStore((state) => state.predictPcos);
  const fetchHistory = usePcosStore((state) => state.fetchHistory);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PcosFormInput, unknown, PcosFormValues>({
    resolver: zodResolver(pcosSchema),
    defaultValues: {
      cycle_r_i: 2,
      weight_gain_y_n: 0,
      hair_growth_y_n: 0,
      skin_darkening_y_n: 0,
      hair_loss_y_n: 0,
      pimples_y_n: 0,
      fast_food_y_n: 0,
      reg_exercise_y_n: 1,
      bmi: 0,
      fsh_lh: 0,
      waist_hip_ratio: 0,
    },
  });

  const watchedWeight = useWatch({ control, name: "weight_kg" });
  const watchedHeight = useWatch({ control, name: "height_cm" });
  const watchedWaist = useWatch({ control, name: "waist_inch" });
  const watchedHip = useWatch({ control, name: "hip_inch" });
  const watchedFsh = useWatch({ control, name: "fsh_miu_ml" });
  const watchedLh = useWatch({ control, name: "lh_miu_ml" });

  const bmi = useMemo(
    () => calculateBmi(Number(watchedWeight), Number(watchedHeight)),
    [watchedHeight, watchedWeight]
  );
  const waistHipRatio = useMemo(
    () => calculateRatio(Number(watchedWaist), Number(watchedHip)),
    [watchedHip, watchedWaist]
  );
  const fshLhRatio = useMemo(
    () => calculateRatio(Number(watchedFsh), Number(watchedLh)),
    [watchedFsh, watchedLh]
  );

  useEffect(() => {
    setValue("bmi", bmi, { shouldValidate: Boolean(bmi) });
  }, [bmi, setValue]);

  useEffect(() => {
    setValue("waist_hip_ratio", waistHipRatio, { shouldValidate: Boolean(waistHipRatio) });
  }, [setValue, waistHipRatio]);

  useEffect(() => {
    setValue("fsh_lh", fshLhRatio, { shouldValidate: Boolean(fshLhRatio) });
  }, [fshLhRatio, setValue]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onSubmit = async (data: PcosFormValues) => {
    try {
      await predictPcos(data as PcosInput);
    } catch {
      // Store error state is rendered below the form.
    }
  };

  const result = currentAssessment?.result ?? null;
  const probability = result ? Math.round(result.probability * 100) : 0;
  const circumference = 2 * Math.PI * 72;
  const offset = circumference - (probability / 100) * circumference;

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
          Estimate PCOS risk using the SheCare ML service and clinically relevant inputs.
        </p>
      </section>

      <section className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div>
            <h3 className="text-sm font-black text-foreground">Medical disclaimer</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              This assessment is informational and is processed through the SheCare backend. It is not a diagnosis.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2">
            <Microscope className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-black text-foreground">Assessment form</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                BMI, FSH/LH, and waist-hip ratio are calculated automatically.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricInput label="Age" registration={register("age_yrs")} error={errors.age_yrs?.message} placeholder="28" />
            <MetricInput label="Weight (kg)" registration={register("weight_kg")} error={errors.weight_kg?.message} placeholder="65" step="0.1" />
            <MetricInput label="Height (cm)" registration={register("height_cm")} error={errors.height_cm?.message} placeholder="160" step="0.1" />
            <MetricInput label="BMI" registration={register("bmi")} error={errors.bmi?.message} placeholder="Auto" step="0.01" readOnly value={bmi} />
            <SelectField
              label="Cycle regularity"
              registration={register("cycle_r_i")}
              error={errors.cycle_r_i?.message}
              options={[
                { label: "Regular", value: "2" },
                { label: "Irregular", value: "4" },
              ]}
            />
            <MetricInput label="Cycle length (days)" registration={register("cycle_length_days")} error={errors.cycle_length_days?.message} placeholder="28" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Recent weight gain", "weight_gain_y_n"],
              ["Excess hair growth", "hair_growth_y_n"],
              ["Skin darkening", "skin_darkening_y_n"],
              ["Hair loss", "hair_loss_y_n"],
              ["Pimples/acne", "pimples_y_n"],
              ["Fast food intake", "fast_food_y_n"],
              ["Regular exercise", "reg_exercise_y_n"],
            ].map(([label, name]) => (
              <SelectField
                key={name}
                label={label}
                registration={register(name as keyof PcosFormInput)}
                error={errors[name as keyof PcosFormValues]?.message}
                options={[
                  { label: "No", value: "0" },
                  { label: "Yes", value: "1" },
                ]}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricInput label="Follicle no. left" registration={register("follicle_no_l")} error={errors.follicle_no_l?.message} placeholder="8" />
            <MetricInput label="Follicle no. right" registration={register("follicle_no_r")} error={errors.follicle_no_r?.message} placeholder="9" />
            <MetricInput label="AMH (ng/mL)" registration={register("amh_ng_ml")} error={errors.amh_ng_ml?.message} placeholder="5.2" step="0.01" />
            <MetricInput label="FSH (mIU/mL)" registration={register("fsh_miu_ml")} error={errors.fsh_miu_ml?.message} placeholder="6.5" step="0.01" />
            <MetricInput label="LH (mIU/mL)" registration={register("lh_miu_ml")} error={errors.lh_miu_ml?.message} placeholder="8.1" step="0.01" />
            <MetricInput label="FSH/LH Ratio" registration={register("fsh_lh")} error={errors.fsh_lh?.message} placeholder="Auto" step="0.001" readOnly value={fshLhRatio} />
            <MetricInput label="TSH (mIU/L)" registration={register("tsh_miu_l")} error={errors.tsh_miu_l?.message} placeholder="2.1" step="0.01" />
            <MetricInput label="Vitamin D3 (ng/mL)" registration={register("vit_d3_ng_ml")} error={errors.vit_d3_ng_ml?.message} placeholder="22" step="0.1" />
            <MetricInput label="Waist (inch)" registration={register("waist_inch")} error={errors.waist_inch?.message} placeholder="32" step="0.1" />
            <MetricInput label="Hip (inch)" registration={register("hip_inch")} error={errors.hip_inch?.message} placeholder="38" step="0.1" />
            <MetricInput label="Waist-hip ratio" registration={register("waist_hip_ratio")} error={errors.waist_hip_ratio?.message} placeholder="Auto" step="0.001" readOnly value={waistHipRatio} />
          </div>

          {error ? (
            <div className="mt-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            {isSubmitting ? "Estimating risk..." : "Estimate PCOS risk"}
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
                  "mt-4 rounded-full border px-3 py-1.5 text-xs font-black backdrop-blur",
                  result ? riskTone[result.risk_level] : "border-white/25 bg-white/15 text-white"
                )}
              >
                {result?.risk_level ?? "Awaiting assessment"}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-black text-foreground">ML Response</h3>
            </div>
            <p className="mt-4 rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
              {result?.message ?? "Submit the assessment to receive a model-backed result."}
            </p>
            {result ? (
              <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Assessment completed successfully from the ML service.
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black text-foreground">Top contributing factors</h3>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {result?.top_contributing_factors?.length ? (
              result.top_contributing_factors.map((factor) => (
                <FactorRow key={factor.feature} {...(factor as PcosContributingFactor)} />
              ))
            ) : (
              <p className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-2">
                Model explanation will appear after a successful prediction.
              </p>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black text-foreground">Recommendation</h3>
          </div>
          <p className="mt-4 rounded-2xl border border-border/60 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            {result?.recommendation ?? "Recommendations from the ML service will appear here."}
          </p>
          <div className="mt-4 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <Activity className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {result?.disclaimer ?? "The prediction output is not a medical diagnosis."}
            </p>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black text-foreground">Assessment history</h3>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <p className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm font-bold text-muted-foreground md:col-span-2 xl:col-span-3">
              Loading previous assessments...
            </p>
          ) : history.length ? (
            history.map((assessment) => (
              <HistoryItem
                key={assessment._id}
                createdAt={assessment.createdAt}
                result={assessment.result}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
              Previous PCOS assessments will appear here after your first prediction.
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
