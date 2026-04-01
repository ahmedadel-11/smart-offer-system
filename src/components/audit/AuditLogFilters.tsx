import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';

interface AuditLogFiltersProps {
  userId: string;
  action: string;
  entityType: string;
  startDate: string;
  endDate: string;
  onUserChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onEntityTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  users: { id: string; name: string }[];
  actions: string[];
  entityTypes: string[];
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  userId,
  action,
  entityType,
  startDate,
  endDate,
  onUserChange,
  onActionChange,
  onEntityTypeChange,
  onStartDateChange,
  onEndDateChange,
  users,
  actions,
  entityTypes,
}) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ mb: 3 }}
      flexWrap="wrap"
      useFlexGap
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>User</InputLabel>
        <Select value={userId} label="User" onChange={(e) => onUserChange(e.target.value)}>
          <MenuItem value="">All Users</MenuItem>
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Action</InputLabel>
        <Select value={action} label="Action" onChange={(e) => onActionChange(e.target.value)}>
          <MenuItem value="">All Actions</MenuItem>
          {actions.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Entity Type</InputLabel>
        <Select
          value={entityType}
          label="Entity Type"
          onChange={(e) => onEntityTypeChange(e.target.value)}
        >
          <MenuItem value="">All Entities</MenuItem>
          {entityTypes.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        type="date"
        label="Start Date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />

      <TextField
        size="small"
        type="date"
        label="End Date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />
    </Stack>
  );
};

export default AuditLogFilters;
