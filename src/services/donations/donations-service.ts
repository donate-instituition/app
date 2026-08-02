import { api } from '@/services/api';

import type {
  CreateDonationRequest,
  CreateDonationResponse,
  Donation,
} from './donations-types';

async function listMyDonations(token: string | null): Promise<Donation[]> {
  return api.get<Donation[]>('/donations/me', { token });
}

async function createDonation(
  body: CreateDonationRequest,
  token: string | null,
): Promise<CreateDonationResponse> {
  return api.post<CreateDonationResponse, CreateDonationRequest>('/donations', body, { token });
}

export const donationsService = {
  listMyDonations,
  createDonation,
};
