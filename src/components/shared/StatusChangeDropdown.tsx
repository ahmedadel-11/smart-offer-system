import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { EntityStatus, EntityStatusLabels, EntityStatusColors } from '../../types';

interface StatusChangeDropdownProps {
  currentStatus: EntityStatus;
  onStatusChange: (newStatus: EntityStatus) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium';
  label?: string;
}

export const StatusChangeDropdown: React.FC<StatusChangeDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  loading = false,
  size = 'small',
  label = 'Status',
}) => {
  const handleChange = (event: { target: { value: unknown } }) => {
    const value = event.target.value as EntityStatus;
    if (value !== currentStatus) {
      onStatusChange(value);
    }
  };

  return (
    <FormControl size={size} sx={{ minWidth: 160 }} disabled={disabled || loading}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={currentStatus}
        label={label}
        onChange={handleChange}
        renderValue={(value) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircleIcon
              sx={{ fontSize: 12, color: EntityStatusColors[value as EntityStatus] }}
            />
            <Typography variant="body2">
              {EntityStatusLabels[value as EntityStatus]}
            </Typography>
          </Box>
        )}
      >
        {Object.values(EntityStatus)
          .filter((v) => typeof v === 'number')
          .map((status) => (
            <MenuItem key={status} value={status}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon
                  sx={{ fontSize: 12, color: EntityStatusColors[status as EntityStatus] }}
                />
                <Typography variant="body2">
                  {EntityStatusLabels[status as EntityStatus]}
                </Typography>
              </Box>
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default StatusChangeDropdown;
