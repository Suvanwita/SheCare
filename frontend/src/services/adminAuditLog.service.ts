import api from "../lib/api";
import type { AuthRole } from "./auth.service";
import type { AdminUserPagination } from "./adminUser.service";

export interface AdminAuditLogUser {
  _id: string;
  fullName: string;
  email: string;
  role: AuthRole;
}

export interface AdminAuditLog {
  _id: string;
  user?: AdminAuditLogUser | string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: {
    path?: string;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    [key: string]: unknown;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminAuditLogFilters {
  action?: string;
  entity?: string;
  user?: string;
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

export const getAdminAuditLogs = async (
  filters: AdminAuditLogFilters = {}
) => {
  const response = await api.get<
    ApiResponse<{ auditLogs: AdminAuditLog[]; pagination: AdminUserPagination }>
  >("/admin/audit-logs", {
    params: {
      action: filters.action && filters.action !== "all" ? filters.action : undefined,
      entity: filters.entity && filters.entity !== "all" ? filters.entity : undefined,
      user: filters.user || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};
