"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn, formatDate } from "../../../lib/utils";
import {
  getTimeline,
  type TimelineEvent,
  type TimelineEventType,
} from "../../../services/timeline.service";

type TimelineFilter = TimelineEventType | "all";

const eventConfig: Record<
  TimelineEventType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }
> = {
  "appointment.booked": {
    label: "Appointments",
    icon: CalendarCheck,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  "reminder.completed": {
    label: "Reminders",
    icon: CheckCircle2,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  "report.uploaded": {
    label: "Reports",
    icon: FileText,
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  "pcos.assessment.completed": {
    label: "PCOS",
    icon: HeartPulse,
    tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  "article.viewed": {
    label: "Articles",
    icon: BookOpen,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  "cycle.created": {
    label: "Cycles",
    icon: RotateCcw,
    tone: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  "health_log.created": {
    label: "Health logs",
    icon: ClipboardList,
    tone: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  },
};

function formatTimestamp(value: string) {
  const date = new Date(value);
  return `${formatDate(value)} at ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const config = eventConfig[event.eventType];
  const Icon = config.icon;

  return (
    <li className="relative grid grid-cols-[2.75rem_1fr] gap-4">
      {!isLast && <span className="absolute left-[1.35rem] top-12 h-[calc(100%-1rem)] w-px bg-border" />}
      <span
        className={cn(
          "z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm",
          config.tone
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <article className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black text-foreground">{event.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          </div>
          <span className="w-fit rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-bold text-muted-foreground">
            {config.label}
          </span>
        </div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground">{formatTimestamp(event.occurredAt)}</p>
      </article>
    </li>
  );
}

export default function TimelineDashboardPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<TimelineEventType[]>([]);
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTimeline = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getTimeline({ eventType: activeFilter, limit: 40 });

        if (isMounted) {
          setEvents(data.events);
          setEventTypes(data.filters.eventTypes);
        }
      } catch {
        if (isMounted) {
          setError("Timeline activity could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTimeline();

    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

  const filters = useMemo(
    () => [
      { value: "all" as const, label: "All activity" },
      ...eventTypes.map((eventType) => ({
        value: eventType,
        label: eventConfig[eventType]?.label ?? eventType,
      })),
    ],
    [eventTypes]
  );

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Health activity</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Timeline</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Review recent appointments, reminders, reports, assessments, articles, cycles, and health logs in one stream.
        </p>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-black transition-colors",
                activeFilter === filter.value
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/70 bg-muted/10 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {(error || isLoading) && (
        <section
          className={cn(
            "rounded-3xl border px-5 py-4 text-sm font-bold",
            error
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-border/60 bg-card text-muted-foreground"
          )}
        >
          <span className="inline-flex items-center gap-2">
            {isLoading && !error ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
            {error || "Loading timeline..."}
          </span>
        </section>
      )}

      {!isLoading && !error && events.length === 0 && (
        <section className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <BarChart3 className="mx-auto h-9 w-9 text-muted-foreground" />
          <p className="mt-4 text-sm font-black text-foreground">No timeline activity yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Activity appears here after analytics events are collected for your account.
          </p>
        </section>
      )}

      {events.length > 0 && (
        <ol className="space-y-5">
          {events.map((event, index) => (
            <TimelineItem key={event.id} event={event} isLast={index === events.length - 1} />
          ))}
        </ol>
      )}
    </div>
  );
}
