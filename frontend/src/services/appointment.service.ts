import api from "../lib/api";
import type { Doctor } from "./doctor.service";

export type AppointmentType = "online" | "clinic";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  _id: string;
  user: string;
  doctor: Doctor;
  date: string;
  slot: string;
  appointmentType: AppointmentType;
  reason?: string;
  notes?: string;
  status: AppointmentStatus;
  meetingLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentPayload {
  doctor: string;
  date: string;
  slot: string;
  appointmentType: AppointmentType;
  reason: string;
  notes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createAppointment = async (payload: AppointmentPayload) => {
  const response = await api.post<ApiResponse<{ appointment: Appointment }>>(
    "/appointments",
    payload
  );
  return response.data.data.appointment;
};

export const getMyAppointments = async () => {
  const response = await api.get<ApiResponse<{ appointments: Appointment[] }>>(
    "/appointments/my"
  );
  return response.data.data.appointments;
};

export const getAppointment = async (id: string) => {
  const response = await api.get<ApiResponse<{ appointment: Appointment }>>(
    `/appointments/${id}`
  );
  return response.data.data.appointment;
};

export const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
  const response = await api.patch<ApiResponse<{ appointment: Appointment }>>(
    `/appointments/${id}/status`,
    { status }
  );
  return response.data.data.appointment;
};

export const deleteAppointment = async (id: string) => {
  await api.delete<ApiResponse<{ id: string }>>(`/appointments/${id}`);
};
