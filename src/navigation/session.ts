export type UserRole = 'platform-admin' | 'donor' | 'institution-staff';

export type InstitutionStaffRole = 'staff' | 'admin';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionRole?: InstitutionStaffRole;
};

export const roleLabels: Record<UserRole, string> = {
  'platform-admin': 'Admin plataforma',
  donor: 'Usuario padrao',
  'institution-staff': 'Funcionario instituicao',
};

export const roleHomeLabels: Record<UserRole, string> = {
  'platform-admin': 'Dashboard administrativo',
  donor: 'Inicio',
  'institution-staff': 'Dashboard instituicao',
};
