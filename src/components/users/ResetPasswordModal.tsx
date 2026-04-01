import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { PasswordInput } from '../auth/PasswordInput';
import type { UserDto } from '../../types';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  user: UserDto | null;
  isLoading?: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const password = watch('newPassword');

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const onFormSubmit = (data: ResetPasswordForm) => {
    onSubmit(data.newPassword);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Reset Password for ${user?.fullName || ''}`}
      size="xs"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onFormSubmit)}
            loading={isLoading}
          >
            Reset Password
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="New Password"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
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

        {/* Password Requirements */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Password Requirements:
          </Typography>
          <List dense disablePadding>
            {requirements.map((req) => (
              <ListItem key={req.label} dense disablePadding sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {req.met ? (
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={req.label}
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: req.met ? 'success.main' : 'text.secondary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Modal>
  );
};

export default ResetPasswordModal;
