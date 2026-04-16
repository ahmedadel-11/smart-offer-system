import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Chip,
  Checkbox,
  Button as MuiButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Material } from '../../../types';

interface MaterialSelectionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  zoneColor: string;
  materials: Material[];
  categories: string[];
  brands: string[];
  onAddMaterials: (selections: { material: Material; quantity: number }[]) => void;
  loading?: boolean;
}

export const MaterialSelectionModal: React.FC<MaterialSelectionModalProps> = ({
  open,
  onClose,
  title,
  zoneColor,
  materials,
  categories,
  brands,
  onAddMaterials,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedRatedCurrent, setSelectedRatedCurrent] = useState('');
  const [selectedIsc, setSelectedIsc] = useState('');
  const [selectedNoOfPoles, setSelectedNoOfPoles] = useState('');
  const [selections, setSelections] = useState<Record<number, number>>({}); // materialId -> quantity

  // Extract unique filter options from materials
  const ratedCurrentOptions = useMemo(() => {
    if (!materials) return [];
    const values = new Set(materials.map((m) => m.ratedCurrent).filter(Boolean) as string[]);
    return Array.from(values).sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [materials]);

  const iscOptions = useMemo(() => {
    if (!materials) return [];
    const values = new Set(materials.map((m) => m.isc).filter(Boolean) as string[]);
    return Array.from(values).sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [materials]);

  const noOfPolesOptions = useMemo(() => {
    if (!materials) return [];
    const values = new Set(materials.map((m) => m.noOfPoles).filter((v) => v != null) as number[]);
    return Array.from(values).sort((a, b) => a - b);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return materials.filter((material) => {
      if (normalizedSearchTerm) {
        const matches =
          (material.itemCode ?? '').toLowerCase().includes(normalizedSearchTerm) ||
          (material.description ?? '').toLowerCase().includes(normalizedSearchTerm) ||
          (material.brand ?? '').toLowerCase().includes(normalizedSearchTerm) ||
          (material.reference ?? '').toLowerCase().includes(normalizedSearchTerm);
        if (!matches) return false;
      }
      if (selectedCategory && material.category !== selectedCategory) return false;
      if (selectedBrand && material.brand !== selectedBrand) return false;
      if (selectedRatedCurrent && material.ratedCurrent !== selectedRatedCurrent) return false;
      if (selectedIsc && material.isc !== selectedIsc) return false;
      if (selectedNoOfPoles && material.noOfPoles !== Number(selectedNoOfPoles)) return false;
      return true;
    });
  }, [materials, searchTerm, selectedCategory, selectedBrand, selectedRatedCurrent, selectedIsc, selectedNoOfPoles]);

  const toggleMaterial = (materialId: number) => {
    setSelections((prev) => {
      if (prev[materialId] !== undefined) {
        const { [materialId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [materialId]: 1 };
    });
  };

  const updateQuantity = (materialId: number, quantity: number) => {
    if (quantity < 1) return;
    setSelections((prev) => ({ ...prev, [materialId]: quantity }));
  };

  const selectedCount = Object.keys(selections).length;

  const handleConfirm = () => {
    const result = Object.entries(selections).map(([id, quantity]) => {
      const material = materials.find((m) => m.materialId === Number(id))!;
      return { material, quantity };
    });
    onAddMaterials(result);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedRatedCurrent('');
    setSelectedIsc('');
    setSelectedNoOfPoles('');
    setSelections({});
    onClose();
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedBrand || selectedRatedCurrent || selectedIsc || selectedNoOfPoles;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedRatedCurrent('');
    setSelectedIsc('');
    setSelectedNoOfPoles('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `3px solid ${zoneColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon sx={{ color: zoneColor }} />
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        {selectedCount > 0 && (
          <Chip
            label={`${selectedCount} selected`}
            sx={{ backgroundColor: zoneColor, color: 'white', fontWeight: 600 }}
          />
        )}
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0, flex: 1, overflow: 'hidden' }}>
        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by code, description, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories?.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Brand</InputLabel>
              <Select
                value={selectedBrand}
                label="Brand"
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <MenuItem value="">All Brands</MenuItem>
                {brands?.map((brand) => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Rated Current</InputLabel>
              <Select
                value={selectedRatedCurrent}
                label="Rated Current"
                onChange={(e) => setSelectedRatedCurrent(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {ratedCurrentOptions.map((val) => (
                  <MenuItem key={val} value={val}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Isc</InputLabel>
              <Select
                value={selectedIsc}
                label="Isc"
                onChange={(e) => setSelectedIsc(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {iscOptions.map((val) => (
                  <MenuItem key={val} value={val}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>No. of Poles</InputLabel>
              <Select
                value={selectedNoOfPoles}
                label="No. of Poles"
                onChange={(e) => setSelectedNoOfPoles(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {noOfPolesOptions.map((val) => (
                  <MenuItem key={val} value={String(val)}>{val}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {hasActiveFilters && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <FilterListIcon fontSize="small" color="primary" />
              {selectedCategory && (
                <Chip label={selectedCategory} size="small" onDelete={() => setSelectedCategory('')} />
              )}
              {selectedBrand && (
                <Chip label={selectedBrand} size="small" onDelete={() => setSelectedBrand('')} />
              )}
              {selectedRatedCurrent && (
                <Chip label={`Current: ${selectedRatedCurrent}`} size="small" onDelete={() => setSelectedRatedCurrent('')} />
              )}
              {selectedIsc && (
                <Chip label={`Isc: ${selectedIsc}`} size="small" onDelete={() => setSelectedIsc('')} />
              )}
              {selectedNoOfPoles && (
                <Chip label={`Poles: ${selectedNoOfPoles}`} size="small" onDelete={() => setSelectedNoOfPoles('')} />
              )}
              <Chip
                label="Clear All"
                size="small"
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ ml: 'auto' }}
              />
            </Box>
          )}
        </Box>

        <Divider />

        {/* Materials List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredMaterials.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography variant="body2">No materials found</Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {filteredMaterials.slice(0, 100).map((material) => {
                const isSelected = selections[material.materialId] !== undefined;
                const quantity = selections[material.materialId] || 1;

                return (
                  <ListItem
                    key={material.materialId}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: isSelected ? `${zoneColor}08` : 'transparent',
                      '&:hover': { backgroundColor: isSelected ? `${zoneColor}12` : 'action.hover' },
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleMaterial(material.materialId)}
                  >
                    <Checkbox
                      checked={isSelected}
                      sx={{
                        color: zoneColor,
                        '&.Mui-checked': { color: zoneColor },
                        mr: 1,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {material.itemCode}
                          </Typography>
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            {new Intl.NumberFormat('en-EG', {
                              style: 'currency',
                              currency: 'EGP',
                            }).format(material.basePrice)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {material.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip label={material.brand} size="small" sx={{ height: 18, fontSize: 10 }} />
                            <Chip label={material.category} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                          </Box>
                        </Box>
                      }
                    />

                    {/* Quantity control (only shown when selected) */}
                    {isSelected && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(material.materialId, quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          type="number"
                          size="small"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val > 0) updateQuantity(material.materialId, val);
                          }}
                          inputProps={{
                            min: 1,
                            style: { width: 40, textAlign: 'center', padding: '4px' },
                          }}
                          sx={{ width: 60 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(material.materialId, quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </ListItem>
                );
              })}
              {filteredMaterials.length > 100 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', py: 1 }}
                >
                  Showing 100 of {filteredMaterials.length} results. Use filters to narrow down.
                </Typography>
              )}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <MuiButton onClick={handleClose} color="inherit">
          Cancel
        </MuiButton>
        <MuiButton
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedCount === 0 || loading}
          sx={{
            backgroundColor: zoneColor,
            '&:hover': { backgroundColor: zoneColor, filter: 'brightness(0.9)' },
          }}
        >
          {loading ? 'Adding...' : `Add ${selectedCount} Material${selectedCount !== 1 ? 's' : ''}`}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialSelectionModal;
