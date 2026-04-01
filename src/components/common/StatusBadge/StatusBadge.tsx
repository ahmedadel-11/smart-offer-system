import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: string;
  colorMap?: Record<string, string>;
}

const defaultColorMap: Record<string, string> = {
  Draft: '#9E9E9E',
  InProgress: '#2196F3',
  Review: '#FF9800',
  Completed: '#4CAF50',
  Cancelled: '#F44336',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  colorMap = defaultColorMap,
  ...props
}) => {
  const color = colorMap[status] || '#9E9E9E';

  return (
    <Chip
      label={status.replace(/([A-Z])/g, ' $1').trim()}
      size="small"
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 500,
        borderRadius: 1,
      }}
      {...props}
    />
  );
};

export default StatusBadge;
