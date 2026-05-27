"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  MessageSquareText,
  Pill,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import {
  MOCK_REMINDERS,
  REMINDER_PRIORITY_OPTIONS,
  REMINDER_REPEAT_OPTIONS,
  REMINDER_TYPE_OPTIONS,
  type ReminderEntry,
  type ReminderPriority,
  type ReminderStatus,
  type ReminderType,
} from "../../../data/mockReminders";
import { cn, formatDate } from "../../../lib/utils";

const reminderSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  type: z.enum(["medicine", "cycle", "appointment", "custom"], {
    message: "Choose a reminder type",
  }),
  message: z.string().trim().min(1, "Message is required").max(220, "Message is too long"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  repeat: z.enum(["none", "daily", "weekly", "monthly"], {
    message: "Choose a repeat value",
  }),
  priority: z.enum(["low", "medium", "high"], {
    message: "Choose a priority",
  }),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

const priorityTone: Record<ReminderPriority, string> = {
  low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const statusTone: Record<ReminderStatus, string> = {
  upcoming: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  missed: "border-destructive/20 bg-destructive/10 text-destructive",
};

const typeIcon: Record<ReminderType, React.ComponentType<{ className?: string }>> = {
  medicine: Pill,
  cycle: RotateCcw,
  appointment: CalendarClock,
  custom: Bell,
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

function SelectField({
  label,
  registration,
  error,
  options,
}: {
  label: string;
  registration: ReturnType<typeof useForm<ReminderFormValues>>["register"] extends (
    name: infer Name
  ) => infer RegisterReturn
    ? RegisterReturn
    : never;
  error?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
        {label}
      </span>
      <select
        {...registration}
        className={cn(
          "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
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

function NotificationStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-foreground">{value}</p>
    </div>
  );
}

function getScheduledTime(reminder: ReminderEntry) {
  return `${formatDate(reminder.date)} at ${reminder.time}`;
}

export default function RemindersDashboardPage() {
  const [reminders, setReminders] = useState<ReminderEntry[]>(MOCK_REMINDERS);
  const [editingReminder, setEditingReminder] = useState<ReminderEntry | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      type: "medicine",
      message: "",
      date: "",
      time: "",
      repeat: "none",
      priority: "medium",
    },
  });

  const editForm = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      type: "medicine",
      message: "",
      date: "",
      time: "",
      repeat: "none",
      priority: "medium",
    },
  });

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort((a, b) =>
        `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
      ),
    [reminders]
  );

  const upcomingCount = reminders.filter((reminder) => reminder.status === "upcoming").length;
  const completedCount = reminders.filter((reminder) => reminder.status === "completed").length;
  const missedCount = reminders.filter((reminder) => reminder.status === "missed").length;

  const onSubmit = (data: ReminderFormValues) => {
    setReminders((currentReminders) => [
      {
        id: `reminder-local-${currentReminders.length + 1}-${data.date}-${data.time}`,
        ...data,
        status: "upcoming",
      },
      ...currentReminders,
    ]);

    reset({
      title: "",
      type: "medicine",
      message: "",
      date: "",
      time: "",
      repeat: "none",
      priority: "medium",
    });
  };

  const openEdit = (reminder: ReminderEntry) => {
    setEditingReminder(reminder);
    editForm.reset({
      title: reminder.title,
      type: reminder.type,
      message: reminder.message,
      date: reminder.date,
      time: reminder.time,
      repeat: reminder.repeat,
      priority: reminder.priority,
    });
  };

  const saveEdit = (data: ReminderFormValues) => {
    if (!editingReminder) {
      return;
    }

    setReminders((currentReminders) =>
      currentReminders.map((reminder) =>
        reminder.id === editingReminder.id
          ? { ...reminder, ...data }
          : reminder
      )
    );
    setEditingReminder(null);
  };

  const deleteReminder = (id: string) => {
    setReminders((currentReminders) =>
      currentReminders.filter((reminder) => reminder.id !== id)
    );
  };

  const markComplete = (id: string) => {
    setReminders((currentReminders) =>
      currentReminders.map((reminder) =>
        reminder.id === id ? { ...reminder, status: "completed" } : reminder
      )
    );
  };

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          SheCare reminders
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Reminders
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage medicines, cycle reminders, and health check-ins.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-black text-foreground">Create reminder</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep medications, check-ins, and appointments visible in one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Title
              </span>
              <input
                type="text"
                {...register("title")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.title ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="Vitamin D3 + Magnesium"
              />
              <FieldError message={errors.title?.message} />
            </label>

            <SelectField
              label="Type"
              registration={register("type")}
              error={errors.type?.message}
              options={REMINDER_TYPE_OPTIONS}
            />
            <SelectField
              label="Priority"
              registration={register("priority")}
              error={errors.priority?.message}
              options={REMINDER_PRIORITY_OPTIONS}
            />

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
                Time
              </span>
              <input
                type="time"
                {...register("time")}
                className={cn(
                  "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.time ? "border-destructive/60" : "border-border/80"
                )}
              />
              <FieldError message={errors.time?.message} />
            </label>

            <SelectField
              label="Repeat"
              registration={register("repeat")}
              error={errors.repeat?.message}
              options={REMINDER_REPEAT_OPTIONS}
            />

            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Message
              </span>
              <textarea
                {...register("message")}
                rows={4}
                className={cn(
                  "w-full resize-none rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                  errors.message ? "border-destructive/60" : "border-border/80"
                )}
                placeholder="Take supplements after dinner."
              />
              <FieldError message={errors.message?.message} />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Plus className="h-4 w-4" />
            Create reminder
          </button>
        </form>

        <aside className="space-y-4">
          <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-black text-foreground">Notification preview</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Mock notification center for local reminders.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <NotificationStat label="Unread notifications" value={upcomingCount + missedCount} icon={MessageSquareText} />
              <NotificationStat label="Completed reminders" value={completedCount} icon={CheckCircle2} />
              <NotificationStat label="Missed reminders" value={missedCount} icon={AlertCircle} />
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Next upcoming
            </p>
            <div className="mt-3 space-y-3">
              {sortedReminders
                .filter((reminder) => reminder.status === "upcoming")
                .slice(0, 3)
                .map((reminder) => (
                  <div key={reminder.id} className="rounded-2xl bg-muted/30 p-3">
                    <p className="text-sm font-bold text-foreground">{reminder.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getScheduledTime(reminder)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {sortedReminders.map((reminder) => {
          const TypeIcon = typeIcon[reminder.type];

          return (
            <article
              key={reminder.id}
              className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <TypeIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-foreground">{reminder.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {reminder.message}
                    </p>
                  </div>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-black capitalize", priorityTone[reminder.priority])}>
                  {reminder.priority}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-2xl bg-muted/30 p-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{getScheduledTime(reminder)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted/30 p-3">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span className="capitalize">{reminder.repeat}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-bold capitalize text-muted-foreground">
                  {reminder.type}
                </span>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-black capitalize", statusTone[reminder.status])}>
                  {reminder.status}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(reminder)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteReminder(reminder.id)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => markComplete(reminder.id)}
                  disabled={reminder.status === "completed"}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark complete
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {editingReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 py-8 backdrop-blur-sm">
          <form
            onSubmit={editForm.handleSubmit(saveEdit)}
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-foreground/10"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-foreground">Edit reminder</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Update this local reminder. Backend scheduling is not connected yet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingReminder(null)}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close edit reminder"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Title
                </span>
                <input
                  type="text"
                  {...editForm.register("title")}
                  className={cn(
                    "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                    editForm.formState.errors.title ? "border-destructive/60" : "border-border/80"
                  )}
                />
                <FieldError message={editForm.formState.errors.title?.message} />
              </label>

              <SelectField
                label="Type"
                registration={editForm.register("type")}
                error={editForm.formState.errors.type?.message}
                options={REMINDER_TYPE_OPTIONS}
              />
              <SelectField
                label="Priority"
                registration={editForm.register("priority")}
                error={editForm.formState.errors.priority?.message}
                options={REMINDER_PRIORITY_OPTIONS}
              />

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Date
                </span>
                <input
                  type="date"
                  {...editForm.register("date")}
                  className={cn(
                    "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                    editForm.formState.errors.date ? "border-destructive/60" : "border-border/80"
                  )}
                />
                <FieldError message={editForm.formState.errors.date?.message} />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Time
                </span>
                <input
                  type="time"
                  {...editForm.register("time")}
                  className={cn(
                    "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                    editForm.formState.errors.time ? "border-destructive/60" : "border-border/80"
                  )}
                />
                <FieldError message={editForm.formState.errors.time?.message} />
              </label>

              <SelectField
                label="Repeat"
                registration={editForm.register("repeat")}
                error={editForm.formState.errors.repeat?.message}
                options={REMINDER_REPEAT_OPTIONS}
              />

              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Message
                </span>
                <textarea
                  {...editForm.register("message")}
                  rows={4}
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                    editForm.formState.errors.message ? "border-destructive/60" : "border-border/80"
                  )}
                />
                <FieldError message={editForm.formState.errors.message?.message} />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditingReminder(null)}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
