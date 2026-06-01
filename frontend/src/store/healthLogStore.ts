import { AxiosError } from "axios";
import { create } from "zustand";
import * as healthLogService from "../services/healthLog.service";
import type {
  HealthLog,
  HealthLogFilters,
  HealthLogPagination,
  HealthLogPayload,
} from "../services/healthLog.service";

interface HealthLogState {
  logs: HealthLog[];
  pagination: HealthLogPagination;
  filters: HealthLogFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchLogs: (filters?: HealthLogFilters) => Promise<void>;
  createLog: (payload: HealthLogPayload) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  setFilters: (filters: HealthLogFilters) => void;
  clearError: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const defaultPagination: HealthLogPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
};

export const useHealthLogStore = create<HealthLogState>((set, get) => ({
  logs: [],
  pagination: defaultPagination,
  filters: {
    page: 1,
    limit: 20,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchLogs: async (filters = {}) => {
    const nextFilters = {
      ...get().filters,
      ...filters,
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const data = await healthLogService.getHealthLogs(nextFilters);
      set({
        logs: data.healthLogs,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch health logs."),
        isLoading: false,
      });
    }
  },

  createLog: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await healthLogService.createHealthLog(payload);
      set({ isSubmitting: false });
      await get().fetchLogs({ page: 1 });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save health log.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deleteLog: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await healthLogService.deleteHealthLog(id);
      set({ isSubmitting: false });
      await get().fetchLogs();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete health log.");
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
