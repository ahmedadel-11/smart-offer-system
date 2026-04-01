import React, { useState, useMemo, useCallback } from 'react';
import { Box, TablePagination, Alert } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Loading } from '../../components/common/Loading/Loading';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { AuditLogFilters } from '../../components/audit/AuditLogFilters';
import { AuditLogTable } from '../../components/audit/AuditLogTable';
import { AuditLogDetail } from '../../components/audit/AuditLogDetail';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useUsers } from '../../hooks/useUsers';
import type { AuditLogDto, AuditLogFilter } from '../../types';

// Known action types and entity types for filter dropdowns
const KNOWN_ACTIONS = [
  'Create', 'Update', 'Delete', 'StatusChange',
  'CollaboratorAdded', 'Duplicate',
  'SystemRoleUpdated', 'PermissionsAssigned', 'SystemRolePermissionsAssigned',
];
const KNOWN_ENTITY_TYPES = ['Project', 'Panel', 'Role'];

export const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilter>({
    pageNumber: 1,
    pageSize: 50,
  });
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

  const { data: users = [] } = useUsers();

  // Backend single-filter limitation: only one filter is applied at a time.
  // Clear other filters when one is selected (priority: userId > action > entityType > dateRange).
  const handleUserChange = useCallback((value: string) => {
    setUserId(value);
    if (value) { setAction(''); setEntityType(''); setStartDate(''); setEndDate(''); }
    setFilters((prev) => ({ ...prev, pageNumber: 1 }));
  }, []);

  const handleActionChange = useCallback((value: string) => {
    setAction(value);
    if (value) { setUserId(''); setEntityType(''); setStartDate(''); setEndDate(''); }
    setFilters((prev) => ({ ...prev, pageNumber: 1 }));
  }, []);

  const handleEntityTypeChange = useCallback((value: string) => {
    setEntityType(value);
    if (value) { setUserId(''); setAction(''); setStartDate(''); setEndDate(''); }
    setFilters((prev) => ({ ...prev, pageNumber: 1 }));
  }, []);

  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
    if (value) { setUserId(''); setAction(''); setEntityType(''); }
    setFilters((prev) => ({ ...prev, pageNumber: 1 }));
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setEndDate(value);
    if (value) { setUserId(''); setAction(''); setEntityType(''); }
    setFilters((prev) => ({ ...prev, pageNumber: 1 }));
  }, []);

  const queryFilters = useMemo(
    (): AuditLogFilter => ({
      ...filters,
      userId: userId || undefined,
      action: action || undefined,
      entityType: entityType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [filters, userId, action, entityType, startDate, endDate]
  );

  const { data: allLogs = [], isLoading, isError } = useAuditLogs(queryFilters);

  // Backend returns a plain array — handle pagination on the frontend
  const totalCount = allLogs.length;
  const pageSize = filters.pageSize || 50;
  const pageNumber = filters.pageNumber || 1;
  const logs = allLogs.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const userOptions = users.map((u: any) => ({ id: u.id, name: u.fullName }));

  const handlePageChange = (_: unknown, page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page + 1 }));
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, pageSize: parseInt(e.target.value, 10), pageNumber: 1 }));
  };

  if (isLoading) return <Loading message="Loading audit logs..." />;

  return (
    <Box>
      <PageHeader
        title="Audit Logs"
        subtitle="View system activity and changes"
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load audit logs. Make sure you have SuperAdmin permissions.
        </Alert>
      )}

      <AuditLogFilters
        userId={userId}
        action={action}
        entityType={entityType}
        startDate={startDate}
        endDate={endDate}
        onUserChange={handleUserChange}
        onActionChange={handleActionChange}
        onEntityTypeChange={handleEntityTypeChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        users={userOptions}
        actions={KNOWN_ACTIONS}
        entityTypes={KNOWN_ENTITY_TYPES}
      />

      {logs.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon sx={{ fontSize: 64 }} />}
          title="No Audit Logs"
          description="No activity logs match the current filters."
        />
      ) : (
        <>
          <AuditLogTable logs={logs} onViewDetail={setSelectedLog} />
          <TablePagination
            component="div"
            count={totalCount}
            page={(filters.pageNumber || 1) - 1}
            rowsPerPage={filters.pageSize || 50}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </>
      )}

      <AuditLogDetail
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </Box>
  );
};

export default AuditLogsPage;
