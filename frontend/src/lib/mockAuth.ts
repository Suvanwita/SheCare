const MOCK_AUTH_KEY = "shecare_mock_authenticated";
const MOCK_USER_KEY = "shecare_mock_user";

export interface LoginMockInput {
  email: string;
  password: string;
}

export interface RegisterMockInput extends LoginMockInput {
  fullName: string;
  role: "user" | "doctor";
}

function persistMockSession(user: { email: string; fullName?: string; role?: "user" | "doctor" }) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(MOCK_AUTH_KEY, "true");
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

export function loginMock(input: LoginMockInput): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      persistMockSession({ email: input.email });
      resolve();
    }, 900);
  });
}

export function registerMock(input: RegisterMockInput): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      persistMockSession({
        email: input.email,
        fullName: input.fullName,
        role: input.role,
      });
      resolve();
    }, 900);
  });
}

export function logoutMock() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(MOCK_AUTH_KEY);
  localStorage.removeItem(MOCK_USER_KEY);
}

export function isMockAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(MOCK_AUTH_KEY) === "true";
}
