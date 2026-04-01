import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '../services/auditLogService';
import type { AuditLogFilter } from '../types';

export const useAuditLogs = (filters?: AuditLogFilter, enabled = true) => {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => auditLogService.getAll(filters),
    enabled,
  });
};

export const useAuditLogsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['auditLogs', 'user', userId],
    queryFn: () => auditLogService.getByUser(userId),
    enabled: !!userId,
  });
};
