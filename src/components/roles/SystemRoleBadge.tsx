import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { STATUS_BADGE_COLORS } from '../../constants';

interface SystemRoleBadgeProps {
  isSystemRole: boolean;
}

export const SystemRoleBadge: React.FC<SystemRoleBadgeProps> = ({ isSystemRole }) => {
  if (!isSystemRole) return null;

  const systemRoleColor = STATUS_BADGE_COLORS.warning.main;

  return (
    <Tooltip title="System role - cannot be modified or deleted">
      <Chip
        icon={<LockIcon sx={{ fontSize: 14 }} />}
        label="System"
        size="small"
        sx={{
          backgroundColor: `${systemRoleColor}20`,
          color: systemRoleColor,
          fontWeight: 500,
          borderRadius: 1,
          '& .MuiChip-icon': { color: systemRoleColor },
        }}
      />
    </Tooltip>
  );
};

export default SystemRoleBadge;
