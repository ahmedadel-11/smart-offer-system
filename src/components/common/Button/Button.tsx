import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantMap: Record<string, { variant: 'contained' | 'outlined' | 'text'; color?: 'primary' | 'secondary' | 'error' }> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'contained', color: 'secondary' },
  outline: { variant: 'outlined', color: 'primary' },
  ghost: { variant: 'text', color: 'primary' },
  danger: { variant: 'contained', color: 'error' },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}) => {
  const { variant: muiVariant, color } = variantMap[variant] || variantMap.primary;

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : icon}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
