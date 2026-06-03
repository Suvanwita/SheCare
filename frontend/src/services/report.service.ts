import type { AxiosProgressEvent } from "axios";
import api from "../lib/api";

export interface Report {
  _id: string;
  title: string;
  category?: string;
  doctorName?: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportUploadPayload {
  file: File;
  title?: string;
  category?: string;
  doctorName?: string;
  notes?: string;
}

export interface ReportFilters {
  category?: string;
  doctorName?: string;
  mimeType?: string;
  page?: number;
  limit?: number;
}

export interface ReportPagination {
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

export const getReports = async (filters: ReportFilters = {}) => {
  const response = await api.get<ApiResponse<{ reports: Report[]; pagination: ReportPagination }>>(
    "/reports",
    {
      params: {
        category: filters.category || undefined,
        doctorName: filters.doctorName || undefined,
        mimeType: filters.mimeType || undefined,
        page: filters.page,
        limit: filters.limit,
      },
    }
  );

  return response.data.data;
};

export const getReport = async (id: string) => {
  const response = await api.get<ApiResponse<{ report: Report }>>(`/reports/${id}`);
  return response.data.data.report;
};

export const uploadReport = async (
  payload: ReportUploadPayload,
  onUploadProgress?: (event: AxiosProgressEvent) => void
) => {
  const formData = new FormData();
  formData.append("file", payload.file);

  if (payload.title) {
    formData.append("title", payload.title);
  }

  if (payload.category) {
    formData.append("category", payload.category);
  }

  if (payload.doctorName) {
    formData.append("doctorName", payload.doctorName);
  }

  if (payload.notes) {
    formData.append("notes", payload.notes);
  }

  const response = await api.post<ApiResponse<{ report: Report }>>("/reports/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data.data.report;
};

export const deleteReport = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/reports/${id}`);
};
