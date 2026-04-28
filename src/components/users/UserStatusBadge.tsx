import React from 'react';
import { Chip } from '@mui/material';
import { STATUS_BADGE_COLORS } from '../../constants';

interface UserStatusBadgeProps {
  isActive: boolean;
  size?: 'small' | 'medium';
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ isActive, size = 'small' }) => {
  const activeColor = STATUS_BADGE_COLORS.success.main;
  const inactiveColor = STATUS_BADGE_COLORS.error.main;

  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size={size}
      sx={{
        backgroundColor: isActive ? `${activeColor}20` : `${inactiveColor}20`,
        color: isActive ? activeColor : inactiveColor,
        fontWeight: 500,
        borderRadius: 1,
      }}
    />
  );
};

export default UserStatusBadge;
