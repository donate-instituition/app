import { api } from '@/services/api';

import type { ConfirmedUpload, ConfirmUploadRequest, CreatedUpload, CreateUploadRequest } from './uploads-types';

async function createUpload(input: CreateUploadRequest, token: string | null): Promise<CreatedUpload> {
  return api.post<CreatedUpload>('/uploads', input, { token });
}

async function confirmUpload(
  uploadId: string,
  input: ConfirmUploadRequest,
  token: string | null,
): Promise<ConfirmedUpload> {
  return api.post<ConfirmedUpload>(`/uploads/${uploadId}/confirm`, input, { token });
}

export const uploadsService = {
  confirmUpload,
  createUpload,
};
