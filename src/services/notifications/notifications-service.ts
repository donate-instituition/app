import { api } from '@/services/api';

import type { AppNotification } from './notifications-types';

async function listMine(token: string | null): Promise<AppNotification[]> {
  return api.get<AppNotification[]>('/notifications/me', { token });
}

async function markAsRead(id: string, token: string | null): Promise<AppNotification> {
  return api.post<AppNotification, Record<string, never>>(`/notifications/${id}/read`, {}, { token });
}

export const notificationsService = {
  listMine,
  markAsRead,
};
