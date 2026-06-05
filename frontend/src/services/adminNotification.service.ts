import api from "../lib/api";
import type { Notification, NotificationPagination } from "./notification.service";

export type AdminNotification = Omit<Notification, "user"> & {
  user:
    | string
    | {
        fullName?: string;
        email?: string;
      };
};

export interface AnnouncementPayload {
  target: "global" | "users";
  userIds?: string[];
  title: string;
  message?: string;
}

export interface SystemNotificationPayload {
  userId: string;
  title: string;
  message?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getAdminNotifications = async (params: { page?: number; limit?: number } = {}) => {
  const response = await api.get<
    ApiResponse<{ notifications: AdminNotification[]; pagination: NotificationPagination }>
  >("/admin/notifications", { params });

  return response.data.data;
};

export const createAdminAnnouncement = async (payload: AnnouncementPayload) => {
  const response = await api.post<ApiResponse<{ count: number }>>(
    "/admin/notifications/announcement",
    payload
  );
  return response.data;
};

export const createAdminSystemNotification = async (
  payload: SystemNotificationPayload
) => {
  const response = await api.post<ApiResponse<{ notification: AdminNotification }>>(
    "/admin/notifications/system",
    payload
  );
  return response.data;
};
