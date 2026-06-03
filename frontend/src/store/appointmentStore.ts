import { AxiosError } from "axios";
import { create } from "zustand";
import * as appointmentService from "../services/appointment.service";
import * as doctorService from "../services/doctor.service";
import type {
  Appointment,
  AppointmentPayload,
  AppointmentStatus,
} from "../services/appointment.service";
import type { Doctor, DoctorFilters, DoctorPagination } from "../services/doctor.service";

interface AppointmentState {
  doctors: Doctor[];
  appointments: Appointment[];
  doctorPagination: DoctorPagination;
  doctorFilters: DoctorFilters;
  isLoadingDoctors: boolean;
  isLoadingAppointments: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchDoctors: (filters?: DoctorFilters) => Promise<void>;
  fetchMyAppointments: () => Promise<void>;
  bookAppointment: (payload: AppointmentPayload) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  clearError: () => void;
}

const defaultDoctorPagination: DoctorPagination = {
  page: 1,
  limit: 50,
  total: 0,
  pages: 0,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  doctors: [],
  appointments: [],
  doctorPagination: defaultDoctorPagination,
  doctorFilters: {
    page: 1,
    limit: 50,
  },
  isLoadingDoctors: false,
  isLoadingAppointments: false,
  isSubmitting: false,
  error: null,

  fetchDoctors: async (filters = {}) => {
    const nextFilters = {
      ...get().doctorFilters,
      ...filters,
    };

    set({ isLoadingDoctors: true, error: null, doctorFilters: nextFilters });

    try {
      const data = await doctorService.getDoctors(nextFilters);
      set({
        doctors: data.doctors,
        doctorPagination: data.pagination,
        isLoadingDoctors: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch doctors."),
        isLoadingDoctors: false,
      });
    }
  },

  fetchMyAppointments: async () => {
    set({ isLoadingAppointments: true, error: null });

    try {
      const appointments = await appointmentService.getMyAppointments();
      set({ appointments, isLoadingAppointments: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch appointments."),
        isLoadingAppointments: false,
      });
    }
  },

  bookAppointment: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await appointmentService.createAppointment(payload);
      set({ isSubmitting: false });
      await get().fetchMyAppointments();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to book appointment.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  updateAppointmentStatus: async (id, status) => {
    set({ isSubmitting: true, error: null });

    try {
      await appointmentService.updateAppointmentStatus(id, status);
      set({ isSubmitting: false });
      await get().fetchMyAppointments();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update appointment.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  cancelAppointment: async (id) => {
    await get().updateAppointmentStatus(id, "cancelled");
  },

  clearError: () => {
    set({ error: null });
  },
}));
