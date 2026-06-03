import { AxiosError } from "axios";
import { create } from "zustand";
import * as pcosService from "../services/pcos.service";
import type {
  PcosAssessment,
  PcosInput,
  PcosPagination,
} from "../services/pcos.service";

interface PcosState {
  currentAssessment: PcosAssessment | null;
  history: PcosAssessment[];
  pagination: PcosPagination;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  predictPcos: (payload: PcosInput) => Promise<PcosAssessment>;
  fetchHistory: () => Promise<void>;
  clearError: () => void;
}

const defaultPagination: PcosPagination = {
  page: 1,
  limit: 20,
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

export const usePcosStore = create<PcosState>((set, get) => ({
  currentAssessment: null,
  history: [],
  pagination: defaultPagination,
  isLoading: false,
  isSubmitting: false,
  error: null,

  predictPcos: async (payload) => {
    set({ isSubmitting: true, error: null, currentAssessment: null });

    try {
      const assessment = await pcosService.predictPcos(payload);
      set({ currentAssessment: assessment, isSubmitting: false });
      await get().fetchHistory();
      return assessment;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to estimate PCOS risk.");
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  fetchHistory: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await pcosService.getPcosHistory({ page: 1, limit: 20 });
      set({
        history: data.assessments,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch PCOS assessment history."),
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
