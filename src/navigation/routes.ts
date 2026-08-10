import type { Href } from 'expo-router';
import type { UserRole } from './session';

export const routes = {
  authAccess: '/access' as Href,
  authLogin: '/login' as Href,
  authRegister: '/register' as Href,
  authForgotPassword: '/forgot-password' as Href,
  authActivateAccount: '/activate-account' as Href,
  authTerms: '/terms' as Href,
  authTermsAccept: '/terms?mode=accept' as Href,
  appDashboard: '/donor/dashboard' as Href,
  donorDashboard: '/donor/dashboard' as Href,
  institutionDashboard: '/institution/dashboard' as Href,
  adminDashboard: '/admin/dashboard' as Href,
  donorCampaigns: '/donor/campaigns' as Href,
  institutionCampaigns: '/institution/campaigns' as Href,
  adminInstitutions: '/admin/institutions' as Href,
  adminAuditDetail: (id: string) => `/admin/audit/${id}` as Href,
  donorDonations: '/donor/donations' as Href,
  institutionDonations: '/institution/donations' as Href,
  institutionCreate: '/institution/create' as Href,
  adminUsers: '/admin/users' as Href,
  donorMessages: '/donor/messages' as Href,
  institutionMessages: '/institution/messages' as Href,
  adminAudit: '/admin/audit' as Href,
  donorProfile: '/donor/profile' as Href,
  institutionProfile: '/institution/profile' as Href,
  adminProfile: '/admin/profile' as Href,
  profileMe: '/profile/me' as Href,
  profileNotifications: '/profile/notifications' as Href,
  profilePrivacy: '/profile/privacy' as Href,
  profileHelp: '/profile/help' as Href,
  profileSettings: '/profile/settings' as Href,
  profileSupports: '/profile/supports' as Href,
  appNotifications: '/notifications' as Href,
  appCampaignDetail: (id: string) => `/campaign/${id}` as Href,
  appDonate: (id: string) => `/campaign/${id}/donate` as Href,
  appDonationDetail: (id: string) => `/donation/${id}` as Href,
  appInstitutionDetail: (id: string) => `/institution/${id}` as Href,
  /** Opens a persisted conversation thread returned by the API. */
  appChat: (conversationId: string) => `/chat/${conversationId}` as Href,
} as const;

export function getHomeRouteForRole(role?: UserRole | null): Href {
  if (role === 'platform-admin') return routes.adminDashboard;
  if (role === 'institution-staff') return routes.institutionDashboard;
  return routes.donorDonations;
}
