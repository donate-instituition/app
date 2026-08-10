import type { FeedPost } from '@/services/posts';
import type { PaginatedResponse } from '@/services/api';

export type AdminUserRole = 'PLATFORM_ADMIN' | 'DONOR' | 'INSTITUTION_STAFF';

export type AdminUserRoleGrant = {
  name: AdminUserRole;
  grantedAt?: string;
  grantedBy?: {
    source: 'SYSTEM' | 'USER';
    label: string;
    userId?: string;
  };
};

export type AdminUser = {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  roles: AdminUserRoleGrant[];
  type: string;
  status: string;
  isVerified: boolean;
  createdAt?: string;
};

export type AdminUserDetailDonation = {
  id: string;
  amountCents: number;
  amountFormatted: string;
  campaignId?: string;
  campaignTitle: string;
  institutionName: string;
  status: string;
  createdAt?: string;
};

export type AdminUsersPageSummary = {
  donorsCount: number;
  institutionStaffCount: number;
  platformAdminsCount: number;
};

export type AdminUsersPage = PaginatedResponse<AdminUser> & {
  summary?: AdminUsersPageSummary;
};

export type AdminUserDetail = {
  user: AdminUser;
  donations: AdminUserDetailDonation[];
  posts: FeedPost[];
  auditLogs: AuditLog[];
  stats: {
    auditLogsCount: number;
    donationsCount: number;
    postsCount: number;
    totalDonatedCents: number;
  };
};

export type AuditLog = {
  id: string;
  actorUserId?: string;
  action: string;
  ip?: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  createdAt?: string;
};

export type AuditLogCategory = 'all' | 'institutions' | 'login' | 'users';

export type AuditLogsPage = PaginatedResponse<AuditLog> & {
  summary?: {
    todayCount: number;
  };
};
