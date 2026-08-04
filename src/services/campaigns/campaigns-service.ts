import { api } from '@/services/api';

import type {
  Campaign,
  CampaignCategory,
  CampaignDetail,
  CampaignFilters,
  GeoLocation,
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

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceInKm(from: GeoLocation, to: GeoLocation) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const originLatitude = toRadians(from.latitude);
  const destinationLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function sortByDistance<TItem extends { location?: GeoLocation }>(items: TItem[], nearMe?: GeoLocation) {
  if (!nearMe) {
    return items;
  }

  return [...items].sort((a, b) => {
    if (!a.location && !b.location) return 0;
    if (!a.location) return 1;
    if (!b.location) return -1;

    return distanceInKm(nearMe, a.location) - distanceInKm(nearMe, b.location);
  });
}

function filterCampaigns(campaigns: Campaign[], filters: CampaignFilters = {}) {
  const { search = '', category = 'Todos', nearMe } = filters;

  const filtered = campaigns.filter((campaign) => {
    const matchesCategory =
      category === 'Todos' || (campaign.category as CampaignCategory | 'Todos') === category;
    const matchesSearch = matchSearch(
      [campaign.title, campaign.institution, campaign.category],
      search,
    );

    return matchesCategory && matchesSearch;
  });

  return sortByDistance(filtered, nearMe);
}

function filterInstitutions(institutions: Institution[], filters: InstitutionFilters = {}) {
  const { search = '', nearMe } = filters;

  const filtered = institutions.filter((institution) =>
    matchSearch(
      [institution.name, institution.category, institution.city, institution.description],
      search,
    ),
  );

  return sortByDistance(filtered, nearMe);
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

async function updateInstitutionRecurringDonations(
  id: string,
  acceptsRecurringDonations: boolean,
  token: string | null,
): Promise<InstitutionDetail> {
  return api.patch<InstitutionDetail>(
    `/institutions/${id}`,
    { acceptsRecurringDonations },
    { token },
  );
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
  updateInstitutionRecurringDonations,
};
