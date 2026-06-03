import api from "../lib/api";

export interface SymptomFrequency {
  symptom: string;
  count: number;
}

export interface HealthTrendPoint {
  date: string;
  label: string;
  sleepHours: number;
  waterIntake: number;
  painLevel: number;
  stressLevel: number;
}

export interface CycleTrendPoint {
  cycleId: string;
  startDate: string;
  label: string;
  cycleLength: number;
  isIrregular: boolean;
}

export interface AnalyticsSummary {
  healthSummary: {
    averageSleep: number;
    averageWaterIntake: number;
    averagePainLevel: number;
    averageStressLevel: number;
    mostCommonSymptoms: SymptomFrequency[];
  };
  cycleSummary: {
    averageCycleLength: number;
    irregularCycleCount: number;
    predictedNextPeriod: string | null;
    cycleLengthTrend: CycleTrendPoint[];
  };
  reminderSummary: {
    totalReminders: number;
    completedReminders: number;
    missedReminders: number;
    adherencePercentage: number;
  };
  appointmentSummary: {
    upcomingAppointments: number;
    completedAppointments: number;
  };
  pcosSummary: {
    latestRiskLevel: "Low" | "Moderate" | "High" | null;
    latestProbability: number | null;
    assessmentCount: number;
  };
  chartData: {
    healthTrend: HealthTrendPoint[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getAnalyticsSummary = async () => {
  const response = await api.get<ApiResponse<AnalyticsSummary>>("/analytics/summary");
  return response.data.data;
};
