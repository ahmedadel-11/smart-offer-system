import React, { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TuneIcon from '@mui/icons-material/Tune';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { usePermissions } from '../../hooks/usePermissions';
import {
  useUserPermissionOverrides,
  useSetUserPermissionOverride,
  useRemoveUserPermissionOverride,
} from '../../hooks/useUsers';
import { formatUtcToLocalDateTime } from '../../utils';
import type { PermissionDto, UserDto } from '../../types';

interface UserPermissionOverridesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto | null;
  canManage: boolean;
}

export const UserPermissionOverridesModal: React.FC<UserPermissionOverridesModalProps> = ({
  isOpen,
  onClose,
  user,
  canManage,
}) => {
  const userId = user?.id || '';

  const { data: overrides = [], isLoading: isOverridesLoading } =
    useUserPermissionOverrides(userId);
  const { data: permissions = [] } = usePermissions();

  const setOverrideMutation = useSetUserPermissionOverride();
  const removeOverrideMutation = useRemoveUserPermissionOverride();

  const [selectedPermission, setSelectedPermission] =
    useState<PermissionDto | null>(null);
  const [overrideMode, setOverrideMode] = useState<'allow' | 'deny'>('allow');

  const sortedEffectivePermissions = useMemo(
    () => [...(user?.permissions || [])].sort((a, b) => a.localeCompare(b)),
    [user?.permissions]
  );

  const sortedOverrides = useMemo(
    () => [...overrides].sort((a, b) => a.permissionName.localeCompare(b.permissionName)),
    [overrides]
  );

  const permissionById = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      acc[permission.id] = permission;
      return acc;
    }, {} as Record<string, PermissionDto>);
  }, [permissions]);

  const availablePermissions = useMemo(() => {
    return [...permissions].sort((a, b) => a.name.localeCompare(b.name));
  }, [permissions]);

  const handleSetOverride = async () => {
    if (!user || !selectedPermission) {
      return;
    }

    await setOverrideMutation.mutateAsync({
      id: user.id,
      data: {
        permissionId: selectedPermission.id,
        isGranted: overrideMode === 'allow',
      },
    });

    setSelectedPermission(null);
  };

  const handleResetOverride = async (permissionId: string) => {
    if (!user) {
      return;
    }

    await removeOverrideMutation.mutateAsync({ id: user.id, permissionId });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permission Overrides: ${user?.fullName || ''}`}
      size="md"
      actions={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {!user ? null : (
        <Stack spacing={2}>
          {!canManage && (
            <Alert severity="info">
              You can view overrides, but editing requires Users.ManagePermissionOverrides.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Effective Permissions ({sortedEffectivePermissions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {sortedEffectivePermissions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No effective permissions.
                </Typography>
              ) : (
                sortedEffectivePermissions.map((permission) => (
                  <Chip key={permission} label={permission} size="small" variant="outlined" />
                ))
              )}
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Set Permission Override
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
              <Autocomplete
                sx={{ minWidth: 280, flex: 1 }}
                options={availablePermissions}
                value={selectedPermission}
                onChange={(_event, newValue) => setSelectedPermission(newValue)}
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.category}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Permission"
                    placeholder="Search permission"
                    size="small"
                  />
                )}
                disabled={!canManage || setOverrideMutation.isPending}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>State</InputLabel>
                <Select
                  value={overrideMode}
                  label="State"
                  onChange={(event) => setOverrideMode(event.target.value as 'allow' | 'deny')}
                  disabled={!canManage || setOverrideMutation.isPending}
                >
                  <MenuItem value="allow">Allowed</MenuItem>
                  <MenuItem value="deny">Denied</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="primary"
                icon={<TuneIcon />}
                onClick={handleSetOverride}
                loading={setOverrideMutation.isPending}
                disabled={!canManage || !selectedPermission}
              >
                Apply Override
              </Button>
            </Stack>
          </Paper>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Permission</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isOverridesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Loading overrides...</Typography>
                    </TableCell>
                  </TableRow>
                ) : sortedOverrides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No overrides configured.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedOverrides.map((override) => (
                    <TableRow key={override.permissionId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {override.permissionName ||
                            permissionById[override.permissionId]?.name ||
                            override.permissionId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {override.permissionCategory ||
                            permissionById[override.permissionId]?.category ||
                            '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={override.isGranted ? 'Allowed' : 'Denied'}
                          color={override.isGranted ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatUtcToLocalDateTime(override.assignedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="ghost"
                          icon={<RestartAltIcon />}
                          onClick={() => handleResetOverride(override.permissionId)}
                          loading={removeOverrideMutation.isPending}
                          disabled={!canManage || removeOverrideMutation.isPending}
                        >
                          Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}
    </Modal>
  );
};

export default UserPermissionOverridesModal;
