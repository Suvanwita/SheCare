import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DASHBOARD_ROUTE_SUMMARIES } from "../../constants/navigation";

interface DashboardRoutePageProps {
  route: keyof typeof DASHBOARD_ROUTE_SUMMARIES;
}

export default function DashboardRoutePage({ route }: DashboardRoutePageProps) {
  const section = DASHBOARD_ROUTE_SUMMARIES[route];
  const Icon = section.icon;

  return (
    <section className="space-y-6">
      <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                SheCare module
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                {section.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {section.description}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground transition-colors hover:bg-muted"
          >
            Back to overview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["Protected route", "Frontend only", "Ready for backend"].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="mt-3 text-sm font-bold text-foreground">{item}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This page is available inside the mock-authenticated dashboard shell.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
