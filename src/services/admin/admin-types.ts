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
