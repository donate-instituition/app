import { api } from '@/services/api';

import type {
  Campaign,
  CampaignCategory,
  CampaignDetail,
  CampaignFilters,
  Institution,
  InstitutionDetail,
  InstitutionFilters,
  PendingInstitution,
} from './campaigns-types';

function matchSearch(fields: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field.toLowerCase().includes(q));
}

function filterCampaigns(campaigns: Campaign[], filters: CampaignFilters = {}) {
  const { search = '', category = 'Todos' } = filters;

  return campaigns.filter((campaign) => {
    const matchesCategory =
      category === 'Todos' || (campaign.category as CampaignCategory | 'Todos') === category;
    const matchesSearch = matchSearch(
      [campaign.title, campaign.institution, campaign.category],
      search,
    );

    return matchesCategory && matchesSearch;
  });
}

function filterInstitutions(institutions: Institution[], filters: InstitutionFilters = {}) {
  const { search = '' } = filters;

  return institutions.filter((institution) =>
    matchSearch(
      [institution.name, institution.category, institution.city, institution.description],
      search,
    ),
  );
}

async function listCampaigns(filters: CampaignFilters = {}): Promise<Campaign[]> {
  const campaigns = await api.get<Campaign[]>('/campaigns');
  return filterCampaigns(campaigns, filters);
}

async function listInstitutions(filters: InstitutionFilters = {}): Promise<Institution[]> {
  const institutions = await api.get<Institution[]>('/institutions');
  return filterInstitutions(institutions, filters);
}

async function getCampaignById(id: string): Promise<CampaignDetail> {
  return api.get<CampaignDetail>(`/campaigns/${id}`);
}

async function getInstitutionById(id: string): Promise<InstitutionDetail> {
  return api.get<InstitutionDetail>(`/institutions/${id}`);
}

async function listPendingInstitutions(token: string | null): Promise<PendingInstitution[]> {
  return api.get<PendingInstitution[]>('/institutions/admin/pending', { token });
}

async function listAdminInstitutions(token: string | null): Promise<PendingInstitution[]> {
  return api.get<PendingInstitution[]>('/institutions/admin', { token });
}

async function approveInstitution(id: string, token: string | null): Promise<PendingInstitution> {
  return api.patch<PendingInstitution>(`/institutions/${id}/approve`, undefined, { token });
}

async function rejectInstitution(id: string, token: string | null): Promise<PendingInstitution> {
  return api.patch<PendingInstitution>(`/institutions/${id}/reject`, undefined, { token });
}

export const campaignsService = {
  listCampaigns,
  listInstitutions,
  getCampaignById,
  getInstitutionById,
  listPendingInstitutions,
  listAdminInstitutions,
  approveInstitution,
  rejectInstitution,
};
