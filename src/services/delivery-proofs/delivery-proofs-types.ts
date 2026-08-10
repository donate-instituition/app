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

export type UploadedDeliveryProofAsset = {
  contentType: string;
  fileName: string;
  key: string;
  provider: 'local' | 's3';
  size: number;
  url: string;
};

export type CreateDeliveryProofRequest = {
  campaignId: string;
  contentType?: string;
  description?: string;
  fileName?: string;
  photoUrl: string;
};
