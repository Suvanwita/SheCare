import { AxiosError } from "axios";
import { create } from "zustand";
import * as adminDoctorService from "../services/adminDoctor.service";
import type {
  AdminDoctorAppointment,
  AdminDoctorFilters,
} from "../services/adminDoctor.service";
import type { Doctor, DoctorPayload, DoctorPagination } from "../services/doctor.service";

interface AdminDoctorState {
  doctors: Doctor[];
  appointments: AdminDoctorAppointment[];
  selectedDoctor: Doctor | null;
  appointmentDoctor: Doctor | null;
  pagination: DoctorPagination;
  filters: AdminDoctorFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  isLoadingAppointments: boolean;
  error: string | null;
  fetchDoctors: (filters?: AdminDoctorFilters) => Promise<void>;
  createDoctor: (payload: DoctorPayload) => Promise<void>;
  updateDoctor: (id: string, payload: Partial<DoctorPayload>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  verifyDoctor: (id: string) => Promise<void>;
  unverifyDoctor: (id: string) => Promise<void>;
  fetchAppointments: (id: string) => Promise<void>;
  clearAppointments: () => void;
  clearError: () => void;
}

const defaultPagination: DoctorPagination = {
  page: 1,
  limit: 10,
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

export const useAdminDoctorStore = create<AdminDoctorState>((set, get) => ({
  doctors: [],
  appointments: [],
  selectedDoctor: null,
  appointmentDoctor: null,
  pagination: defaultPagination,
  filters: {
    page: 1,
    limit: 10,
    isVerified: "all",
    specialization: "all",
  },
  isLoading: false,
  isSubmitting: false,
  isLoadingAppointments: false,
  error: null,

  fetchDoctors: async (filters = {}) => {
    const nextFilters = {
      ...get().filters,
      ...filters,
    };

    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const data = await adminDoctorService.getAdminDoctors(nextFilters);
      set({
        doctors: data.doctors,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch admin doctors."),
        isLoading: false,
      });
    }
  },

  createDoctor: async (payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminDoctorService.createAdminDoctor(payload);
      set({ isSubmitting: false });
      await get().fetchDoctors();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create doctor.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  updateDoctor: async (id, payload) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminDoctorService.updateAdminDoctor(id, payload);
      set({ isSubmitting: false });
      await get().fetchDoctors();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update doctor.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  deleteDoctor: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminDoctorService.deleteAdminDoctor(id);
      set({ isSubmitting: false });
      await get().fetchDoctors();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to delete doctor.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  verifyDoctor: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminDoctorService.verifyAdminDoctor(id);
      set({ isSubmitting: false });
      await get().fetchDoctors();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to verify doctor.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  unverifyDoctor: async (id) => {
    set({ isSubmitting: true, error: null });

    try {
      await adminDoctorService.unverifyAdminDoctor(id);
      set({ isSubmitting: false });
      await get().fetchDoctors();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to unverify doctor.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  fetchAppointments: async (id) => {
    set({ isLoadingAppointments: true, error: null });

    try {
      const data = await adminDoctorService.getAdminDoctorAppointments(id);
      set({
        appointmentDoctor: data.doctor,
        appointments: data.appointments,
        isLoadingAppointments: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch doctor appointments."),
        isLoadingAppointments: false,
      });
    }
  },

  clearAppointments: () => {
    set({ appointments: [], appointmentDoctor: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
