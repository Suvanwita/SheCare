"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ChevronDown, Loader2, Lock, Mail, User } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: z.enum(["user", "doctor"], {
      message: "Choose a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const registerAccount = useAuthStore((state) => state.register);
  const authError = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setFormError("");
    try {
      await registerAccount({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create your account right now.");
    }
  };

  const handleInvalidSubmit = () => {
    setFormError("Please fix the highlighted fields before creating your account.");
  };

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-bold text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      description="Set up a secure SheCare profile for personal wellness tracking or doctor-guided care."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Sign in"
    >
      <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-4">
        {(formError || authError) && (
          <div className="flex items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError || authError}</span>
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
            Full name
          </span>
          <span className="relative block">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoComplete="name"
              {...register("fullName")}
              className={cn(
                "w-full rounded-2xl border bg-muted/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                errors.fullName ? "border-destructive/60" : "border-border/80"
              )}
              placeholder="Sophia Sterling"
            />
          </span>
          {errors.fullName && (
            <span className="text-xs font-semibold text-destructive">{errors.fullName.message}</span>
          )}
        </label>

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
            Role
          </span>
          <span className="relative block">
            <select
              {...register("role")}
              className={cn(
                "w-full appearance-none rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                errors.role ? "border-destructive/60" : "border-border/80"
              )}
            >
              <option value="user">User</option>
              <option value="doctor">Doctor</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </span>
          {errors.role && (
            <span className="text-xs font-semibold text-destructive">{errors.role.message}</span>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Password
            </span>
            <span className="relative block">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.password ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="At least 8 chars"
              />
            </span>
            {errors.password && (
              <span className="text-xs font-semibold text-destructive">{errors.password.message}</span>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Confirm password
            </span>
            <span className="relative block">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.confirmPassword ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="Repeat password"
              />
            </span>
            {errors.confirmPassword && (
              <span className="text-xs font-semibold text-destructive">
                {errors.confirmPassword.message}
              </span>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {(isSubmitting || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting || isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
