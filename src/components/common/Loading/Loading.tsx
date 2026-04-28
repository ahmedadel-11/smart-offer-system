import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56,
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={fullScreen ? { height: '100vh' } : { py: 4 }}
    >
      <CircularProgress size={sizeMap[size]} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay) {
    return (
      <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: 'common.white' }}>
        {content}
      </Backdrop>
    );
  }

  return content;
};

export default Loading;
