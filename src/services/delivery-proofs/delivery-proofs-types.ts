export type DeliveryProof = {
  id: string;
  campaignId?: string;
  donationId?: string;
  photoUrl: string;
  fileName?: string;
  contentType?: string;
  description?: string;
  confirmedByUserId?: string;
  confirmedAt?: string;
  createdAt: string;
};

export type CreateDeliveryProofRequest = {
  campaignId: string;
  contentType?: string;
  description?: string;
  fileName?: string;
  photoUrl: string;
};
