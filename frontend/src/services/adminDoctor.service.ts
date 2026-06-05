import api from "../lib/api";
import type { Appointment } from "./appointment.service";
import type { Doctor, DoctorPayload, DoctorPagination } from "./doctor.service";

export type AdminDoctorAppointment = Omit<Appointment, "user"> & {
  user:
    | string
    | {
        fullName?: string;
        email?: string;
        phone?: string;
      };
};

export interface AdminDoctorFilters {
  search?: string;
  specialization?: string;
  isVerified?: "all" | "true" | "false";
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getAdminDoctors = async (filters: AdminDoctorFilters = {}) => {
  const response = await api.get<
    ApiResponse<{ doctors: Doctor[]; pagination: DoctorPagination }>
  >("/admin/doctors", {
    params: {
      search: filters.search || undefined,
      specialization:
        filters.specialization && filters.specialization !== "all"
          ? filters.specialization
          : undefined,
      isVerified:
        filters.isVerified && filters.isVerified !== "all"
          ? filters.isVerified
          : undefined,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};

export const createAdminDoctor = async (payload: DoctorPayload) => {
  const response = await api.post<ApiResponse<{ doctor: Doctor }>>(
    "/admin/doctors",
    payload
  );
  return response.data.data.doctor;
};

export const getAdminDoctor = async (id: string) => {
  const response = await api.get<ApiResponse<{ doctor: Doctor }>>(
    `/admin/doctors/${id}`
  );
  return response.data.data.doctor;
};

export const updateAdminDoctor = async (
  id: string,
  payload: Partial<DoctorPayload>
) => {
  const response = await api.patch<ApiResponse<{ doctor: Doctor }>>(
    `/admin/doctors/${id}`,
    payload
  );
  return response.data.data.doctor;
};

export const deleteAdminDoctor = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/admin/doctors/${id}`);
};

export const verifyAdminDoctor = async (id: string) => {
  const response = await api.patch<ApiResponse<{ doctor: Doctor }>>(
    `/admin/doctors/${id}/verify`
  );
  return response.data.data.doctor;
};

export const unverifyAdminDoctor = async (id: string) => {
  const response = await api.patch<ApiResponse<{ doctor: Doctor }>>(
    `/admin/doctors/${id}/unverify`
  );
  return response.data.data.doctor;
};

export const getAdminDoctorAppointments = async (id: string) => {
  const response = await api.get<
    ApiResponse<{ doctor: Doctor; appointments: AdminDoctorAppointment[] }>
  >(`/admin/doctors/${id}/appointments`);

  return response.data.data;
};
