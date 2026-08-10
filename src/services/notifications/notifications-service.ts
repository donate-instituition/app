import { api } from '@/services/api';

import type { AppNotification } from './notifications-types';

async function listMine(token: string | null): Promise<AppNotification[]> {
  return api.get<AppNotification[]>('/notifications/me', { token });
}

async function markAsRead(id: string, token: string | null): Promise<AppNotification> {
  return api.post<AppNotification, Record<string, never>>(`/notifications/${id}/read`, {}, { token });
}

async function registerPushToken(
  input: {
    appVersion?: string;
    deviceId?: string;
    platform: 'android' | 'ios' | 'web' | 'unknown';
    token: string;
  },
  token: string | null,
): Promise<{ registered: boolean }> {
  return api.post('/users/me/push-tokens', input, { token });
}

async function unregisterPushToken(
  pushToken: string,
  token: string | null,
): Promise<{ unregistered: boolean }> {
  return api.post('/users/me/push-tokens/remove', { token: pushToken }, { token });
}

export const notificationsService = {
  listMine,
  markAsRead,
  registerPushToken,
  unregisterPushToken,
};
