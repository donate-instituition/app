import { api } from '@/services/api';

import type { CreateDeliveryProofRequest, DeliveryProof } from './delivery-proofs-types';

async function createDeliveryProof(
  input: CreateDeliveryProofRequest,
  token: string | null,
): Promise<DeliveryProof> {
  return api.post<DeliveryProof, CreateDeliveryProofRequest>('/delivery-proofs', input, { token });
}

export const deliveryProofsService = {
  createDeliveryProof,
};
