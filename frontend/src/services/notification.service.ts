import api from "../lib/api";

export type NotificationType = "reminder" | "appointment" | "report" | "system" | "risk";

export interface Notification {
  _id: string;
  title: string;
  message?: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationFilters {
  unread?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationPagination {
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

export const getNotifications = async (filters: NotificationFilters = {}) => {
  const response = await api.get<
    ApiResponse<{
      notifications: Notification[];
      unreadCount: number;
      pagination: NotificationPagination;
    }>
  >("/notifications", {
    params: {
      unread: filters.unread,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};

export const markNotificationRead = async (id: string) => {
  const response = await api.patch<ApiResponse<{ notification: Notification }>>(
    `/notifications/${id}/read`
  );
  return response.data.data.notification;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch<ApiResponse<{ modifiedCount: number }>>(
    "/notifications/read-all"
  );
  return response.data.data.modifiedCount;
};

export const deleteNotification = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/notifications/${id}`);
};
