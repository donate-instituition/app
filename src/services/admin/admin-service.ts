import { api } from '@/services/api';

import type { AdminUser, AuditLog } from './admin-types';

async function listUsers(token: string | null): Promise<AdminUser[]> {
  return api.get<AdminUser[]>('/users', { token });
}

async function listAuditLogs(token: string | null): Promise<AuditLog[]> {
  return api.get<AuditLog[]>('/audit-logs', { token });
}

export const adminService = {
  listUsers,
  listAuditLogs,
};
