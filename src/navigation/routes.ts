import type { Href } from 'expo-router';

export const routes = {
  authLogin: '/login' as Href,
  authRegister: '/register' as Href,
  authForgotPassword: '/forgot-password' as Href,
  appDashboard: '/dashboard' as Href,
  appCampaignDetail: (id: string) => `/campaign/${id}` as Href,
  appInstitutionDetail: (id: string) => `/institution/${id}` as Href,
} as const;

