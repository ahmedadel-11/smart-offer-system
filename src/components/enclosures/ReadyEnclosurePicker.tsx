import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TablePagination,
  Typography
} from '@mui/material';
import { Material } from '../../types';
import { materialService } from '../../services';

const ENCLOSURE_CATEGORY = 'Enclosure'; // Standard category for ready enclosures

interface ReadyEnclosurePickerProps {
  open: boolean;
  onClose: () => void;
  onSelectEnclosure: (material: Material) => void;
  isLoading?: boolean;
}

/**
 * Component for selecting a ready enclosure from the material catalog
 * Part of the Ready Enclosure flow
 */
export const ReadyEnclosurePicker: React.FC<ReadyEnclosurePickerProps> = ({
  open,
  onClose,
  onSelectEnclosure,
  isLoading: externalLoading = false
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Load enclosure materials by category
  useEffect(() => {
    if (open) {
      loadEnclosures();
    }
  }, [open]);

  const loadEnclosures = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch materials by enclosure category
      const response = await materialService.getByCategory(ENCLOSURE_CATEGORY);
      const activeMaterials = response.filter((m) => m.isActive);
      setMaterials(activeMaterials);
      setFilteredMaterials(activeMaterials);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load enclosures';
      setError(errorMsg);
      console.error('Error loading enclosures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter materials based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = materials.filter(
      (material) =>
        material.description.toLowerCase().includes(term) ||
        material.itemCode.toLowerCase().includes(term) ||
        material.brand.toLowerCase().includes(term) ||
        (material.reference && material.reference.toLowerCase().includes(term))
    );
    setFilteredMaterials(filtered);
    setPage(0); // Reset to first page on search
  }, [searchTerm, materials]);

  const handleSelectMaterial = (material: Material) => {
    setSelectedMaterial(material);
  };

  const handleConfirm = () => {
    if (selectedMaterial) {
      onSelectEnclosure(selectedMaterial);
      setSelectedMaterial(null);
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    setSelectedMaterial(null);
    setSearchTerm('');
    onClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedMaterials = filteredMaterials.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          minHeight: { xs: '80vh', md: '78vh' },
          display: 'flex'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Select Ready Enclosure
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse and select from pre-configured enclosures.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          placeholder="Search by description, code, brand, or reference..."
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading || externalLoading}
          sx={{ mb: 2 }}
        />

        {isLoading || externalLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredMaterials.length === 0 ? (
          <Alert severity="info">
            {materials.length === 0
              ? 'No enclosures available in the catalog'
              : 'No enclosures match your search'}
          </Alert>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: '6%' }}>S.N</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '12%' }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '30%' }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '15%' }}>Brand</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '12%' }} align="right">
                      Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '12%' }} align="center">
                      Select
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMaterials.map((material, idx) => (
                    <TableRow
                      key={material.materialId}
                      sx={{
                        bgcolor:
                          selectedMaterial?.materialId === material.materialId
                            ? '#e3f2fd'
                            : 'inherit',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectMaterial(material)}
                    >
                      <TableCell sx={{ fontSize: '0.85em' }}>
                        {(page * rowsPerPage) + idx + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.9em', fontWeight: 500 }}>
                        {material.reference || '-'}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <div style={{ fontWeight: 500 }}>{material.description}</div>
                          <div style={{ fontSize: '0.85em', color: '#999' }}>
                            Code: {material.itemCode}
                          </div>
                        </Box>
                      </TableCell>
                      <TableCell>{material.brand}</TableCell>
                      <TableCell align="right" sx={{ color: '#FF9800', fontWeight: 600 }}>
                        {material.basePrice.toFixed(2)} EGP
                      </TableCell>
                      <TableCell align="center">
                        <input
                          type="radio"
                          checked={selectedMaterial?.materialId === material.materialId}
                          onChange={() => handleSelectMaterial(material)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredMaterials.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {selectedMaterial && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f0f7ff',
                  border: '1px solid #2196F3',
                  borderRadius: 1,
                  mt: 2
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  Selected Enclosure:
                </div>
                <div>{selectedMaterial.description}</div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Price: {selectedMaterial.basePrice.toFixed(2)} EGP
                </div>
              </Box>
            )}
          </>
        )}

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
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!selectedMaterial || isLoading || externalLoading}
        >
          Add to Panel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReadyEnclosurePicker;
