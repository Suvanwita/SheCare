import { AxiosError } from "axios";
import { create } from "zustand";
import type { NotificationPagination } from "../services/notification.service";
import * as service from "../services/adminNotification.service";
import type { AdminNotification, AnnouncementPayload, SystemNotificationPayload } from "../services/adminNotification.service";

interface State {
  notifications: AdminNotification[];
  pagination: NotificationPagination;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  message: string | null;
  fetchNotifications: (params?: { page?: number; limit?: number }) => Promise<void>;
  createAnnouncement: (payload: AnnouncementPayload) => Promise<void>;
  createSystemNotification: (payload: SystemNotificationPayload) => Promise<void>;
}

const pagination = { page: 1, limit: 10, total: 0, pages: 0 };
const msg = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

export const useAdminNotificationStore = create<State>((set, get) => ({
  notifications: [],
  pagination,
  isLoading: false,
  isSubmitting: false,
  error: null,
  message: null,
  fetchNotifications: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await service.getAdminNotifications({
        page: params.page ?? get().pagination.page,
        limit: params.limit ?? get().pagination.limit,
      });
      set({ notifications: data.notifications, pagination: data.pagination, isLoading: false });
    } catch (error) {
      set({ error: msg(error, "Unable to fetch notifications."), isLoading: false });
    }
  },
  createAnnouncement: async (payload) => {
    set({ isSubmitting: true, error: null, message: null });
    try {
      const response = await service.createAdminAnnouncement(payload);
      set({ isSubmitting: false, message: response.message });
      await get().fetchNotifications({ page: 1 });
    } catch (error) {
      set({ error: msg(error, "Unable to create announcement."), isSubmitting: false });
    }
  },
  createSystemNotification: async (payload) => {
    set({ isSubmitting: true, error: null, message: null });
    try {
      const response = await service.createAdminSystemNotification(payload);
      set({ isSubmitting: false, message: response.message });
      await get().fetchNotifications({ page: 1 });
    } catch (error) {
      set({ error: msg(error, "Unable to create notification."), isSubmitting: false });
    }
  },
}));
