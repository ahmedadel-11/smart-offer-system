import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useEnclosure } from '../../hooks';

interface CustomEnclosureBuilderProps {
  open: boolean;
  onClose: () => void;
  onSaveEnclosure: (panelItemId?: number) => void;
  panelId: number;
  panelItemId?: number;
  isLoading?: boolean;
}

/**
 * Component for building a custom enclosure from selected components
 * Shows catalog on left, selected components on right
 * Implements live price calculation and validation
 */
export const CustomEnclosureBuilder: React.FC<CustomEnclosureBuilderProps> = ({
  open,
  onClose,
  onSaveEnclosure,
  panelId,
  panelItemId,
  isLoading: externalLoading = false
}) => {
  const {
    state,
    components,
    isLoading,
    error,
    loadComponents,
    addComponent,
    removeComponent,
    updateComponentQty,
    updateComponentUnitPrice,
    updateComponentNotes,
    loadExistingEnclosure,
    validateEnclosure,
    saveEnclosure
  } = useEnclosure({ panelId, panelItemId });

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadComponents();
      if (panelItemId) {
        loadExistingEnclosure(panelItemId);
      }
    }
  }, [open, panelId, panelItemId]);

  // Handle save enclosure
  const handleSaveEnclosure = async () => {
    try {
      const validation = validateEnclosure();
      if (!validation.valid) {
        alert(`Validation errors:\n${validation.errors.join('\n')}`);
        return;
      }

      const saved = await saveEnclosure();
      onSaveEnclosure(saved.panelItemId);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save enclosure';
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleRemoveComponent = (index: number) => {
    if (confirm('Remove this component?')) {
      removeComponent(index);
    }
  };

  const handleClose = () => {
    if (state.isDirty) {
      if (confirm('You have unsaved changes. Discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          minHeight: { xs: '85vh', md: '82vh' },
          display: 'flex'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Build Custom Enclosure
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select components from the catalog sheet and configure quantities.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Full Width: Component Catalog Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Component Catalog - Easy Selection
              </Typography>

              {isLoading || externalLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress />
                </Box>
              ) : components.length === 0 ? (
                <Alert severity="info">No components available</Alert>
              ) : (
                <TableContainer sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: '8%' }}>S.N</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '15%' }}>Reference</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '30%' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '12%' }}>Brand</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '12%', textAlign: 'right' }}>
                          U.Price
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '12%', textAlign: 'right' }}>
                          T.Price
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '11%', textAlign: 'center' }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {components.map((component, idx) => (
                        <TableRow
                          key={component.enclosureComponentId}
                          sx={{
                            '&:hover': { bgcolor: '#f0f0f0' },
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.85em' }}>{idx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 500, fontSize: '0.9em' }}>
                            {component.reference || '-'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.9em' }}>
                            {component.description}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.9em' }}>
                            {component.brand || '-'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontSize: '0.9em', color: '#FF9800', fontWeight: 600 }}>
                            {component.unitPriceList.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontSize: '0.9em', color: '#FF9800', fontWeight: 700 }}>
                            {component.totalPriceList.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => addComponent(component)}
                              disabled={isLoading || externalLoading}
                              title="Add to selection"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          {/* Selected Components Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Selected Components ({state.components.length})
              </Typography>

              {state.components.length === 0 ? (
                <Alert severity="info">
                  Select components from the catalog above to add them here
                </Alert>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: '400px', mb: 2 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '15%' }}>
                            Reference
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '25%' }}>
                            Description
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '12%' }} align="center">
                            Qty
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '15%' }} align="right">
                            Unit Price
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '15%' }} align="right">
                            Total
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '18%' }}>Notes</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: '8%' }} align="center">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {state.components.map((component, index) => (
                          <TableRow key={index}>
                            <TableCell>{component.reference || '-'}</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {component.description}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={component.qty}
                                onChange={(e) =>
                                  updateComponentQty(index, parseInt(e.target.value) || 0)
                                }
                                inputProps={{ min: 1 }}
                                sx={{ width: '50px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                value={component.unitPriceList}
                                onChange={(e) =>
                                  updateComponentUnitPrice(
                                    index,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                inputProps={{ min: 0, step: '0.01' }}
                                sx={{ width: '95px' }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {component.totalPriceList.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                placeholder="Notes..."
                                value={component.notesName || ''}
                                onChange={(e) => updateComponentNotes(index, e.target.value)}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveComponent(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Divider sx={{ my: 2 }} />

                  {/* Total Summary */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#f9f9f9',
                      borderRadius: 1,
                      border: '1px solid #ddd'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Total Components:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {state.components.length} items
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Total Enclosure Price:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#FF9800',
                          fontSize: '1.3em'
                        }}
                      >
                        EGP {state.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: '#f5f5f5',
          p: 2,
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1
        }}
      >
        <Button onClick={handleClose} disabled={isLoading || externalLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveEnclosure}
          variant="contained"
          color="primary"
          disabled={
            state.components.length === 0 || isLoading || externalLoading || !state.isDirty
          }
        >
          {panelItemId ? 'Update Enclosure' : 'Save Enclosure'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomEnclosureBuilder;
