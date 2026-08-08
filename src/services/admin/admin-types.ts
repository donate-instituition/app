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

export type AuditLog = {
  id: string;
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export type AdminDashboardStats = {
  pendingInstitutions: number;
  activeCampaigns: number;
  activeUsers30d: number;
  actionsToday: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type QueryUsersParams = {
  role?: AdminUserRole;
  search?: string;
  page?: number;
  limit?: number;
};

export type QueryAuditLogsParams = {
  category?: 'all' | 'login' | 'institutions' | 'users';
  search?: string;
  page?: number;
  limit?: number;
};
