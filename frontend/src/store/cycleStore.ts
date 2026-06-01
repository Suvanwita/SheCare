import { AxiosError } from "axios";
import { create } from "zustand";
import * as cycleService from "../services/cycle.service";
import type {
  Cycle,
  CycleAnalytics,
  CyclePagination,
  CyclePayload,
} from "../services/cycle.service";

interface CycleState {
  cycles: Cycle[];
  analytics: CycleAnalytics | null;
  pagination: CyclePagination;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchCycles: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  createCycle: (payload: CyclePayload) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  clearError: () => void;
}

const defaultPagination: CyclePagination = {
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

export const useCycleStore = create<CycleState>((set, get) => ({
  cycles: [],
  analytics: null,
  pagination: defaultPagination,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchCycles: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await cycleService.getCycles({ page: 1, limit: 20 });
      set({
        cycles: data.cycles,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch cycle history."),
        isLoading: false,
      });
    }
  },

  fetchAnalytics: async () => {
    set({ error: null });

    try {
      const analytics = await cycleService.getCycleAnalytics();
      set({ analytics });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch cycle analytics."),
      });
    }
  },

  createCycle: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await cycleService.createCycle(payload);
      set({ isSubmitting: false });
      await Promise.all([get().fetchCycles(), get().fetchAnalytics()]);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save cycle.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deleteCycle: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await cycleService.deleteCycle(id);
      set({ isSubmitting: false });
      await Promise.all([get().fetchCycles(), get().fetchAnalytics()]);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete cycle.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
