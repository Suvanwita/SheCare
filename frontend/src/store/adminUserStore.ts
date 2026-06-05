import { AxiosError } from "axios";
import { create } from "zustand";
import type { AuthRole } from "../services/auth.service";
import * as adminUserService from "../services/adminUser.service";
import type {
  AdminUser,
  AdminUserFilters,
  AdminUserPagination,
  AdminUserSession,
} from "../services/adminUser.service";

interface AdminUserState {
  users: AdminUser[];
  sessions: AdminUserSession[];
  sessionUser: AdminUser | null;
  pagination: AdminUserPagination;
  filters: AdminUserFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  isLoadingSessions: boolean;
  error: string | null;
  fetchUsers: (filters?: AdminUserFilters) => Promise<void>;
  updateRole: (id: string, role: AuthRole) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchSessions: (id: string) => Promise<void>;
  revokeSessions: (id: string) => Promise<void>;
  clearSessions: () => void;
  clearError: () => void;
}

const defaultPagination: AdminUserPagination = {
  page: 1,
  limit: 10,
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

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  users: [],
  sessions: [],
  sessionUser: null,
  pagination: defaultPagination,
  filters: {
    page: 1,
    limit: 10,
    role: "all",
    isActive: "all",
  },
  isLoading: false,
  isSubmitting: false,
  isLoadingSessions: false,
  error: null,

  fetchUsers: async (filters = {}) => {
    const nextFilters = {
      ...get().filters,
      ...filters,
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const data = await adminUserService.getAdminUsers(nextFilters);
      set({
        users: data.users,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch users."),
        isLoading: false,
      });
    }
  },

  updateRole: async (id, role) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminUserService.updateAdminUserRole(id, role);
      set({ isSubmitting: false });
      await get().fetchUsers();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update user role.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  activateUser: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminUserService.activateAdminUser(id);
      set({ isSubmitting: false });
      await get().fetchUsers();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to activate user.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deactivateUser: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminUserService.deactivateAdminUser(id);
      set({ isSubmitting: false });
      await get().fetchUsers();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to deactivate user.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deleteUser: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminUserService.deleteAdminUser(id);
      set({ isSubmitting: false });
      await get().fetchUsers();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete user.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  fetchSessions: async (id) => {
    set({ isLoadingSessions: true, error: null });

    try {
      const data = await adminUserService.getAdminUserSessions(id);
      set({
        sessionUser: data.user,
        sessions: data.sessions,
        isLoadingSessions: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch user sessions."),
        isLoadingSessions: false,
      });
    }
  },

  revokeSessions: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminUserService.revokeAdminUserSessions(id);
      set({ isSubmitting: false });
      await get().fetchSessions(id);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to revoke user sessions.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  clearSessions: () => {
    set({ sessions: [], sessionUser: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
