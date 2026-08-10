import { api, paginationQuery, type PaginatedResponse, unwrapPaginated, type PaginationParams } from '@/services/api';

import type {
  AdminUser,
  AdminUserDetail,
  AdminUsersPage,
  AuditLog,
  AuditLogCategory,
  AuditLogsPage,
} from './admin-types';

type AuditLogsParams = PaginationParams & {
  category?: AuditLogCategory;
};

async function listUsersPage(
  token: string | null,
  params: PaginationParams = {},
): Promise<AdminUsersPage> {
  return api.get<AdminUsersPage>(
    '/users',
    { query: paginationQuery({ limit: 30, ...params }), token },
  );
}

async function listUsers(token: string | null): Promise<AdminUser[]> {
  const response = await listUsersPage(token, { limit: 50 });
  return unwrapPaginated(response);
}

async function listAuditLogs(token: string | null): Promise<AuditLog[]> {
  const response = await api.get<PaginatedResponse<AuditLog> | AuditLog[]>(
    '/audit-logs',
    { query: paginationQuery({ limit: 100 }), token },
  );
  return unwrapPaginated(response);
}

async function listAuditLogsPage(
  token: string | null,
  params: AuditLogsParams = {},
): Promise<AuditLogsPage> {
  return api.get<AuditLogsPage>(
    '/audit-logs',
    {
      query: {
        ...paginationQuery({ limit: 30, ...params }),
        category: params.category,
      },
      token,
    },
  );
}

async function getUserDetail(id: string, token: string | null): Promise<AdminUserDetail> {
  return api.get<AdminUserDetail>(`/users/${id}/details`, { token });
}

async function getAuditLog(id: string, token: string | null): Promise<AuditLog> {
  return api.get<AuditLog>(`/audit-logs/${id}`, { token });
}

export const adminService = {
  getAuditLog,
  getUserDetail,
  listUsers,
  listUsersPage,
  listAuditLogs,
  listAuditLogsPage,
};
