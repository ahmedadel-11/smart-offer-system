import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Autocomplete,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { PasswordInput } from '../auth/PasswordInput';
import type { UserDto, RoleDto } from '../../types';

const createUserSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters').max(200),
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'At least 3 characters').max(100)
    .regex(/^[a-zA-Z0-9._]+$/, 'Only alphanumeric, dots, and underscores'),
  password: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
  isActive: z.boolean(),
  roleIds: z.array(z.string()),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const editUserSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters').max(200),
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'At least 3 characters').max(100)
    .regex(/^[a-zA-Z0-9._]+$/, 'Only alphanumeric, dots, and underscores'),
  isActive: z.boolean(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserForm | EditUserForm) => void;
  user?: UserDto | null;
  roles: RoleDto[];
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles,
  isLoading = false,
}) => {
  const isEdit = !!user;

  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      isActive: true,
      roleIds: [],
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      isActive: true,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (isEdit ? editForm : createForm) as any;

  useEffect(() => {
    if (user && isEdit) {
      editForm.reset({
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
      });
    } else {
      createForm.reset({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        roleIds: [],
      });
    }
  }, [user, isEdit, editForm, createForm]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = form.handleSubmit((data: any) => {
    onSubmit(data);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Create User'}
      size="sm"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Controller
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Full Name"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Username"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
            />
          )}
        />

        {!isEdit && (
          <>
            <Controller
              name="password"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <PasswordInput
                  {...field}
                  label="Password"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || 'Min 8 chars, uppercase, lowercase, number, special char'}
                  required
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <PasswordInput
                  {...field}
                  label="Confirm Password"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="roleIds"
              control={createForm.control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={roles}
                  getOptionLabel={(option) => option.name}
                  value={roles.filter((r) => field.value.includes(r.id))}
                  onChange={(_, newValue) => {
                    field.onChange(newValue.map((r) => r.id));
                  }}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option.name}
                        size="small"
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Roles" placeholder="Select roles" />
                  )}
                />
              )}
            />
          </>
        )}

        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  color="success"
                />
              }
              label={field.value ? 'Active' : 'Inactive'}
            />
          )}
        />
      </Box>
    </Modal>
  );
};

export default UserForm;
