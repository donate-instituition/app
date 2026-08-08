import { api } from '@/services/api';

import type {
  AdminDashboardStats,
  AdminUser,
  AuditLog,
  PaginatedResponse,
  QueryAuditLogsParams,
  QueryUsersParams,
} from './admin-types';

async function getDashboardStats(
  token: string | null,
): Promise<AdminDashboardStats> {
  return api.get<AdminDashboardStats>('/admin/dashboard', { token });
}

async function listUsers(
  token: string | null,
  params?: QueryUsersParams,
): Promise<PaginatedResponse<AdminUser>> {
  const queryString = params
    ? '?' +
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')
    : '';
  return api.get<PaginatedResponse<AdminUser>>(`/users${queryString}`, { token });
}

async function listAuditLogs(
  token: string | null,
  params?: QueryAuditLogsParams,
): Promise<PaginatedResponse<AuditLog>> {
  const queryString = params
    ? '?' +
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')
    : '';
  return api.get<PaginatedResponse<AuditLog>>(`/audit-logs${queryString}`, { token });
}

export const adminService = {
  getDashboardStats,
  listUsers,
  listAuditLogs,
};
