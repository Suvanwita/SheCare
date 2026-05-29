const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "doctor";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  fullName: string;
  role: "user" | "doctor";
}

interface AuthResponse {
  user: AuthUser;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";

    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // Keep the generic message when the API returns no JSON body.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function login(input: LoginInput) {
  const { user } = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return user;
}

export async function register(input: RegisterInput) {
  const { user } = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return user;
}

export async function logout() {
  await request<void>("/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  const { user } = await request<AuthResponse>("/auth/me");
  return user;
}
