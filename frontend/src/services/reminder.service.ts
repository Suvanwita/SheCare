import api from "../lib/api";

export type ReminderType = "medicine" | "cycle" | "appointment" | "custom";
export type ReminderRepeat = "none" | "daily" | "weekly" | "monthly";
export type ReminderPriority = "low" | "medium" | "high";
export type ReminderStatus = "upcoming" | "completed" | "missed" | "cancelled";

export interface Reminder {
  _id: string;
  title: string;
  type: ReminderType;
  message?: string;
  scheduledAt: string;
  repeat: ReminderRepeat;
  priority: ReminderPriority;
  status: ReminderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReminderPayload {
  title: string;
  type: ReminderType;
  message: string;
  scheduledAt: string;
  repeat: ReminderRepeat;
  priority: ReminderPriority;
}

export interface ReminderFilters {
  type?: ReminderType | "all";
  status?: ReminderStatus | "all";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ReminderPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getReminders = async (filters: ReminderFilters = {}) => {
  const params = {
    page: filters.page,
    limit: filters.limit,
    type: filters.type && filters.type !== "all" ? filters.type : undefined,
    status: filters.status && filters.status !== "all" ? filters.status : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };

  const response = await api.get<
    ApiResponse<{ reminders: Reminder[]; pagination: ReminderPagination }>
  >("/reminders", { params });

  return response.data.data;
};

export const createReminder = async (payload: ReminderPayload) => {
  const response = await api.post<ApiResponse<{ reminder: Reminder }>>("/reminders", payload);
  return response.data.data.reminder;
};

export const updateReminder = async (id: string, payload: Partial<ReminderPayload>) => {
  const response = await api.patch<ApiResponse<{ reminder: Reminder }>>(
    `/reminders/${id}`,
    payload
  );
  return response.data.data.reminder;
};

export const completeReminder = async (id: string) => {
  const response = await api.patch<ApiResponse<{ reminder: Reminder }>>(
    `/reminders/${id}/complete`
  );
  return response.data.data.reminder;
};

export const deleteReminder = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/reminders/${id}`);
};
