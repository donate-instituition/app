import type { Href } from 'expo-router';
import type { UserRole } from './session';

export const routes = {
  authLogin: '/login' as Href,
  authRegister: '/register' as Href,
  authForgotPassword: '/forgot-password' as Href,
  appDashboard: '/donor/dashboard' as Href,
  donorDashboard: '/donor/dashboard' as Href,
  institutionDashboard: '/institution/dashboard' as Href,
  adminDashboard: '/admin/dashboard' as Href,
  donorCampaigns: '/donor/campaigns' as Href,
  institutionCampaigns: '/institution/campaigns' as Href,
  adminInstitutions: '/admin/institutions' as Href,
  donorDonations: '/donor/donations' as Href,
  institutionDonations: '/institution/donations' as Href,
  adminUsers: '/admin/users' as Href,
  donorMessages: '/donor/messages' as Href,
  institutionMessages: '/institution/messages' as Href,
  adminAudit: '/admin/audit' as Href,
  donorProfile: '/donor/profile' as Href,
  institutionProfile: '/institution/profile' as Href,
  adminProfile: '/admin/profile' as Href,
  appCampaignDetail: (id: string) => `/campaign/${id}` as Href,
  appDonate: (id: string) => `/campaign/${id}/donate` as Href,
  appInstitutionDetail: (id: string) => `/institution/${id}` as Href,
  /** Opens (or creates) the conversation thread with a given institution.
   *  @param conversationId  follows the "conv-{institutionId}" convention */
  appChat: (conversationId: string) => `/chat/${conversationId}` as Href,
} as const;

export function getHomeRouteForRole(role?: UserRole | null): Href {
  if (role === 'platform-admin') return routes.adminDashboard;
  if (role === 'institution-staff') return routes.institutionDashboard;
  return routes.donorDashboard;
}
