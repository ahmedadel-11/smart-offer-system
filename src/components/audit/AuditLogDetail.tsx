import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { AuditLogDto } from '../../types';

interface AuditLogDetailProps {
  open: boolean;
  onClose: () => void;
  log: AuditLogDto | null;
}

const JsonViewer: React.FC<{ data: string | null; label: string }> = ({ data, label }) => {
  if (!data) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    parsed = data;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box
        sx={{
          backgroundColor: 'grey.50',
          borderRadius: 1,
          p: 1.5,
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: 200,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}
      </Box>
    </Box>
  );
};

export const AuditLogDetail: React.FC<AuditLogDetailProps> = ({ open, onClose, log }) => {
  if (!log) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Audit Log Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Timestamp
            </Typography>
            <Typography variant="body2">
              {new Date(log.timestamp).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              User
            </Typography>
            <Typography variant="body2">{log.userName || 'System'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Action
            </Typography>
            <Box>
              <Chip label={log.action} size="small" color="primary" variant="outlined" />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Entity Type
            </Typography>
            <Typography variant="body2">{log.entityType}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Entity ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {log.entityId || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              IP Address
            </Typography>
            <Typography variant="body2">{log.ipAddress || '—'}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <JsonViewer data={log.oldValues} label="Old Values" />
        <JsonViewer data={log.newValues} label="New Values" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditLogDetail;
