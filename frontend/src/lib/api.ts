import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type AuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let getAuthTokens: () => AuthTokens = () => ({
  accessToken: null,
  refreshToken: null,
});

let setAuthTokens: (tokens: AuthTokens) => void = () => {};
let handleAuthFailure: () => void = () => {};
let refreshRequest: Promise<string> | null = null;

export const configureAuthInterceptors = (handlers: {
  getAuthTokens: () => AuthTokens;
  setAuthTokens: (tokens: AuthTokens) => void;
  handleAuthFailure: () => void;
}) => {
  getAuthTokens = handlers.getAuthTokens;
  setAuthTokens = handlers.setAuthTokens;
  handleAuthFailure = handlers.handleAuthFailure;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const { accessToken } = getAuthTokens();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const { refreshToken } = getAuthTokens();

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      if (error.response?.status === 401) {
        handleAuthFailure();
      }

      return Promise.reject(error);
    }

    if (!refreshToken) {
      handleAuthFailure();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = refreshApi
          .post("/auth/refresh", { refreshToken })
          .then((response) => response.data.data.accessToken as string)
          .finally(() => {
            refreshRequest = null;
          });
      }

      const accessToken = await refreshRequest;
      setAuthTokens({ accessToken, refreshToken });
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      handleAuthFailure();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
