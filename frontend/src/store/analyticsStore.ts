import { AxiosError } from "axios";
import { create } from "zustand";
import * as analyticsService from "../services/analytics.service";
import type { AnalyticsSummary } from "../services/analytics.service";

interface AnalyticsState {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
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

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });

    try {
      const summary = await analyticsService.getAnalyticsSummary();
      set({ summary, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch analytics summary."),
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
