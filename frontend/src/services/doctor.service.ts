import api from "../lib/api";

export interface Doctor {
  _id: string;
  user?: string;
  name: string;
  specialization: string;
  experienceYears?: number;
  rating: number;
  location?: string;
  consultationFee?: number;
  availableSlots: string[];
  bio?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorPayload {
  user?: string;
  name: string;
  specialization: string;
  experienceYears?: number;
  rating?: number;
  location?: string;
  consultationFee?: number;
  availableSlots?: string[];
  bio?: string;
  isVerified?: boolean;
}

export interface DoctorFilters {
  specialization?: string;
  location?: string;
  minRating?: string | number;
  page?: number;
  limit?: number;
}

export interface DoctorPagination {
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

export const getDoctors = async (filters: DoctorFilters = {}) => {
  const response = await api.get<ApiResponse<{ doctors: Doctor[]; pagination: DoctorPagination }>>(
    "/doctors",
    {
      params: {
        specialization: filters.specialization || undefined,
        location: filters.location || undefined,
        minRating: filters.minRating || undefined,
        page: filters.page,
        limit: filters.limit,
      },
    }
  );

  return response.data.data;
};

export const getDoctor = async (id: string) => {
  const response = await api.get<ApiResponse<{ doctor: Doctor }>>(`/doctors/${id}`);
  return response.data.data.doctor;
};

export const createDoctor = async (payload: DoctorPayload) => {
  const response = await api.post<ApiResponse<{ doctor: Doctor }>>("/doctors", payload);
  return response.data.data.doctor;
};

export const updateDoctor = async (id: string, payload: Partial<DoctorPayload>) => {
  const response = await api.patch<ApiResponse<{ doctor: Doctor }>>(`/doctors/${id}`, payload);
  return response.data.data.doctor;
};

export const deleteDoctor = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/doctors/${id}`);
};
