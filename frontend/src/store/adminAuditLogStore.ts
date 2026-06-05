import { AxiosError } from "axios";
import { create } from "zustand";
import * as service from "../services/adminAuditLog.service";
import type {
  AdminAuditLog,
  AdminAuditLogFilters,
} from "../services/adminAuditLog.service";
import type { AdminUserPagination } from "../services/adminUser.service";

interface AdminAuditLogState {
  auditLogs: AdminAuditLog[];
  pagination: AdminUserPagination;
  filters: AdminAuditLogFilters;
  isLoading: boolean;
  error: string | null;
  fetchAuditLogs: (filters?: AdminAuditLogFilters) => Promise<void>;
  clearError: () => void;
}

const defaultPagination: AdminUserPagination = {
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

export const useAdminAuditLogStore = create<AdminAuditLogState>((set, get) => ({
  auditLogs: [],
  pagination: defaultPagination,
  filters: {
    page: 1,
    limit: 20,
    action: "all",
    entity: "all",
  },
  isLoading: false,
  error: null,

  fetchAuditLogs: async (filters = {}) => {
    const nextFilters = {
      ...get().filters,
      ...filters,
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const data = await service.getAdminAuditLogs(nextFilters);
      set({
        auditLogs: data.auditLogs,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch audit logs."),
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
