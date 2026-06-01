import api from "../lib/api";

export type AuthRole = "user" | "doctor" | "admin";

export interface AuthUser {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  role: AuthRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
  role: AuthRole;
}

export interface AuthData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const register = async (payload: RegisterPayload) => {
  const response = await api.post<ApiResponse<AuthData>>("/auth/register", payload);
  return response.data.data;
};

export const login = async (payload: LoginPayload) => {
  const response = await api.post<ApiResponse<AuthData>>("/auth/login", payload);
  return response.data.data;
};

export const logout = async (refreshToken?: string | null) => {
  await api.post<ApiResponse<undefined>>("/auth/logout", { refreshToken });
};

export const getMe = async () => {
  const response = await api.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
  return response.data.data.user;
};

export const refreshToken = async (refreshTokenValue?: string | null) => {
  const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", {
    refreshToken: refreshTokenValue,
  });

  return response.data.data.accessToken;
};
