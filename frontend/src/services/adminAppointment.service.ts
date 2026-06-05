import api from "../lib/api";
import type { Appointment, AppointmentStatus, AppointmentType } from "./appointment.service";
import type { Doctor } from "./doctor.service";

export type AdminAppointment = Omit<Appointment, "user" | "doctor"> & {
  user:
    | string
    | {
        fullName?: string;
        email?: string;
        phone?: string;
      };
  doctor: Doctor;
};

export interface AdminAppointmentFilters {
  doctor?: string;
  status?: AppointmentStatus | "all";
  appointmentType?: AppointmentType | "all";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminPagination {
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

export const getAdminAppointments = async (filters: AdminAppointmentFilters = {}) => {
  const response = await api.get<
    ApiResponse<{ appointments: AdminAppointment[]; pagination: AdminPagination }>
  >("/admin/appointments", {
    params: {
      doctor: filters.doctor || undefined,
      status: filters.status && filters.status !== "all" ? filters.status : undefined,
      appointmentType:
        filters.appointmentType && filters.appointmentType !== "all"
          ? filters.appointmentType
          : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      page: filters.page,
      limit: filters.limit,
    },
  });

  return response.data.data;
};

export const updateAdminAppointmentStatus = async (
  id: string,
  status: AppointmentStatus
) => {
  const response = await api.patch<ApiResponse<{ appointment: AdminAppointment }>>(
    `/admin/appointments/${id}/status`,
    { status }
  );
  return response.data.data.appointment;
};

export const resolveAdminAppointment = async (id: string, note: string) => {
  const response = await api.patch<ApiResponse<{ appointment: AdminAppointment }>>(
    `/admin/appointments/${id}/resolve`,
    { note }
  );
  return response.data.data.appointment;
};
