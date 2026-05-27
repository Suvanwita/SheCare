"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { SYMPTOM_OPTIONS, MOOD_OPTIONS } from "../../constants";
import { SymptomLog } from "../../types";
import { Check, ClipboardList, AlertCircle, Sparkles, HeartPulse, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

// 1. Zod Validation Schema
const symptomSchema = z.object({
  severity: z.enum(["mild", "moderate", "severe"], {
    message: "Select a severity level",
  }),
  symptoms: z.array(z.string()).min(1, "Select at least one symptom"),
  mood: z.string().min(1, "Choose your current mood"),
  notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
});

type SymptomFormValues = z.infer<typeof symptomSchema>;

// Helper to generate unique log IDs outside the component render path
function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function SymptomLogger() {
  const [logs, setLogs] = useState<SymptomLog[]>([
    {
      id: "log-1",
      date: "2026-05-26",
      severity: "mild",
      symptoms: ["cramps", "fatigue"],
      notes: "Light lower abdomen tension. Felt better after drinking raspberry leaf tea.",
      mood: "calm",
    },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) {
      return;
    }

    const successTimer = setTimeout(() => {
      setShowSuccess(false);
    }, 4000);

    return () => {
      clearTimeout(successTimer);
    };
  }, [showSuccess]);

  // 2. Setup React Hook Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptoms: [],
      mood: "",
      notes: "",
    },
  });

  // 3. Form Submission handler
  const onSubmit = (data: SymptomFormValues) => {
    const newLog: SymptomLog = {
      id: generateLogId(),
      date: new Date().toISOString().split("T")[0],
      ...data,
    };
    
    // Add to state log array
    setLogs((currentLogs) => [newLog, ...currentLogs]);
    
    // Trigger Success Banner
    setShowSuccess(true);
    
    // Reset Form
    reset({
      severity: undefined,
      symptoms: [],
      mood: "",
      notes: "",
    });

  };

  const deleteLog = (id: string) => {
    setLogs((currentLogs) => currentLogs.filter((log) => log.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* Logger Form Column */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 lg:col-span-3 flex flex-col justify-between"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border/40 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logging</span>
              <h3 className="text-xl font-bold mt-0.5 text-foreground">Log Daily Symptoms</h3>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Success! Your self-care log has been securely recorded.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. Mood Picker (Controller because it's a custom state button grid) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wide">
              How is your Mood today?
            </label>
            <Controller
              name="mood"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => field.onChange(mood.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all duration-200 cursor-pointer active:scale-95",
                        field.value === mood.id
                          ? "border-primary bg-primary/10 text-primary shadow-sm font-bold scale-[1.03]"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                      <span className="text-[9px] mt-1 font-semibold">{mood.label}</span>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.mood && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-semibold">
                <AlertCircle className="h-3 w-3" /> {errors.mood.message}
              </p>
            )}
          </div>

          {/* 2. Symptom Selection Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wide">
              Check all applicable Symptoms
            </label>
            <Controller
              name="symptoms"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SYMPTOM_OPTIONS.map((symptom) => {
                    const isChecked = field.value.includes(symptom.id);
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => {
                          const updated = isChecked
                            ? field.value.filter((id) => id !== symptom.id)
                            : [...field.value, symptom.id];
                          field.onChange(updated);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs transition-all duration-200 cursor-pointer",
                          isChecked
                            ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors",
                            isChecked ? "bg-primary border-primary text-white" : "border-muted-foreground/30 bg-card"
                          )}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        <span className="truncate">{symptom.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.symptoms && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-semibold">
                <AlertCircle className="h-3 w-3" /> {errors.symptoms.message}
              </p>
            )}
          </div>

          {/* 3. Severity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wide block">
              Severity Level
            </label>
            <div className="flex gap-4">
              {["mild", "moderate", "severe"].map((level) => (
                <label
                  key={level}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer text-xs font-medium px-4 py-2.5 rounded-2xl border transition-all duration-200 capitalize flex-1 text-center justify-center",
                    errors.severity ? "border-destructive/30" : "border-border/60"
                  )}
                >
                  <input
                    type="radio"
                    value={level}
                    {...register("severity")}
                    className="accent-primary h-3.5 w-3.5"
                  />
                  {level}
                </label>
              ))}
            </div>
            {errors.severity && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-semibold">
                <AlertCircle className="h-3 w-3" /> {errors.severity.message}
              </p>
            )}
          </div>

          {/* 4. Notes input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wide flex justify-between">
              <span>Personal Notes / Flow journal</span>
              <span className="text-[10px] text-muted-foreground lowercase">Optional</span>
            </label>
            <textarea
              {...register("notes")}
              placeholder="How are you feeling mentally or physically? Add any self-care tips you practiced..."
              rows={3}
              className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 transition-all duration-150 resize-none text-foreground"
            />
            {errors.notes && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 font-semibold">
                <AlertCircle className="h-3 w-3" /> {errors.notes.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl font-semibold text-xs bg-foreground text-background hover:opacity-90 transition-all active:scale-98 cursor-pointer shadow-md"
          >
            Save Daily Log
          </button>
        </form>
      </motion.div>

      {/* Symptoms History Column */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-3xl p-6 lg:col-span-2 flex flex-col"
      >
        <div className="flex items-center gap-2 border-b border-border/40 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <HeartPulse className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</span>
            <h3 className="text-xl font-bold mt-0.5 text-foreground">Logged History</h3>
          </div>
        </div>

        {/* Scrollable logs */}
        <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 mt-4 space-y-3.5 custom-scrollbar">
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground"
              >
                <ClipboardList className="h-8 w-8 opacity-30 stroke-[1.5]" />
                <span className="text-xs mt-2 font-medium">No logs recorded yet.</span>
              </motion.div>
            ) : (
              logs.map((log) => {
                const moodObj = MOOD_OPTIONS.find((m) => m.id === log.mood);
                
                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors duration-200 relative group"
                  >
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md"
                      aria-label="Delete log"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className="text-base">{moodObj?.emoji || "😊"}</span>
                        <span className="capitalize">{moodObj?.label || "Good"}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold">{log.date}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      <span
                        className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border",
                          log.severity === "severe"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            : log.severity === "moderate"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-sky-500/10 border-sky-500/20 text-sky-500"
                        )}
                      >
                        {log.severity}
                      </span>
                      {log.symptoms.map((symptomId) => {
                        const sOpt = SYMPTOM_OPTIONS.find((s) => s.id === symptomId);
                        return (
                          <span
                            key={symptomId}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-border/60 border border-border text-muted-foreground font-medium"
                          >
                            {sOpt?.label || symptomId}
                          </span>
                        );
                      })}
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-muted-foreground mt-3 italic bg-card/60 p-2 rounded-xl border border-border/30">
                        {"\""}{log.notes}{"\""}
                      </p>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
}
