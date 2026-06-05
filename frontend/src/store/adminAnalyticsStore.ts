import { AxiosError } from "axios";
import { create } from "zustand";
import * as service from "../services/adminAnalytics.service";
import type { AdminAnalyticsOverview } from "../services/adminAnalytics.service";

interface AdminAnalyticsState {
  overview: AdminAnalyticsOverview | null;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
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

export const useAdminAnalyticsStore = create<AdminAnalyticsState>((set) => ({
  overview: null,
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });

    try {
      const overview = await service.getAdminAnalyticsOverview();
      set({ overview, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch admin analytics."),
        isLoading: false,
      });
    }
  },
}));
