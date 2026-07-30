import type { SessionUser } from '@/navigation/session';
import { api } from '@/services/api';

// ─── Login ────────────────────────────────────────────────────────────────────

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: SessionUser;
};

// ─── Register ─────────────────────────────────────────────────────────────────

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};


type RegisterResponse = {
  token: string;
  user: SessionUser;
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

type ForgotPasswordRequest = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {
  login: (body: LoginRequest) => api.post<LoginResponse, LoginRequest>('/auth/login', body),

  register: (body: RegisterRequest) =>
    api.post<RegisterResponse, RegisterRequest>('/auth/register', body),

  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<ForgotPasswordResponse, ForgotPasswordRequest>('/auth/forgot-password', body),
};
