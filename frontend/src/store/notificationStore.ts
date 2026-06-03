import { AxiosError } from "axios";
import { create } from "zustand";
import * as notificationService from "../services/notification.service";
import type {
  Notification,
  NotificationFilters,
  NotificationPagination,
} from "../services/notification.service";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pagination: NotificationPagination;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearError: () => void;
}

const defaultPagination: NotificationPagination = {
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

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: defaultPagination,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchNotifications: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const data = await notificationService.getNotifications({
        page: 1,
        limit: 20,
        ...filters,
      });
      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch notifications."),
        isLoading: false,
      });
    }
  },

  markRead: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      const notification = await notificationService.markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((item) =>
          item._id === id ? notification : item
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount -
            (state.notifications.some((item) => item._id === id && !item.isRead) ? 1 : 0)
        ),
        isSubmitting: false,
      }));
      await get().fetchNotifications();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to mark notification read.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  markAllRead: async () => {
    set({ isSubmitting: true, error: null });

    try {
      await notificationService.markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
        isSubmitting: false,
      }));
      await get().fetchNotifications();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to mark notifications read.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deleteNotification: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await notificationService.deleteNotification(id);
      set({ isSubmitting: false });
      await get().fetchNotifications();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete notification.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
