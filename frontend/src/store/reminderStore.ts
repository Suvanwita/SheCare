import { AxiosError } from "axios";
import { create } from "zustand";
import * as reminderService from "../services/reminder.service";
import type {
  Reminder,
  ReminderFilters,
  ReminderPagination,
  ReminderPayload,
} from "../services/reminder.service";

interface ReminderState {
  reminders: Reminder[];
  pagination: ReminderPagination;
  filters: ReminderFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchReminders: (filters?: ReminderFilters) => Promise<void>;
  createReminder: (payload: ReminderPayload) => Promise<void>;
  updateReminder: (id: string, payload: Partial<ReminderPayload>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  setFilters: (filters: ReminderFilters) => void;
  clearError: () => void;
}

const defaultPagination: ReminderPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  pagination: defaultPagination,
  filters: {
    page: 1,
    limit: 20,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchReminders: async (filters = {}) => {
    const nextFilters = {
      ...get().filters,
      ...filters,
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const data = await reminderService.getReminders(nextFilters);
      set({
        reminders: data.reminders,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch reminders."),
        isLoading: false,
      });
    }
  },

  createReminder: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await reminderService.createReminder(payload);
      set({ isSubmitting: false });
      await get().fetchReminders({ page: 1 });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create reminder.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  updateReminder: async (id, payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await reminderService.updateReminder(id, payload);
      set({ isSubmitting: false });
      await get().fetchReminders();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update reminder.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deleteReminder: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await reminderService.deleteReminder(id);
      set({ isSubmitting: false });
      await get().fetchReminders();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete reminder.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  completeReminder: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await reminderService.completeReminder(id);
      set({ isSubmitting: false });
      await get().fetchReminders();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to complete reminder.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
