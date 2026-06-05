import api from "../lib/api";

export interface ChartDatum {
  name: string;
  value: number;
}

export interface AppointmentVolumeDatum {
  month: string;
  count: number;
}

export interface AdminAnalyticsOverview {
  users: {
    totalUsers: number;
    activeUsers: number;
    doctors: number;
    admins: number;
    newUsersThisMonth: number;
  };
  appointments: {
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    appointmentVolumeByMonth: AppointmentVolumeDatum[];
  };
  knowledgeHub: {
    totalArticles: number;
    publishedArticles: number;
    featuredArticles: number;
    totalArticleViews: number;
    totalBookmarks: number;
    popularCategories: ChartDatum[];
  };
  reports: {
    totalReports: number;
    reportsByCategory: ChartDatum[];
    reportsByMimeType: ChartDatum[];
  };
  pcos: {
    totalAssessments: number;
    lowRiskCount: number;
    moderateRiskCount: number;
    highRiskCount: number;
  };
  healthTrends: {
    popularSymptoms: ChartDatum[];
    averageCycleLength: number;
    irregularCycleCount: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getAdminAnalyticsOverview = async () => {
  const response = await api.get<ApiResponse<AdminAnalyticsOverview>>(
    "/admin/analytics/overview"
  );

  return response.data.data;
};
