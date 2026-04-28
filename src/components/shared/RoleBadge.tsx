import React from 'react';
import { Chip } from '@mui/material';
import { STATUS_BADGE_COLORS } from '../../constants';
import { RoleColors } from '../../types';

interface RoleBadgeProps {
  role: string;
  size?: 'small' | 'medium';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'small' }) => {
  const color = RoleColors[role] || STATUS_BADGE_COLORS.neutral.main;

  return (
    <Chip
      label={role}
      size={size}
      sx={{
        backgroundColor: `${color}20`,
        color,
        fontWeight: 500,
        borderRadius: 1,
        border: `1px solid ${color}40`,
      }}
    />
  );
};

export default RoleBadge;
