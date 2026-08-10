import { api, paginationQuery, type PaginatedResponse, unwrapPaginated } from '@/services/api';

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
  CreateCampaignInput,
  UploadedCampaignAsset,
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
  const campaigns = await api.get<PaginatedResponse<Campaign> | Campaign[]>('/campaigns', {
    query: paginationQuery({ limit: 50, search: filters.search }),
  });
  return filterCampaigns(unwrapPaginated(campaigns), filters);
}

async function listMyInstitutionCampaigns(
  token: string | null,
  filters: CampaignFilters = {},
): Promise<Campaign[]> {
  const campaigns = await api.get<PaginatedResponse<Campaign> | Campaign[]>('/campaigns/mine', {
    query: paginationQuery({ limit: 50, search: filters.search }),
    token,
  });
  return filterCampaigns(unwrapPaginated(campaigns), filters);
}

async function listInstitutions(filters: InstitutionFilters = {}): Promise<Institution[]> {
  const institutions = await api.get<PaginatedResponse<Institution> | Institution[]>('/institutions', {
    query: paginationQuery({ limit: 50, search: filters.search }),
  });
  return filterInstitutions(unwrapPaginated(institutions), filters);
}

async function getCampaignById(id: string): Promise<CampaignDetail> {
  return api.get<CampaignDetail>(`/campaigns/${id}`);
}

async function getInstitutionById(id: string): Promise<InstitutionDetail> {
  return api.get<InstitutionDetail>(`/institutions/${id}`);
}

async function createMyInstitutionCampaign(
  input: CreateCampaignInput,
  token: string | null,
): Promise<CampaignDetail> {
  return api.post<CampaignDetail>(
    '/campaigns/me',
    {
      ...input,
      acceptedItems: input.tags?.map((tag) => ({
        category: mapTagToAcceptedItemCategory(tag),
        name: tag,
      })),
      donationTypes: ['MONEY'],
      endAt: input.endAt,
      goal: {
        moneyTarget: input.goal.moneyTarget,
      },
      status: input.status ?? 'PUBLISHED',
      tags: input.tags ?? [],
      visibility: 'PUBLIC',
    },
    { token },
  );
}

async function uploadCampaignCover(
  input: {
    base64: string;
    contentType: string;
    filename: string;
  },
  token: string | null,
): Promise<UploadedCampaignAsset> {
  return api.post<UploadedCampaignAsset>('/campaigns/uploads', input, { token });
}

async function listPendingInstitutions(token: string | null): Promise<PendingInstitution[]> {
  const response = await api.get<PaginatedResponse<PendingInstitution> | PendingInstitution[]>(
    '/institutions/admin/pending',
    { query: paginationQuery({ limit: 50 }), token },
  );
  return unwrapPaginated(response);
}

async function listAdminInstitutions(token: string | null): Promise<PendingInstitution[]> {
  const response = await api.get<PaginatedResponse<PendingInstitution> | PendingInstitution[]>(
    '/institutions/admin',
    { query: paginationQuery({ limit: 50 }), token },
  );
  return unwrapPaginated(response);
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

async function verifyInstitutionStripeConnectAccount(
  id: string,
  stripeConnectAccountId: string,
  token: string | null,
): Promise<InstitutionDetail> {
  return api.post<InstitutionDetail, { stripeConnectAccountId: string }>(
    `/institutions/${id}/stripe/connect-account`,
    { stripeConnectAccountId },
    { token },
  );
}

function mapTagToAcceptedItemCategory(tag: string) {
  const normalizedTag = tag
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  if (normalizedTag.includes('aliment')) return 'FOOD';
  if (normalizedTag.includes('saude')) return 'HYGIENE';
  if (normalizedTag.includes('crianca')) return 'TOYS';
  if (normalizedTag.includes('inverno')) return 'CLOTHES';

  return 'OTHER';
}

export const campaignsService = {
  listCampaigns,
  listMyInstitutionCampaigns,
  listInstitutions,
  getCampaignById,
  getInstitutionById,
  createMyInstitutionCampaign,
  uploadCampaignCover,
  listPendingInstitutions,
  listAdminInstitutions,
  approveInstitution,
  rejectInstitution,
  updateInstitutionRecurringDonations,
  verifyInstitutionStripeConnectAccount,
};
