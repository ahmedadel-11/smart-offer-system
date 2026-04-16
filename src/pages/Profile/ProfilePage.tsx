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
  TextField,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Modal } from '../../components/common/Modal/Modal';
import { Button } from '../../components/common/Button/Button';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { RoleBadge } from '../../components/shared/RoleBadge';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
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

const profileSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters').max(200),
  mobileNumber: z.string().max(20, 'Maximum 20 characters').optional(),
  logoOrWatermark: z.string().optional(),
});

const MAX_LOGO_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read selected image'));
    reader.readAsDataURL(file);
  });
};

type ProfileForm = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, setCurrentUser } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    setError: setProfileError,
    clearErrors: clearProfileErrors,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      logoOrWatermark: '',
    },
  });

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

  const brandingPreviewSx = {
    width: '100%',
    maxWidth: 260,
    height: 96,
    objectFit: 'contain',
    objectPosition: 'left center',
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'grey.50',
    p: 1,
  } as const;

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

  React.useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName,
        mobileNumber: user.mobileNumber || '',
        logoOrWatermark: user.logoOrWatermark || '',
      });
    }
  }, [user, resetProfile]);

  const onSaveProfile = async (data: ProfileForm) => {
    if (!user) {
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedUser = await userService.update(user.id, {
        fullName: data.fullName.trim(),
        email: user.email,
        username: user.username,
        isActive: user.isActive,
        mobileNumber: data.mobileNumber?.trim() || undefined,
        logoOrWatermark: data.logoOrWatermark || undefined,
      });

      setCurrentUser(updatedUser);
      resetProfile({
        fullName: updatedUser.fullName,
        mobileNumber: updatedUser.mobileNumber || '',
        logoOrWatermark: updatedUser.logoOrWatermark || '',
      });
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    if (user) {
      resetProfile({
        fullName: user.fullName,
        mobileNumber: user.mobileNumber || '',
        logoOrWatermark: user.logoOrWatermark || '',
      });
    }
    setIsEditingProfile(false);
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
            {isEditingProfile ? (
              <Controller
                name="fullName"
                control={profileControl}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            ) : (
              <Typography variant="body1">{user.fullName}</Typography>
            )}
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
              Mobile Number
            </Typography>
            {isEditingProfile ? (
              <Controller
                name="mobileNumber"
                control={profileControl}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder="+201234567890"
                    inputProps={{ maxLength: 20 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            ) : (
              <Typography variant="body1">{user.mobileNumber || 'N/A'}</Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Logo / Watermark Image
            </Typography>
            {isEditingProfile ? (
              <Controller
                name="logoOrWatermark"
                control={profileControl}
                render={({ field, fieldState }) => (
                  <Stack spacing={1} sx={{ alignItems: 'flex-start', mt: 0.75 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <MuiButton
                        component="label"
                        variant="outlined"
                        size="small"
                        disabled={isSavingProfile}
                      >
                        Upload Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            event.currentTarget.value = '';

                            if (!file) {
                              return;
                            }

                            if (file.size > MAX_LOGO_FILE_SIZE_BYTES) {
                              setProfileError('logoOrWatermark', {
                                type: 'manual',
                                message: 'Image size must be 2 MB or less',
                              });
                              return;
                            }

                            try {
                              const dataUrl = await fileToDataUrl(file);
                              clearProfileErrors('logoOrWatermark');
                              field.onChange(dataUrl);
                            } catch {
                              setProfileError('logoOrWatermark', {
                                type: 'manual',
                                message: 'Failed to process selected image',
                              });
                            }
                          }}
                        />
                      </MuiButton>

                      {field.value && (
                        <MuiButton
                          variant="text"
                          size="small"
                          color="error"
                          onClick={() => field.onChange('')}
                          disabled={isSavingProfile}
                        >
                          Remove Image
                        </MuiButton>
                      )}
                    </Stack>

                    {field.value ? (
                      <Box
                        component="img"
                        src={field.value}
                        alt="Logo / Watermark Preview"
                        sx={brandingPreviewSx}
                      />
                    ) : (
                      <Box sx={{ ...brandingPreviewSx, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', borderStyle: 'dashed' }}>
                        <Typography variant="body2" color="text.secondary">
                          No image selected
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="caption" color={fieldState.error ? 'error.main' : 'text.secondary'}>
                      {fieldState.error?.message || 'Used in generated offers as logo/watermark (max 2 MB).' }
                    </Typography>
                  </Stack>
                )}
              />
            ) : (
              user.logoOrWatermark ? (
                <Box
                  component="img"
                  src={user.logoOrWatermark}
                  alt="Logo / Watermark"
                  sx={brandingPreviewSx}
                />
              ) : (
                <Typography variant="body1">N/A</Typography>
              )
            )}
            <Typography variant="caption" color="text.secondary">
              This image appears on generated offers.
            </Typography>
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

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {isEditingProfile ? (
            <>
              <MuiButton
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleProfileSubmit(onSaveProfile)}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </MuiButton>
              <MuiButton variant="outlined" onClick={handleCancelProfileEdit} disabled={isSavingProfile}>
                Cancel
              </MuiButton>
            </>
          ) : (
            <MuiButton variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditingProfile(true)}>
              Edit Profile
            </MuiButton>
          )}

          <MuiButton
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => setChangePasswordOpen(true)}
          >
            Change Password
          </MuiButton>
        </Stack>
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
