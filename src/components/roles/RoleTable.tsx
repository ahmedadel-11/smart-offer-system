import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import type { RoleDto, UserDto } from '../../types';
import { STATUS_BADGE_COLORS } from '../../constants';
import { SystemRoleBadge } from './SystemRoleBadge';
import { ActionMenu } from '../common/ActionMenu/ActionMenu';
import type { MenuAction } from '../common/ActionMenu/ActionMenu';

// Role name color mapping per spec
const ROLE_COLORS: Record<string, string> = {
  SuperAdmin: 'secondary.dark',
  TenderingManager: 'primary.main',
  TenderingEngineer: 'success.dark',
};

interface RoleTableProps {
  roles: RoleDto[];
  users?: UserDto[];
  onEdit: (role: RoleDto) => void;
  onManagePermissions: (role: RoleDto) => void;
  onDelete: (role: RoleDto) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  users = [],
  onEdit,
  onManagePermissions,
  onDelete,
}) => {
  // Count users per role name
  const getUserCount = (roleName: string): number => {
    return users.filter((u) => u.roles.includes(roleName)).length;
  };

  const getActions = (role: RoleDto): MenuAction[] => {
    const actions: MenuAction[] = [
      {
        label: role.isSystemRole ? 'Edit System Role' : 'Edit Role',
        icon: <EditIcon fontSize="small" />,
        onClick: () => onEdit(role),
      },
      {
        label: 'Manage Permissions',
        icon: <SecurityIcon fontSize="small" />,
        onClick: () => onManagePermissions(role),
      },
      {
        label: 'Delete',
        icon: <DeleteIcon fontSize="small" />,
        onClick: () => onDelete(role),
        color: 'error' as const,
        divider: true,
        disabled: role.isSystemRole,
      },
    ];
    return actions;
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Role Name</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Description</TableCell>
            <TableCell align="center">Permissions</TableCell>
            <TableCell align="center">Users</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">No roles found</Typography>
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: ROLE_COLORS[role.name] || STATUS_BADGE_COLORS.neutral.main }}
                    >
                      {role.name}
                    </Typography>
                    <SystemRoleBadge isSystemRole={role.isSystemRole} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {role.description || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={role.permissions.length}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={`${getUserCount(role.name)} user(s) assigned to this role`}>
                    <Chip
                      icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                      label={getUserCount(role.name)}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <ActionMenu actions={getActions(role)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoleTable;
