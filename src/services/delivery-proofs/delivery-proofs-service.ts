import { api } from '@/services/api';

import type {
  CreateDeliveryProofRequest,
  DeliveryProof,
  UploadedDeliveryProofAsset,
} from './delivery-proofs-types';

async function uploadDeliveryProofAsset(
  input: {
    base64: string;
    contentType: string;
    filename: string;
  },
  token: string | null,
): Promise<UploadedDeliveryProofAsset> {
  return api.post<UploadedDeliveryProofAsset>('/delivery-proofs/uploads', input, { token });
}

async function createDeliveryProof(
  input: CreateDeliveryProofRequest,
  token: string | null,
): Promise<DeliveryProof> {
  return api.post<DeliveryProof, CreateDeliveryProofRequest>('/delivery-proofs', input, { token });
}

export const deliveryProofsService = {
  createDeliveryProof,
  uploadDeliveryProofAsset,
};
