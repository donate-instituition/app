import { api } from '@/services/api';

import type {
  CreateInstitutionStaffUserRequest,
  CreateInstitutionStaffUserResponse,
  InstitutionStaffMembership,
  InstitutionTeamResponse,
} from './institution-staff-types';

async function listMyMemberships(token: string | null): Promise<InstitutionStaffMembership[]> {
  return api.get<InstitutionStaffMembership[]>('/institution-staff-memberships/me', { token });
}

async function createStaffUser(
  body: CreateInstitutionStaffUserRequest,
  token: string | null,
): Promise<CreateInstitutionStaffUserResponse> {
  return api.post<CreateInstitutionStaffUserResponse, CreateInstitutionStaffUserRequest>(
    '/institution-staff-memberships/staff-users',
    body,
    { token },
  );
}

async function getMyTeam(token: string | null): Promise<InstitutionTeamResponse> {
  return api.get<InstitutionTeamResponse>('/institution-staff-memberships/team', { token });
}

export const institutionStaffService = {
  createStaffUser,
  getMyTeam,
  listMyMemberships,
};
