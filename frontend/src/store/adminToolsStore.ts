import { AxiosError } from "axios";
import { create } from "zustand";
import * as service from "../services/adminTools.service";
import type {
  AdminToolAction,
  AdminToolResult,
  AdminToolsStatus,
} from "../services/adminTools.service";

interface AdminToolsState {
  status: AdminToolsStatus | null;
  lastResults: Partial<Record<AdminToolAction, AdminToolResult>>;
  loadingStatus: boolean;
  loadingTool: AdminToolAction | null;
  error: string | null;
  fetchStatus: () => Promise<void>;
  runTool: (action: AdminToolAction) => Promise<void>;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const useAdminToolsStore = create<AdminToolsState>((set, get) => ({
  status: null,
  lastResults: {},
  loadingStatus: false,
  loadingTool: null,
  error: null,

  fetchStatus: async () => {
    set({ loadingStatus: true, error: null });

    try {
      const status = await service.getAdminToolsStatus();
      set({ status, loadingStatus: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to fetch admin tools status."),
        loadingStatus: false,
      });
    }
  },

  runTool: async (action) => {
    set({ loadingTool: action, error: null });

    try {
      const result = await service.runAdminTool(action);
      set({
        lastResults: {
          ...get().lastResults,
          [action]: result,
        },
        loadingTool: null,
      });

      await get().fetchStatus();
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to run admin tool."),
        loadingTool: null,
      });
    }
  },
}));
