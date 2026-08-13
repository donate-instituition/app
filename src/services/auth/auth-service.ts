import type { NotificationSettings, SessionUser, UserRole } from '@/navigation/session';
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

export type RegisterPendingVerificationResponse = {
  status: 'pending-verification';
  message: string;
  email: string;
};

// ─── Google Sign-In ───────────────────────────────────────────────────────────

type GoogleLoginRequest = {
  idToken: string;
};

export type GoogleLoginResponse = {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type GoogleNeedsOnboardingResponse = {
  status: 'needs-onboarding';
  onboardingToken: string;
  name: string;
  email: string;
};

type CompleteGoogleOnboardingRequest = {
  onboardingToken: string;
  accountType: 'DONOR' | 'INSTITUTION';
  cpf: string;
  birthDate: string;
  phone: string;
  password?: string;
  institutionLegalName?: string;
  institutionDisplayName?: string;
  institutionCnpj?: string;
  institutionEmail?: string;
  institutionPhone?: string;
  institutionDescription?: string;
  institutionWebsite?: string;
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

type ForgotPasswordRequest = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
};

type ConfirmForgotPasswordRequest = {
  email: string;
  code: string;
};

type ConfirmForgotPasswordResponse = {
  message: string;
};

type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

type ChangePasswordResponse = {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

type ActivateAccountRequest = {
  token: string;
};

type ActivateAccountResponse = {
  email: string;
  message: string;
  status: 'active';
};

type ResendActivationRequest = {
  email: string;
};

type ResendActivationResponse = {
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

type UpdateNotificationSettingsRequest = {
  notifications: Partial<NotificationSettings>;
};

type UpdateProfilePhotoRequest = {
  profilePhotoUrl: string;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {
  login: (body: LoginRequest) => api.post<LoginResponse, LoginRequest>('/auth/login', body),

  register: (body: RegisterRequest) =>
    api.post<
      RegisterResponse | RegisterPendingInstitutionResponse | RegisterPendingVerificationResponse,
      RegisterRequest
    >('/auth/register', body),

  refresh: (refreshToken: string) =>
    api.post<RefreshTokenResponse, { refreshToken: string }>('/auth/refresh', { refreshToken }),

  loginWithGoogle: (body: GoogleLoginRequest) =>
    api.post<GoogleLoginResponse | GoogleNeedsOnboardingResponse, GoogleLoginRequest>(
      '/auth/google',
      body,
    ),

  completeGoogleOnboarding: (body: CompleteGoogleOnboardingRequest) =>
    api.post<
      GoogleLoginResponse | RegisterPendingInstitutionResponse,
      CompleteGoogleOnboardingRequest
    >('/auth/google/onboarding', body),

  activateAccount: (body: ActivateAccountRequest) =>
    api.post<ActivateAccountResponse, ActivateAccountRequest>('/auth/activate-account', body),

  resendActivation: (body: ResendActivationRequest) =>
    api.post<ResendActivationResponse, ResendActivationRequest>('/auth/resend-activation', body),

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

  updateNotificationSettings: (
    notifications: Partial<NotificationSettings>,
    accessToken?: string | null,
  ) =>
    api.patch<SessionUser, UpdateNotificationSettingsRequest>(
      '/auth/me/settings',
      { notifications },
      { token: accessToken ?? null },
    ),

  updateProfilePhoto: (userId: string, profilePhotoUrl: string, accessToken?: string | null) =>
    api.patch<{ profilePhotoUrl?: string }, UpdateProfilePhotoRequest>(
      `/users/${userId}`,
      { profilePhotoUrl },
      { token: accessToken ?? null },
    ),

  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<ForgotPasswordResponse, ForgotPasswordRequest>('/auth/forgot-password', body),

  confirmForgotPassword: (body: ConfirmForgotPasswordRequest) =>
    api.post<ConfirmForgotPasswordResponse, ConfirmForgotPasswordRequest>(
      '/auth/forgot-password/confirm',
      body,
    ),

  changePassword: (body: ChangePasswordRequest, accessToken?: string | null) =>
    api.patch<ChangePasswordResponse, ChangePasswordRequest>(
      '/auth/me/password',
      body,
      { token: accessToken ?? null },
    ),
};

function toApiRole(role: UserRole): UpdateMySettingsRequest['preferredRole'] {
  if (role === 'platform-admin') return 'PLATFORM_ADMIN';
  if (role === 'institution-staff') return 'INSTITUTION_STAFF';
  return 'DONOR';
}
