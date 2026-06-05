import { AxiosError } from "axios";
import { create } from "zustand";
import type { ReportPagination } from "../services/report.service";
import * as service from "../services/adminReport.service";
import type { AdminReport, AdminReportFilters } from "../services/adminReport.service";

interface State {
  reports: AdminReport[];
  selectedReport: AdminReport | null;
  pagination: ReportPagination;
  filters: AdminReportFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchReports: (filters?: AdminReportFilters) => Promise<void>;
  fetchReport: (id: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  clearSelected: () => void;
}

const pagination = { page: 1, limit: 10, total: 0, pages: 0 };
const msg = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

export const useAdminReportStore = create<State>((set, get) => ({
  reports: [],
  selectedReport: null,
  pagination,
  filters: { page: 1, limit: 10, category: "all", mimeType: "all" },
  isLoading: false,
  isSubmitting: false,
  error: null,
  fetchReports: async (filters = {}) => {
    const nextFilters = { ...get().filters, ...filters };
    set({ isLoading: true, error: null, filters: nextFilters });
    try {
      const data = await service.getAdminReports(nextFilters);
      set({ reports: data.reports, pagination: data.pagination, isLoading: false });
    } catch (error) {
      set({ error: msg(error, "Unable to fetch reports."), isLoading: false });
    }
  },
  fetchReport: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const report = await service.getAdminReport(id);
      set({ selectedReport: report, isLoading: false });
    } catch (error) {
      set({ error: msg(error, "Unable to fetch report."), isLoading: false });
    }
  },
  deleteReport: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await service.deleteAdminReport(id);
      set({ isSubmitting: false, selectedReport: null });
      await get().fetchReports();
    } catch (error) {
      const message = msg(error, "Unable to delete report.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },
  clearSelected: () => set({ selectedReport: null }),
}));
