export type ReminderType = "medicine" | "cycle" | "appointment" | "custom";
export type ReminderRepeat = "none" | "daily" | "weekly" | "monthly";
export type ReminderPriority = "low" | "medium" | "high";
export type ReminderStatus = "upcoming" | "completed" | "missed";

export interface ReminderEntry {
  id: string;
  title: string;
  type: ReminderType;
  message: string;
  date: string;
  time: string;
  repeat: ReminderRepeat;
  priority: ReminderPriority;
  status: ReminderStatus;
}

export const REMINDER_TYPE_OPTIONS: Array<{ value: ReminderType; label: string }> = [
  { value: "medicine", label: "Medicine" },
  { value: "cycle", label: "Cycle" },
  { value: "appointment", label: "Appointment" },
  { value: "custom", label: "Custom" },
];

export const REMINDER_REPEAT_OPTIONS: Array<{ value: ReminderRepeat; label: string }> = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const REMINDER_PRIORITY_OPTIONS: Array<{ value: ReminderPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const MOCK_REMINDERS: ReminderEntry[] = [
  {
    id: "reminder-1",
    title: "Vitamin D3 + Magnesium",
    type: "medicine",
    message: "Take supplements after dinner.",
    date: "2026-05-27",
    time: "20:00",
    repeat: "daily",
    priority: "high",
    status: "upcoming",
  },
  {
    id: "reminder-2",
    title: "Hydration check-in",
    type: "custom",
    message: "Drink water and log your intake.",
    date: "2026-05-27",
    time: "15:30",
    repeat: "daily",
    priority: "medium",
    status: "completed",
  },
  {
    id: "reminder-3",
    title: "Cycle prediction review",
    type: "cycle",
    message: "Review upcoming period prediction and symptoms.",
    date: "2026-05-28",
    time: "09:00",
    repeat: "monthly",
    priority: "medium",
    status: "upcoming",
  },
  {
    id: "reminder-4",
    title: "Gynecology consult",
    type: "appointment",
    message: "Prepare reports and questions for doctor visit.",
    date: "2026-05-24",
    time: "11:00",
    repeat: "none",
    priority: "high",
    status: "missed",
  },
];
