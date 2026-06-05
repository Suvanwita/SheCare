import { AxiosError } from "axios";
import { create } from "zustand";
import type { AppointmentStatus } from "../services/appointment.service";
import * as service from "../services/adminAppointment.service";
import type { AdminAppointment, AdminAppointmentFilters, AdminPagination } from "../services/adminAppointment.service";

interface State {
  appointments: AdminAppointment[];
  pagination: AdminPagination;
  filters: AdminAppointmentFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchAppointments: (filters?: AdminAppointmentFilters) => Promise<void>;
  updateStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  resolveAppointment: (id: string, note: string) => Promise<void>;
  clearError: () => void;
}

const pagination = { page: 1, limit: 10, total: 0, pages: 0 };
const msg = (error: unknown, fallback: string) =>
  error instanceof AxiosError
    ? error.response?.data?.message ?? fallback
    : error instanceof Error
      ? error.message
      : fallback;

export const useAdminAppointmentStore = create<State>((set, get) => ({
  appointments: [],
  pagination,
  filters: { page: 1, limit: 10, status: "all", appointmentType: "all" },
  isLoading: false,
  isSubmitting: false,
  error: null,
  fetchAppointments: async (filters = {}) => {
    const nextFilters = { ...get().filters, ...filters };
    set({ isLoading: true, error: null, filters: nextFilters });
    try {
      const data = await service.getAdminAppointments(nextFilters);
      set({ appointments: data.appointments, pagination: data.pagination, isLoading: false });
    } catch (error) {
      set({ error: msg(error, "Unable to fetch appointments."), isLoading: false });
    }
  },
  updateStatus: async (id, status) => {
    set({ isSubmitting: true, error: null });
    try {
      await service.updateAdminAppointmentStatus(id, status);
      set({ isSubmitting: false });
      await get().fetchAppointments();
    } catch (error) {
      const message = msg(error, "Unable to update appointment status.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },
  resolveAppointment: async (id, note) => {
    set({ isSubmitting: true, error: null });
    try {
      await service.resolveAdminAppointment(id, note);
      set({ isSubmitting: false });
      await get().fetchAppointments();
    } catch (error) {
      const message = msg(error, "Unable to resolve appointment.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },
  clearError: () => set({ error: null }),
}));
