import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

interface SystemRoleBadgeProps {
  isSystemRole: boolean;
}

export const SystemRoleBadge: React.FC<SystemRoleBadgeProps> = ({ isSystemRole }) => {
  if (!isSystemRole) return null;

  return (
    <Tooltip title="System role - cannot be modified or deleted">
      <Chip
        icon={<LockIcon sx={{ fontSize: 14 }} />}
        label="System"
        size="small"
        sx={{
          backgroundColor: '#FF980020',
          color: '#FF9800',
          fontWeight: 500,
          borderRadius: 1,
          '& .MuiChip-icon': { color: '#FF9800' },
        }}
      />
    </Tooltip>
  );
};

export default SystemRoleBadge;
