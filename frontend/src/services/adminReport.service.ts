import api from "../lib/api";
import type { Report, ReportPagination } from "./report.service";

export type AdminReport = Report & {
  user:
    | string
    | {
        _id?: string;
        fullName?: string;
        email?: string;
        phone?: string;
      };
};

export interface AdminReportFilters {
  user?: string;
  category?: string;
  mimeType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getAdminReports = async (filters: AdminReportFilters = {}) => {
  const response = await api.get<
    ApiResponse<{ reports: AdminReport[]; pagination: ReportPagination }>
  >("/admin/reports", {
    params: {
      user: filters.user || undefined,
      category: filters.category && filters.category !== "all" ? filters.category : undefined,
      mimeType: filters.mimeType && filters.mimeType !== "all" ? filters.mimeType : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};

export const getAdminReport = async (id: string) => {
  const response = await api.get<ApiResponse<{ report: AdminReport }>>(
    `/admin/reports/${id}`
  );
  return response.data.data.report;
};

export const deleteAdminReport = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/admin/reports/${id}`);
};
