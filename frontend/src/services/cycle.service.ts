import api from "../lib/api";

export type FlowIntensity = "light" | "medium" | "heavy";

export interface Cycle {
  _id: string;
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  periodDuration?: number;
  flowIntensity: FlowIntensity;
  symptoms: string[];
  notes?: string;
  predictedNextPeriod?: string;
  isIrregular: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CyclePayload {
  startDate: string;
  endDate: string;
  flowIntensity: FlowIntensity;
  symptoms: string[];
  notes?: string;
}

export interface CyclePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CycleLengthTrendPoint {
  cycleId: string;
  startDate: string;
  cycleLength: number;
  isIrregular: boolean;
}

export interface CycleAnalytics {
  averageCycleLength: number;
  averagePeriodDuration: number;
  irregularCycleCount: number;
  predictedNextPeriod: string | null;
  cycleLengthTrend: CycleLengthTrendPoint[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getCycles = async (params: { page?: number; limit?: number } = {}) => {
  const response = await api.get<ApiResponse<{ cycles: Cycle[]; pagination: CyclePagination }>>(
    "/cycles",
    { params }
  );
  return response.data.data;
};

export const getCycle = async (id: string) => {
  const response = await api.get<ApiResponse<{ cycle: Cycle }>>(`/cycles/${id}`);
  return response.data.data.cycle;
};

export const getCycleAnalytics = async () => {
  const response = await api.get<ApiResponse<{ analytics: CycleAnalytics }>>(
    "/cycles/analytics"
  );
  return response.data.data.analytics;
};

export const createCycle = async (payload: CyclePayload) => {
  const response = await api.post<ApiResponse<{ cycle: Cycle }>>("/cycles", payload);
  return response.data.data.cycle;
};

export const updateCycle = async (id: string, payload: Partial<CyclePayload>) => {
  const response = await api.patch<ApiResponse<{ cycle: Cycle }>>(`/cycles/${id}`, payload);
  return response.data.data.cycle;
};

export const deleteCycle = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/cycles/${id}`);
};
