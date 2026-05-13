import type { Href } from 'expo-router';

export const routes = {
  authLogin: '/login' as Href,
  authRegister: '/register' as Href,
  authForgotPassword: '/forgot-password' as Href,
  appDashboard: '/dashboard' as Href,
} as const;

