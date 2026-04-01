import { apiClient } from './api';
import type { AuditLogDto, AuditLogFilter } from '../types';

const ENDPOINT = '/auditlogs';

export const auditLogService = {
  // Backend returns AuditLogDto[] (plain array)
  async getAll(filters?: AuditLogFilter): Promise<AuditLogDto[]> {
    const response = await apiClient.get<AuditLogDto[]>(ENDPOINT, {
      params: filters,
    });
    // Backend may return a plain array or occasionally a wrapped object
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).items ?? [];
  },

  async getByUser(userId: string): Promise<AuditLogDto[]> {
    const response = await apiClient.get<AuditLogDto[]>(
      `${ENDPOINT}/user/${userId}`
    );
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).items ?? [];
  },
};

export default auditLogService;
