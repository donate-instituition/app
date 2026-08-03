// ─── Types ────────────────────────────────────────────────────────────────────

export type DonationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type Donation = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  institutionName: string;
  amountCents: number;
  amountFormatted: string;
  status: DonationStatus;
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
  paymentMethod?: 'card' | 'pix';
  receiptEmail?: string;
  savePaymentMethod?: boolean;
};

export type StripePaymentSummary = {
  id: string;
  paymentIntentId: string;
  status: string;
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

// ─── Status labels ───────────────────────────────────────────────────────────

export const donationStatusLabels: Record<DonationStatus, string> = {
  pending: 'Pendente',
  processing: 'Em andamento',
  completed: 'Entregue',
  failed: 'Falhou',
  cancelled: 'Cancelada',
};
