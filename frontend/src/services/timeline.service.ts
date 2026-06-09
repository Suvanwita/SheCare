import api from "../lib/api";

export type TimelineEventType =
  | "appointment.booked"
  | "reminder.completed"
  | "report.uploaded"
  | "pcos.assessment.completed"
  | "article.viewed"
  | "cycle.created"
  | "health_log.created";

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  topic: string;
  entityId?: string;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
  occurredAt: string;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  filters: {
    eventTypes: TimelineEventType[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getTimeline = async (params: { eventType?: TimelineEventType | "all"; limit?: number } = {}) => {
  const response = await api.get<ApiResponse<TimelineResponse>>("/timeline", {
    params: {
      eventType: params.eventType === "all" ? undefined : params.eventType,
      limit: params.limit,
    },
  });

  return response.data.data;
};
