import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { PermissionDto } from '../../types';
import { PermissionCategoryColors } from '../../types';
import { STATUS_BADGE_COLORS } from '../../constants';

interface PermissionSelectorProps {
  permissions: PermissionDto[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  permissions,
  selectedIds,
  onChange,
  disabled = false,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  useEffect(() => {
    setSelected(new Set(selectedIds));
  }, [selectedIds]);

  // Group permissions by category
  const grouped = permissions.reduce<Record<string, PermissionDto[]>>((acc, perm) => {
    const cat = perm.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  const handleToggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
    onChange(Array.from(next));
  };

  const handleSelectAllCategory = (category: string) => {
    const next = new Set(selected);
    const catPerms = grouped[category];
    const allSelected = catPerms.every((p) => next.has(p.id));
    if (allSelected) {
      catPerms.forEach((p) => next.delete(p.id));
    } else {
      catPerms.forEach((p) => next.add(p.id));
    }
    setSelected(next);
    onChange(Array.from(next));
  };

  return (
    <Box>
      {categories.map((category) => {
        const catPerms = grouped[category];
        const selectedCount = catPerms.filter((p) => selected.has(p.id)).length;
        const allSelected = selectedCount === catPerms.length;
        const color = PermissionCategoryColors[category] || STATUS_BADGE_COLORS.neutral.main;

        return (
          <Accordion key={category} variant="outlined" sx={{ mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                <Chip
                  label={category}
                  size="small"
                  sx={{
                    backgroundColor: `${color}20`,
                    color,
                    fontWeight: 500,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedCount}/{catPerms.length}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAllCategory(category);
                  }}
                  disabled={disabled}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5 }}>
                {catPerms.map((perm) => (
                  <FormControlLabel
                    key={perm.id}
                    control={
                      <Checkbox
                        checked={selected.has(perm.id)}
                        onChange={() => handleToggle(perm.id)}
                        disabled={disabled}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{perm.name}</Typography>
                        {perm.description && (
                          <Typography variant="caption" color="text.secondary">
                            {perm.description}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
      {categories.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          No permissions available
        </Typography>
      )}
    </Box>
  );
};

export default PermissionSelector;
