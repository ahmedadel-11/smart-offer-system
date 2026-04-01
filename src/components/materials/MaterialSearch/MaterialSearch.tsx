import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { Button } from '../../common';
import { MaterialSearchFilters } from '../../../types';

interface MaterialSearchProps {
  onSearch: (filters: MaterialSearchFilters) => void;
  categories?: string[];
  brands?: string[];
  showAdvanced?: boolean;
  initialFilters?: MaterialSearchFilters;
}

export const MaterialSearch: React.FC<MaterialSearchProps> = ({
  onSearch,
  categories = [],
  brands = [],
  showAdvanced = true,
  initialFilters = {},
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MaterialSearchFilters>(initialFilters);

  const handleSearch = () => {
    onSearch({ ...filters, searchTerm });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key: keyof MaterialSearchFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({});
    onSearch({});
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search materials by code, description, brand, or reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
        {showAdvanced && (
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={activeFilterCount > 0 ? 'primary' : 'default'}
          >
            <FilterListIcon />
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  height: 20,
                  minWidth: 20,
                }}
              />
            )}
          </IconButton>
        )}
      </Box>

      {showAdvanced && (
        <Collapse in={showFilters}>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category || ''}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={filters.brand || ''}
                    label="Brand"
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                  >
                    <MenuItem value="">All Brands</MenuItem>
                    {brands.map((brand) => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rated Current (A)"
                  type="number"
                  value={filters.ratedCurrent || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'ratedCurrent',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Isc (kA)"
                  type="number"
                  value={filters.isc || ''}
                  onChange={(e) =>
                    handleFilterChange('isc', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear All
              </Button>
              <Button variant="primary" onClick={handleSearch}>
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default MaterialSearch;
