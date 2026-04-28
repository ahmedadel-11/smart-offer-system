import React from 'react';
import { Chip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { STATUS_BADGE_COLORS } from '../../constants';
import { EntityStatus, EntityStatusLabels, EntityStatusColors } from '../../types';

interface EntityStatusBadgeProps {
  status: EntityStatus;
  size?: 'small' | 'medium';
}

export const EntityStatusBadge: React.FC<EntityStatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const color = EntityStatusColors[status] || STATUS_BADGE_COLORS.neutral.main;
  const label = EntityStatusLabels[status] || 'Unknown';

  return (
    <Chip
      icon={<CircleIcon sx={{ fontSize: '10px !important', color: `${color} !important` }} />}
      label={label}
      size={size}
      sx={{
        backgroundColor: `${color}15`,
        color: color,
        fontWeight: 500,
        borderRadius: 1,
        '& .MuiChip-icon': {
          marginLeft: '8px',
        },
      }}
    />
  );
};

export default EntityStatusBadge;
