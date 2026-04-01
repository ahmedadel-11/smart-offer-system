import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Grid,
  Chip,
  Stack,
  Button as MuiButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Modal } from '../../components/common/Modal/Modal';
import { Button } from '../../components/common/Button/Button';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
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

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { control, handleSubmit, watch, reset } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains number', met: /[0-9]/.test(newPassword) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onChangePassword = async (data: ChangePasswordForm) => {
    setIsChangingPassword(true);
    setPasswordError(null);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      setChangePasswordOpen(false);
      reset();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setPasswordError(
        axiosError.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCloseChangePassword = () => {
    setChangePasswordOpen(false);
    setPasswordError(null);
    reset();
  };

  if (!user) return null;

  return (
    <Box>
      <PageHeader title="My Profile" subtitle="View your account information" />

      <Paper sx={{ p: { xs: 2, sm: 4 }, mb: 3, maxWidth: 700 }}>
        {/* Profile header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3,
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              fontWeight: 600,
            }}
          >
            {getInitials(user.fullName)}
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" fontWeight={600}>
              {user.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ mt: 1 }}
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
            >
              {user.roles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* User details */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Full Name
            </Typography>
            <Typography variant="body1">{user.fullName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{user.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Username
            </Typography>
            <Typography variant="body1">{user.username}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Box>
              <Chip
                label={user.isActive ? 'Active' : 'Inactive'}
                size="small"
                color={user.isActive ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Member Since
            </Typography>
            <Typography variant="body1">
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Last Login
            </Typography>
            <Typography variant="body1">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <MuiButton
          variant="outlined"
          startIcon={<LockIcon />}
          onClick={() => setChangePasswordOpen(true)}
        >
          Change Password
        </MuiButton>
      </Paper>

      {/* Change Password Modal */}
      <Modal
        isOpen={changePasswordOpen}
        onClose={handleCloseChangePassword}
        title="Change Password"
        size="xs"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="ghost" onClick={handleCloseChangePassword} disabled={isChangingPassword}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onChangePassword)}
              loading={isChangingPassword}
            >
              Change Password
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {passwordError && (
            <Alert severity="error" onClose={() => setPasswordError(null)}>
              {passwordError}
            </Alert>
          )}

          <Controller
            name="currentPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordInput
                {...field}
                label="Current Password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />

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
                label="Confirm New Password"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />

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
    </Box>
  );
};

export default ProfilePage;
