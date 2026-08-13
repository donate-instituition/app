import { api } from '@/services/api';

import type { ConfirmedUpload, ConfirmUploadRequest, CreatedUpload, CreateUploadRequest } from './uploads-types';

function detectImageContentType(base64: string): string | undefined {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  return undefined;
}

async function createUpload(input: CreateUploadRequest, token: string | null): Promise<CreatedUpload> {
  const contentType = detectImageContentType(input.base64) ?? input.contentType;
  return api.post<CreatedUpload>('/uploads', { ...input, contentType }, { token });
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
