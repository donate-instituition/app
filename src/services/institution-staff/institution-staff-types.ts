export type InstitutionStaffRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'VOLUNTEER'
  | 'DELIVERY_OPERATOR';

export type InstitutionStaffMembership = {
  id: string;
  institutionId: string;
  userId: string;
  role: InstitutionStaffRole;
  permissions: string[];
  status: string;
  institution?: {
    id: string;
    name: string;
    status: string;
  };
};

export type InstitutionTeamMember = InstitutionStaffMembership & {
  user?: {
    id: string;
    name: string;
    email: string;
    profilePhotoUrl?: string;
    status: string;
    isVerified?: boolean;
    passwordChangeRequired?: boolean;
  };
};

export type InstitutionTeamResponse = {
  canCreateStaff: boolean;
  institution: InstitutionStaffMembership['institution'] | null;
  members: InstitutionTeamMember[];
};

export type CreateInstitutionStaffUserRequest = {
  institutionId: string;
  name: string;
  email: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  password?: string;
  passwordMode: 'manual' | 'generated';
  forcePasswordChange?: boolean;
  role?: InstitutionStaffRole;
};

export type CreateInstitutionStaffUserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    passwordChangeRequired?: boolean;
  };
  membership: InstitutionStaffMembership;
};
