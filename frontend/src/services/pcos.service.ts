import api from "../lib/api";

export type PcosRiskLevel = "Low" | "Moderate" | "High";

export interface PcosInput {
  age_yrs: number;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  cycle_r_i: number;
  cycle_length_days: number;
  weight_gain_y_n: number;
  hair_growth_y_n: number;
  skin_darkening_y_n: number;
  hair_loss_y_n: number;
  pimples_y_n: number;
  fast_food_y_n: number;
  reg_exercise_y_n: number;
  follicle_no_l: number;
  follicle_no_r: number;
  amh_ng_ml: number;
  fsh_miu_ml: number;
  lh_miu_ml: number;
  fsh_lh: number;
  tsh_miu_l: number;
  vit_d3_ng_ml: number;
  waist_inch: number;
  hip_inch: number;
  waist_hip_ratio: number;
}

export interface PcosContributingFactor {
  feature: string;
  value: number;
  importance: number;
}

export interface PcosPredictionResult {
  probability: number;
  risk_level: PcosRiskLevel;
  message: string;
  top_contributing_factors: PcosContributingFactor[];
  recommendation: string;
  disclaimer: string;
}

export interface PcosAssessment {
  _id: string;
  input: PcosInput;
  result: PcosPredictionResult;
  createdAt?: string;
  updatedAt?: string;
}

export interface PcosPagination {
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

export const predictPcos = async (payload: PcosInput) => {
  const response = await api.post<ApiResponse<{ assessment: PcosAssessment }>>(
    "/pcos/predict",
    payload
  );
  return response.data.data.assessment;
};

export const getPcosHistory = async (params: { page?: number; limit?: number } = {}) => {
  const response = await api.get<
    ApiResponse<{ assessments: PcosAssessment[]; pagination: PcosPagination }>
  >("/pcos/history", { params });
  return response.data.data;
};

export const getPcosAssessment = async (id: string) => {
  const response = await api.get<ApiResponse<{ assessment: PcosAssessment }>>(
    `/pcos/${id}`
  );
  return response.data.data.assessment;
};
