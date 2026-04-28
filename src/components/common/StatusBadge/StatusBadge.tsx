import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { STATUS_BADGE_COLORS } from '../../../constants';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: string;
  colorMap?: Record<string, string>;
}

const defaultColorMap: Record<string, string> = {
  Draft: STATUS_BADGE_COLORS.neutral.main,
  InProgress: STATUS_BADGE_COLORS.info.main,
  Review: STATUS_BADGE_COLORS.warning.main,
  Completed: STATUS_BADGE_COLORS.success.main,
  Cancelled: STATUS_BADGE_COLORS.error.main,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  colorMap = defaultColorMap,
  ...props
}) => {
  const color = colorMap[status] || STATUS_BADGE_COLORS.neutral.main;

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
