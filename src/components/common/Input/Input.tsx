import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const inputProps = icon
    ? {
        [iconPosition === 'left' ? 'startAdornment' : 'endAdornment']: (
          <InputAdornment position={iconPosition === 'left' ? 'start' : 'end'}>
            {icon}
          </InputAdornment>
        ),
      }
    : {};

  return (
    <TextField
      variant="outlined"
      fullWidth
      InputProps={inputProps}
      {...props}
    />
  );
};

export default Input;
