import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  useAvailableCategories,
  useEnclosureCategories,
  useAddEnclosureCategory,
  useRemoveEnclosureCategory,
} from '../../../hooks';
import { useAuth } from '../../../contexts';
import toast from 'react-hot-toast';

export const EnclosureCategoriesControl: React.FC = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('Materials.Edit');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isAddingDisabled, setIsAddingDisabled] = useState(false);

  // Queries
  const {
    data: availableCategories = [],
    isLoading: availableCategoriesLoading,
    error: availableCategoriesError,
  } = useAvailableCategories();

  const {
    data: mappedCategories = [],
    isLoading: mappedCategoriesLoading,
    error: mappedCategoriesError,
  } = useEnclosureCategories();

  // Mutations
  const addMutation = useAddEnclosureCategory();
  const removeMutation = useRemoveEnclosureCategory();

  const handleAdd = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    // Check for duplicates
    if (mappedCategories.some((m) => m.categoryName === selectedCategory)) {
      toast.error('This category is already mapped');
      return;
    }

    setIsAddingDisabled(true);
    try {
      await addMutation.mutateAsync(selectedCategory);
      setSelectedCategory('');
    } finally {
      setIsAddingDisabled(false);
    }
  };

  const handleRemoveClick = (mappingId: number) => {
    setDeleteTarget(mappingId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget !== null) {
      await removeMutation.mutateAsync(deleteTarget);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const isLoading = availableCategoriesLoading || mappedCategoriesLoading;
  const isProcessing = addMutation.isPending || removeMutation.isPending;
  const categoryError = availableCategoriesError || mappedCategoriesError;

  // Filter out already mapped categories
  const unmappedCategories = availableCategories.filter(
    (cat) => !mappedCategories.some((m) => m.categoryName === cat)
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
        }}
      >
        <SettingsIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Enclosure Categories
        </Typography>
      </Box>

      {categoryError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load categories. Please try again.
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: alpha('#f5f5f5', 0.5),
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Add Category to Enclosure Mapping
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1,
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              Select Category
            </Typography>
            <Select
              fullWidth
              size="small"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isLoading || isProcessing || !canEdit || unmappedCategories.length === 0}
              sx={{
                backgroundColor: 'background.paper',
              }}
            >
              <MenuItem value="">
                <em>Choose a category...</em>
              </MenuItem>
              {unmappedCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
            {unmappedCategories.length === 0 && mappedCategories.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1,
                  color: 'text.secondary',
                }}
              >
                All available categories are already mapped.
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1,
                fontWeight: 500,
                color: 'text.secondary',
                height: '20px',
              }}
            >
              &nbsp;
            </Typography>
            <Button
              variant="contained"
              startIcon={isProcessing ? <CircularProgress size={20} /> : <AddIcon />}
              onClick={handleAdd}
              disabled={
                isLoading ||
                isProcessing ||
                !canEdit ||
                !selectedCategory ||
                unmappedCategories.length === 0
              }
              sx={{ whiteSpace: 'nowrap' }}
            >
              Add Category
            </Button>
          </Box>
        </Box>

        {!canEdit && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You do not have permission to manage enclosure categories. (Requires Materials.Edit)
          </Alert>
        )}
      </Paper>

      <Paper
        sx={{
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            p: 2,
            fontWeight: 600,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          Mapped Categories ({mappedCategories.length})
        </Typography>

        {isLoading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : mappedCategories.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No categories mapped yet. Add one to get started.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#000', 0.02) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Mapping ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mappedCategories.map((mapping) => (
                  <TableRow key={mapping.enclosureCategoryMappingId} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {mapping.enclosureCategoryMappingId}
                    </TableCell>
                    <TableCell>{mapping.categoryName}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() =>
                          handleRemoveClick(mapping.enclosureCategoryMappingId)
                        }
                        disabled={!canEdit || isProcessing}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this category from the enclosure mapping? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isProcessing}
          >
            {isProcessing ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
