export type UserRole = 'platform-admin' | 'donor' | 'institution-staff';

export type InstitutionStaffRole = 'staff' | 'admin';

export type UserRoleGrant = {
  name: UserRole;
  grantedAt?: string;
  grantedBy?: {
    source: 'SYSTEM' | 'USER';
    label: string;
    userId?: string;
  };
};

export type NotificationSettings = {
  donations: boolean;
  campaigns: boolean;
  conversations: boolean;
  emailDigestEnabled: boolean;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  profilePhotoUrl?: string;
  roles: UserRoleGrant[];
  preferredRole?: UserRole;
  institutionRole?: InstitutionStaffRole;
  notificationSettings?: NotificationSettings;
  passwordChangeRequired?: boolean;
  termsAccepted?: boolean;
  acceptedTermsVersion?: string;
  termsAcceptedAt?: string;
};

export const defaultNotificationSettings: NotificationSettings = {
  donations: true,
  campaigns: true,
  conversations: true,
  emailDigestEnabled: false,
};

export const roleLabels: Record<UserRole, string> = {
  'platform-admin': 'Admin plataforma',
  donor: 'Usuario padrao',
  'institution-staff': 'Funcionario instituicao',
};

export const roleHomeLabels: Record<UserRole, string> = {
  'platform-admin': 'Dashboard administrativo',
  donor: 'Doar',
  'institution-staff': 'Dashboard instituicao',
};

export function getAvatarSource(user?: SessionUser | null) {
  return user?.profilePhotoUrl ? { uri: user.profilePhotoUrl } : undefined;
}

export function getSessionRoles(user?: SessionUser | null): UserRole[] {
  if (!user) return [];

  const roles: UserRole[] = user.roles?.length ? user.roles.map((role) => role.name) : ['donor'];
  return Array.from(new Set(roles));
}

export function getActiveRole(user?: SessionUser | null, activeRole?: UserRole | null): UserRole {
  const roles = getSessionRoles(user);
  if (activeRole && roles.includes(activeRole)) return activeRole;
  return getPreferredInitialRole(user);
}

export function userCanUseRole(user: SessionUser | null | undefined, role: UserRole) {
  return getSessionRoles(user).includes(role);
}

export function getPreferredInitialRole(user?: SessionUser | null): UserRole {
  const roles = getSessionRoles(user);
  if (user?.preferredRole && roles.includes(user.preferredRole)) return user.preferredRole;
  return getDefaultActiveRole(roles);
}

export function normalizeSessionUser(user: SessionUser): SessionUser {
  const roles = getSessionRoles(user);

  return {
    ...user,
    roles: user.roles?.length
      ? user.roles
      : [{ name: getDefaultActiveRole(roles), grantedBy: { source: 'SYSTEM', label: 'sistema' } }],
  };
}

export function getDefaultActiveRole(roles: UserRole[]): UserRole {
  if (roles.includes('platform-admin')) return 'platform-admin';
  if (roles.includes('institution-staff')) return 'institution-staff';
  return 'donor';
}
