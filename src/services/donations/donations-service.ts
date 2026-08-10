import { api, paginationQuery, type PaginatedResponse, unwrapPaginated } from '@/services/api';

import type {
  CreateDonationRequest,
  CreateDonationResponse,
  CreateStripePaymentIntentRequest,
  CreateStripePaymentIntentResponse,
  ConfirmStripePaymentIntentResponse,
  CancelStripeSubscriptionResponse,
  Donation,
  StripeConfigResponse,
} from './donations-types';

async function listMyDonations(token: string | null): Promise<Donation[]> {
  const response = await api.get<PaginatedResponse<Donation> | Donation[]>(
    '/donations/me',
    { query: paginationQuery({ limit: 50 }), token },
  );
  return unwrapPaginated(response);
}

async function listMyInstitutionDonations(token: string | null): Promise<Donation[]> {
  const response = await api.get<PaginatedResponse<Donation> | Donation[]>(
    '/donations/institution/me',
    { query: paginationQuery({ limit: 50 }), token },
  );
  return unwrapPaginated(response);
}

async function getDonationById(id: string, token: string | null): Promise<Donation> {
  return api.get<Donation>(`/donations/${id}`, { token });
}

async function createDonation(
  body: CreateDonationRequest,
  token: string | null,
): Promise<CreateDonationResponse> {
  return api.post<CreateDonationResponse, CreateDonationRequest>('/donations', body, { token });
}

async function createStripePaymentIntent(
  body: CreateStripePaymentIntentRequest,
  token: string | null,
): Promise<CreateStripePaymentIntentResponse> {
  return api.post<CreateStripePaymentIntentResponse, CreateStripePaymentIntentRequest>(
    '/payments/stripe/payment-intents',
    body,
    { token },
  );
}

async function confirmStripePaymentIntent(
  paymentIntentId: string,
  token: string | null,
): Promise<ConfirmStripePaymentIntentResponse> {
  return api.post<ConfirmStripePaymentIntentResponse>(
    `/payments/stripe/payment-intents/${paymentIntentId}/confirm`,
    undefined,
    { token },
  );
}

async function getStripeConfig(): Promise<StripeConfigResponse> {
  return api.get<StripeConfigResponse>('/payments/stripe/config');
}

async function cancelStripeSubscription(
  subscriptionId: string,
  token: string | null,
): Promise<CancelStripeSubscriptionResponse> {
  return api.post<CancelStripeSubscriptionResponse>(
    `/payments/stripe/subscriptions/${subscriptionId}/cancel`,
    undefined,
    { token },
  );
}

export const donationsService = {
  cancelStripeSubscription,
  listMyInstitutionDonations,
  listMyDonations,
  getDonationById,
  createDonation,
  createStripePaymentIntent,
  confirmStripePaymentIntent,
  getStripeConfig,
};
