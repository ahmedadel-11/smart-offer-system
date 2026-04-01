import React, { useEffect } from 'react';
import { Box, TextField, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { PermissionSelector } from './PermissionSelector';
import type { RoleDto, PermissionDto } from '../../types';

const roleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  permissionIds: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => void;
  role?: RoleDto | null;
  permissions: PermissionDto[];
  isLoading?: boolean;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  role,
  permissions,
  isLoading = false,
}) => {
  const isEdit = !!role;
  const isSystemRole = isEdit && role?.isSystemRole;

  const { control, handleSubmit, reset, setValue, watch } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  });

  const selectedPermissionIds = watch('permissionIds');

  useEffect(() => {
    if (role) {
      // Map permission names to IDs
      const permIds = permissions
        .filter((p) => role.permissions.includes(p.name))
        .map((p) => p.id);
      reset({
        name: role.name,
        description: role.description || '',
        permissionIds: permIds,
      });
    } else {
      reset({ name: '', description: '', permissionIds: [] });
    }
  }, [role, permissions, reset]);

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? (isSystemRole ? `View / Edit Role: ${role?.name}` : 'Edit Role') : 'Create Role'}
      size="md"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onFormSubmit} loading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {isSystemRole && (
          <Alert severity="info" icon={<LockIcon />} sx={{ borderRadius: 1 }}>
            This is a system role. You can edit the description and permissions, but the role name cannot be changed.
          </Alert>
        )}

        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Role Name"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
              disabled={isSystemRole}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              multiline
              rows={2}
            />
          )}
        />

        <PermissionSelector
          permissions={permissions}
          selectedIds={selectedPermissionIds}
          onChange={(ids) => setValue('permissionIds', ids)}
        />
      </Box>
    </Modal>
  );
};

export default RoleForm;
