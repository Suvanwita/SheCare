"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import { login } from "../../lib/authApi";
import { cn } from "../../lib/utils";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError("");
    try {
      await login(data);
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to sign in right now.");
    }
  };

  const handleInvalidSubmit = () => {
    setFormError("Please fix the highlighted fields before continuing.");
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue tracking your cycle, wellness logs, and care reminders."
      footerText="New to SheCare?"
      footerHref="/register"
      footerLinkText="Create an account"
    >
      <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-4">
        {formError && (
          <div className="flex items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
            Email
          </span>
          <span className="relative block">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className={cn(
                "w-full rounded-2xl border bg-muted/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                errors.email ? "border-destructive/60" : "border-border/80"
              )}
              placeholder="you@example.com"
            />
          </span>
          {errors.email && (
            <span className="text-xs font-semibold text-destructive">{errors.email.message}</span>
          )}
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
            Password
          </span>
          <span className="relative block">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className={cn(
                "w-full rounded-2xl border bg-muted/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                errors.password ? "border-destructive/60" : "border-border/80"
              )}
              placeholder="Enter your password"
            />
          </span>
          {errors.password && (
            <span className="text-xs font-semibold text-destructive">{errors.password.message}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
