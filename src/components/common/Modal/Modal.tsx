import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  fullWidth?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'sm',
  closeOnClickOutside = true,
  showCloseButton = true,
  fullWidth = true,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={closeOnClickOutside ? onClose : undefined}
      maxWidth={size}
      fullWidth={fullWidth}
      sx={{
        '& .MuiDialog-paper': {
          mx: { xs: 1, sm: 3 },
          width: { xs: 'calc(100% - 16px)', sm: undefined },
          maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 64px)' },
        },
      }}
    >
      {title && (
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="span">
              {title}
            </Typography>
            {showCloseButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                size="small"
                sx={{ ml: 2 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

export default Modal;
