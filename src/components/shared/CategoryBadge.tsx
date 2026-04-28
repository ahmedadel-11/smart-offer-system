import React from 'react';
import { Chip } from '@mui/material';
import { PermissionCategoryColors } from '../../types';
import { STATUS_BADGE_COLORS } from '../../constants';

interface CategoryBadgeProps {
  category: string;
  size?: 'small' | 'medium';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'small' }) => {
  const color = PermissionCategoryColors[category] || STATUS_BADGE_COLORS.neutral.main;

  return (
    <Chip
      label={category}
      size={size}
      sx={{
        backgroundColor: `${color}20`,
        color,
        fontWeight: 500,
        borderRadius: 1,
      }}
    />
  );
};

export default CategoryBadge;
