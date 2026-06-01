import api from "../lib/api";

export type HealthMood = "happy" | "calm" | "tired" | "stressed" | "sad" | "neutral";

export type HealthSymptom =
  | "cramps"
  | "headache"
  | "acne"
  | "bloating"
  | "fatigue"
  | "nausea"
  | "mood_swings";

export interface HealthLog {
  _id: string;
  date: string;
  mood: HealthMood;
  symptoms: HealthSymptom[];
  sleepHours?: number;
  waterIntake?: number;
  weightKg?: number;
  painLevel?: number;
  stressLevel?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthLogPayload {
  date: string;
  mood: HealthMood;
  symptoms: HealthSymptom[];
  sleepHours: number;
  waterIntake: number;
  weightKg: number;
  painLevel?: number;
  stressLevel?: number;
  notes?: string;
}

export interface HealthLogFilters {
  mood?: HealthMood | "all";
  symptom?: HealthSymptom | "all";
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

export interface HealthLogPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const getHealthLogs = async (filters: HealthLogFilters = {}) => {
  const params = {
    page: filters.page,
    limit: filters.limit,
    mood: filters.mood && filters.mood !== "all" ? filters.mood : undefined,
    symptom: filters.symptom && filters.symptom !== "all" ? filters.symptom : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };

  const response = await api.get<
    ApiResponse<{ healthLogs: HealthLog[]; pagination: HealthLogPagination }>
  >("/health-logs", { params });

  return response.data.data;
};

export const getHealthLog = async (id: string) => {
  const response = await api.get<ApiResponse<{ healthLog: HealthLog }>>(`/health-logs/${id}`);
  return response.data.data.healthLog;
};

export const createHealthLog = async (payload: HealthLogPayload) => {
  const response = await api.post<ApiResponse<{ healthLog: HealthLog }>>(
    "/health-logs",
    payload
  );
  return response.data.data.healthLog;
};

export const updateHealthLog = async (id: string, payload: Partial<HealthLogPayload>) => {
  const response = await api.patch<ApiResponse<{ healthLog: HealthLog }>>(
    `/health-logs/${id}`,
    payload
  );
  return response.data.data.healthLog;
};

export const deleteHealthLog = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/health-logs/${id}`);
};
