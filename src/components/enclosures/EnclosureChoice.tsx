import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid
} from '@mui/material';
import { EnclosureMode } from '../../types';

interface EnclosureChoiceProps {
  open: boolean;
  onClose: () => void;
  onSelectMode: (mode: EnclosureMode) => void;
  isLoading?: boolean;
}

/**
 * Modal dialog for users to choose between Ready Enclosure and Custom Enclosure
 * Step 1 in the enclosure workflow
 */
export const EnclosureChoice: React.FC<EnclosureChoiceProps> = ({
  open,
  onClose,
  onSelectMode,
  isLoading = false
}) => {
  const handleReadyEnclosure = () => {
    onSelectMode('ready');
  };

  const handleCustomEnclosure = () => {
    onSelectMode('custom');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>
        Select Enclosure Type
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Choose how you want to add an enclosure to this panel:
        </Typography>

        <Grid container spacing={2}>
          {/* Ready Enclosure Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                '&:hover': {
                  boxShadow: 3,
                  borderColor: '#2196F3'
                }
              }}
              onClick={handleReadyEnclosure}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Ready Enclosure
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Select from predefined enclosures in the material catalog. Quick and
                  simple.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={handleReadyEnclosure}
                  disabled={isLoading}
                >
                  Choose
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Custom Enclosure Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                '&:hover': {
                  boxShadow: 3,
                  borderColor: '#FF9800'
                }
              }}
              onClick={handleCustomEnclosure}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Custom Enclosure
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Build an enclosure from components with quantities and custom notes.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="warning"
                  onClick={handleCustomEnclosure}
                  disabled={isLoading}
                >
                  Build
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#f5f5f5', p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnclosureChoice;
