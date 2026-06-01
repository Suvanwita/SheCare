import { AxiosError } from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { configureAuthInterceptors } from "../lib/api";
import * as authService from "../services/auth.service";
import type {
  AuthData,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../services/auth.service";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setTokens: (tokens: { accessToken: string | null; refreshToken?: string | null }) => void;
  clearAuth: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
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

const applyAuthData = (data: AuthData) => ({
  user: data.user,
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  isAuthenticated: true,
  error: null,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      register: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          const data = await authService.register(payload);
          set({ ...applyAuthData(data), isLoading: false });
        } catch (error) {
          const message = getErrorMessage(error, "Unable to create your account right now.");
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      login: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          const data = await authService.login(payload);
          set({ ...applyAuthData(data), isLoading: false });
        } catch (error) {
          const message = getErrorMessage(error, "Unable to sign in right now.");
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        const token = get().refreshToken;
        set({ isLoading: true, error: null });

        try {
          await authService.logout(token);
        } catch {
          // Local logout should still complete if the server session is already gone.
        } finally {
          get().clearAuth();
        }
      },

      fetchMe: async () => {
        if (!get().accessToken) {
          get().clearAuth();
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const user = await authService.getMe();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = getErrorMessage(error, "Unable to fetch your profile.");
          set({ error: message, isLoading: false });
          get().clearAuth();
          throw new Error(message);
        }
      },

      setTokens: ({ accessToken, refreshToken }) => {
        set((state) => ({
          accessToken,
          refreshToken: refreshToken === undefined ? state.refreshToken : refreshToken,
          isAuthenticated: Boolean(accessToken && state.user),
        }));
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: "shecare-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

configureAuthInterceptors({
  getAuthTokens: () => ({
    accessToken: useAuthStore.getState().accessToken,
    refreshToken: useAuthStore.getState().refreshToken,
  }),
  setAuthTokens: ({ accessToken, refreshToken }) => {
    useAuthStore.getState().setTokens({ accessToken, refreshToken });
  },
  handleAuthFailure: () => {
    useAuthStore.getState().clearAuth();
  },
});
