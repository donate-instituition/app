// ─── Types ────────────────────────────────────────────────────────────────────

export type DonationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type Donation = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  institutionName: string;
  amountCents: number;
  amountFormatted: string;
  donationKind?: 'single' | 'monthly';
  netAmountCents?: number;
  netAmountFormatted?: string;
  paymentId?: string;
  receiptId?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  serviceFeeAmount?: number;
  serviceFeeBps?: number;
  serviceFeeFormatted?: string;
  status: DonationStatus;
  subscriptionCanceledAt?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  createdAt: string; // ISO date string
};

export type CreateDonationRequest = {
  campaignId: string;
  amountCents: number;
};

export type CreateDonationResponse = {
  donation: Donation;
};

export type CreateStripePaymentIntentRequest = {
  amountCents: number;
  campaignId: string;
  donationKind?: 'single' | 'monthly';
  paymentMethod?: 'card' | 'pix';
  receiptEmail?: string;
  savePaymentMethod?: boolean;
};

export type StripePaymentSummary = {
  id: string;
  paymentIntentId: string;
  serviceFeeAmount?: number;
  serviceFeeBps?: number;
  status: string;
  subscriptionId?: string;
};

export type CreateStripePaymentIntentResponse = {
  clientSecret: string;
  donation: Donation;
  payment: StripePaymentSummary;
};

export type ConfirmStripePaymentIntentResponse = {
  donation: Donation;
  payment: StripePaymentSummary;
};

export type StripeConfigResponse = {
  currency: string;
  serviceFeeBps: number;
};

export type CancelStripeSubscriptionResponse = {
  canceled: boolean;
  status: string;
  subscriptionId: string;
};

// ─── Status labels ───────────────────────────────────────────────────────────

export const donationStatusLabels: Record<DonationStatus, string> = {
  pending: 'Pendente',
  processing: 'Em andamento',
  completed: 'Entregue',
  failed: 'Falhou',
  cancelled: 'Cancelada',
};
