import api from "../lib/api";
import type { AuthRole } from "./auth.service";

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: AuthRole;
  gender?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserSession {
  _id: string;
  user: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserFilters {
  search?: string;
  role?: AuthRole | "all";
  isActive?: "all" | "true" | "false";
  page?: number;
  limit?: number;
}

export interface AdminUserPagination {
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

export const getAdminUsers = async (filters: AdminUserFilters = {}) => {
  const response = await api.get<
    ApiResponse<{ users: AdminUser[]; pagination: AdminUserPagination }>
  >("/admin/users", {
    params: {
      search: filters.search || undefined,
      role: filters.role && filters.role !== "all" ? filters.role : undefined,
      isActive:
        filters.isActive && filters.isActive !== "all" ? filters.isActive : undefined,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};

export const getAdminUser = async (id: string) => {
  const response = await api.get<ApiResponse<{ user: AdminUser }>>(
    `/admin/users/${id}`
  );
  return response.data.data.user;
};

export const updateAdminUserRole = async (id: string, role: AuthRole) => {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(
    `/admin/users/${id}/role`,
    { role }
  );
  return response.data.data.user;
};

export const activateAdminUser = async (id: string) => {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(
    `/admin/users/${id}/activate`
  );
  return response.data.data.user;
};

export const deactivateAdminUser = async (id: string) => {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(
    `/admin/users/${id}/deactivate`
  );
  return response.data.data.user;
};

export const getAdminUserSessions = async (id: string) => {
  const response = await api.get<
    ApiResponse<{ user: AdminUser; sessions: AdminUserSession[] }>
  >(`/admin/users/${id}/sessions`);
  return response.data.data;
};

export const revokeAdminUserSessions = async (id: string) => {
  const response = await api.patch<ApiResponse<{ modifiedCount: number }>>(
    `/admin/users/${id}/revoke-sessions`
  );
  return response.data.data.modifiedCount;
};

export const deleteAdminUser = async (id: string) => {
  const response = await api.delete<ApiResponse<{ user: AdminUser }>>(
    `/admin/users/${id}`
  );
  return response.data.data.user;
};
