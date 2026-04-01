import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { UserDto } from '../../types';
import { UserStatusBadge } from './UserStatusBadge';
import { RoleBadge } from '../shared/RoleBadge';
import { ActionMenu } from '../common/ActionMenu/ActionMenu';
import type { MenuAction } from '../common/ActionMenu/ActionMenu';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockResetIcon from '@mui/icons-material/LockReset';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import DeleteIcon from '@mui/icons-material/Delete';

interface UserTableProps {
  users: UserDto[];
  onEdit: (user: UserDto) => void;
  onAssignRoles: (user: UserDto) => void;
  onResetPassword: (user: UserDto) => void;
  onToggleStatus: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onAssignRoles,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Collect all unique roles
  const allRoles = Array.from(new Set(users.flatMap((u) => u.roles))).sort();

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    const matchesRole =
      roleFilter === 'all' || user.roles.includes(roleFilter);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getActions = (user: UserDto): MenuAction[] => [
    { label: 'Edit User', icon: <EditIcon fontSize="small" />, onClick: () => onEdit(user) },
    { label: 'Assign Roles', icon: <PersonAddIcon fontSize="small" />, onClick: () => onAssignRoles(user) },
    { label: 'Reset Password', icon: <LockResetIcon fontSize="small" />, onClick: () => onResetPassword(user), color: 'primary' as const },
    {
      label: user.isActive ? 'Deactivate' : 'Activate',
      icon: user.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />,
      onClick: () => onToggleStatus(user),
      divider: true,
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: () => onDelete(user),
      color: 'error' as const,
      divider: true,
    },
  ];

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box>
      {/* Filters */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ sm: 'center' }}
      >
        <TextField
          size="small"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            {allRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Username</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                        }}
                      >
                        {getInitials(user.fullName)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {user.fullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" color="text.secondary">
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {user.roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge isActive={user.isActive} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    <Tooltip
                      title={
                        user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString()
                          : 'Never'
                      }
                    >
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <ActionMenu actions={getActions(user)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserTable;
