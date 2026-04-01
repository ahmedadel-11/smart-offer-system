import React, { useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { PermissionDto } from '../../types';

const permissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PermissionFormData) => void;
  permission?: PermissionDto | null;
  isLoading?: boolean;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  permission,
  isLoading = false,
}) => {
  const isEdit = !!permission;

  const { control, handleSubmit, reset } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: { name: '', description: '', category: '' },
  });

  useEffect(() => {
    if (permission) {
      reset({
        name: permission.name,
        description: permission.description || '',
        category: permission.category,
      });
    } else {
      reset({ name: '', description: '', category: '' });
    }
  }, [permission, reset]);

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Permission' : 'Create Permission'}
      size="sm"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onFormSubmit} loading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Permission'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Permission Name"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
              placeholder="e.g., Users.Create"
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Category"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
              placeholder="e.g., UserManagement"
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
              placeholder="What does this permission allow?"
            />
          )}
        />
      </Box>
    </Modal>
  );
};

export default PermissionForm;
