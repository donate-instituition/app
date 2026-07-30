import type { Href } from 'expo-router';

export const routes = {
  authLogin: '/login' as Href,
  authRegister: '/register' as Href,
  authForgotPassword: '/forgot-password' as Href,
  appDashboard: '/dashboard' as Href,
  appCampaignDetail: (id: string) => `/campaign/${id}` as Href,
  appDonate: (id: string) => `/campaign/${id}/donate` as Href,
  appInstitutionDetail: (id: string) => `/institution/${id}` as Href,
  /** Opens (or creates) the conversation thread with a given institution.
   *  @param conversationId  follows the "conv-{institutionId}" convention */
  appChat: (conversationId: string) => `/chat/${conversationId}` as Href,
} as const;


