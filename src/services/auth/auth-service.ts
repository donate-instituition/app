import type { SessionUser, UserRole } from '@/navigation/session';
import { api } from '@/services/api';

// ─── Login ────────────────────────────────────────────────────────────────────

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

// ─── Register ─────────────────────────────────────────────────────────────────

type RegisterRequest = {
  accountType: 'DONOR' | 'INSTITUTION';
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthDate: string;
  phone: string;
  institutionLegalName?: string;
  institutionDisplayName?: string;
  institutionCnpj?: string;
  institutionEmail?: string;
  institutionPhone?: string;
  institutionDescription?: string;
  institutionWebsite?: string;
};


export type RegisterResponse = {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type RegisterPendingInstitutionResponse = {
  status: 'pending-approval';
  message: string;
  institution: {
    id: string;
    name: string;
    status: string;
  };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

type ForgotPasswordRequest = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
};

type RefreshTokenResponse = {
  token: string;
  accessToken: string;
  user: SessionUser;
};

type UpdateMySettingsRequest = {
  preferredRole: 'PLATFORM_ADMIN' | 'DONOR' | 'INSTITUTION_STAFF';
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {
  login: (body: LoginRequest) => api.post<LoginResponse, LoginRequest>('/auth/login', body),

  register: (body: RegisterRequest) =>
    api.post<RegisterResponse | RegisterPendingInstitutionResponse, RegisterRequest>('/auth/register', body),

  refresh: (refreshToken: string) =>
    api.post<RefreshTokenResponse, { refreshToken: string }>('/auth/refresh', { refreshToken }),

  logout: (accessToken?: string | null, refreshToken?: string | null) =>
    api.post<{ message: string }, { refreshToken?: string | null }>(
      '/auth/logout',
      { refreshToken: refreshToken ?? null },
      { token: accessToken ?? null },
    ),

  updatePreferredRole: (preferredRole: UserRole, accessToken?: string | null) =>
    api.patch<SessionUser, UpdateMySettingsRequest>(
      '/auth/me/settings',
      { preferredRole: toApiRole(preferredRole) },
      { token: accessToken ?? null },
    ),

  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<ForgotPasswordResponse, ForgotPasswordRequest>('/auth/forgot-password', body),
};

function toApiRole(role: UserRole): UpdateMySettingsRequest['preferredRole'] {
  if (role === 'platform-admin') return 'PLATFORM_ADMIN';
  if (role === 'institution-staff') return 'INSTITUTION_STAFF';
  return 'DONOR';
}
