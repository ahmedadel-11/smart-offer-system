import React from 'react';
import { Chip } from '@mui/material';

interface UserStatusBadgeProps {
  isActive: boolean;
  size?: 'small' | 'medium';
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ isActive, size = 'small' }) => {
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size={size}
      sx={{
        backgroundColor: isActive ? '#4CAF5020' : '#F4433620',
        color: isActive ? '#4CAF50' : '#F44336',
        fontWeight: 500,
        borderRadius: 1,
      }}
    />
  );
};

export default UserStatusBadge;
