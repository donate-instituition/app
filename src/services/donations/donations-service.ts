import { api } from '@/services/api';

import type {
  CreateDonationRequest,
  CreateDonationResponse,
  CreateStripePaymentIntentRequest,
  CreateStripePaymentIntentResponse,
  ConfirmStripePaymentIntentResponse,
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

export const donationsService = {
  listMyDonations,
  createDonation,
  createStripePaymentIntent,
  confirmStripePaymentIntent,
};
