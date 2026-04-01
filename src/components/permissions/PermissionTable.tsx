import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { PermissionDto } from '../../types';
import { CategoryBadge } from '../shared/CategoryBadge';
import { ActionMenu } from '../common/ActionMenu/ActionMenu';
import type { MenuAction } from '../common/ActionMenu/ActionMenu';

interface PermissionTableProps {
  permissions: PermissionDto[];
  onEdit: (permission: PermissionDto) => void;
  onDelete: (permission: PermissionDto) => void;
}

export const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(permissions.map((p) => p.category))).sort();

  const filtered = permissions.filter((perm) => {
    const matchesSearch =
      !search ||
      perm.name.toLowerCase().includes(search.toLowerCase()) ||
      (perm.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || perm.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getActions = (perm: PermissionDto): MenuAction[] => [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: () => onEdit(perm) },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: () => onDelete(perm),
      color: 'error' as const,
      divider: true,
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems={{ sm: 'center' }}>
        <TextField
          size="small"
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Permission Name</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No permissions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((perm) => (
                <TableRow key={perm.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {perm.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" color="text.secondary">
                      {perm.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={perm.category} />
                  </TableCell>
                  <TableCell align="right">
                    <ActionMenu actions={getActions(perm)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PermissionTable;
