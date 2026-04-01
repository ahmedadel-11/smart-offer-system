import React from 'react';
import { Chip } from '@mui/material';
import { RoleColors } from '../../types';

interface RoleBadgeProps {
  role: string;
  size?: 'small' | 'medium';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'small' }) => {
  const color = RoleColors[role] || '#607D8B';

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
