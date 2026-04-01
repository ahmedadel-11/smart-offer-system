import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { AuditLogDto } from '../../types';

interface AuditLogTableProps {
  logs: AuditLogDto[];
  onViewDetail: (log: AuditLogDto) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onViewDetail }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Action</TableCell>
            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Entity Type</TableCell>
            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Entity ID</TableCell>
            <TableCell align="center">Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">No audit logs found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(log.timestamp).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {log.userName || 'System'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={log.action} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {log.entityType}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {log.entityId || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View details">
                    <IconButton size="small" onClick={() => onViewDetail(log)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuditLogTable;
