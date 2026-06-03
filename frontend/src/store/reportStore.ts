import { AxiosError } from "axios";
import { create } from "zustand";
import * as reportService from "../services/report.service";
import type {
  Report,
  ReportFilters,
  ReportPagination,
  ReportUploadPayload,
} from "../services/report.service";

interface ReportState {
  reports: Report[];
  pagination: ReportPagination;
  filters: ReportFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  uploadProgress: number;
  error: string | null;
  fetchReports: (filters?: ReportFilters) => Promise<void>;
  uploadReport: (payload: ReportUploadPayload) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  setFilters: (filters: ReportFilters) => void;
  clearError: () => void;
}

const defaultPagination: ReportPagination = {
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

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  pagination: defaultPagination,
  filters: {
    page: 1,
    limit: 20,
  },
  isLoading: false,
  isSubmitting: false,
  uploadProgress: 0,
  error: null,

  fetchReports: async (filters = {}) => {
    const nextFilters = {
      ...get().filters,
      ...filters,
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const data = await reportService.getReports(nextFilters);
      set({
        reports: data.reports,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch reports."),
        isLoading: false,
      });
    }
  },

  uploadReport: async (payload) => {
    set({ isSubmitting: true, uploadProgress: 0, error: null });

    try {
      await reportService.uploadReport(payload, (event) => {
        if (!event.total) {
          return;
        }

        set({ uploadProgress: Math.round((event.loaded * 100) / event.total) });
      });
      set({ isSubmitting: false, uploadProgress: 100 });
      await get().fetchReports({ page: 1 });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to upload report.");
      set({ error: message, isSubmitting: false, uploadProgress: 0 });
      throw new Error(message);
    }
  },

  deleteReport: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await reportService.deleteReport(id);
      set({ isSubmitting: false });
      await get().fetchReports();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete report.");
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
