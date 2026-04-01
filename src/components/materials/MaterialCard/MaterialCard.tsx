import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import { Card } from '../../common';
import { Material } from '../../../types';

interface MaterialCardProps {
  material: Material;
  onAddToPanel?: (material: Material, quantity: number) => void;
  showActions?: boolean;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onAddToPanel,
  showActions = true,
  selected = false,
  onClick,
  compact = false,
  onEdit,
  onDelete,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToPanel) {
      onAddToPanel(material, quantity);
      setQuantity(1);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: currency || 'EGP',
    }).format(price);
  };

  return (
    <Card
      onClick={onClick}
      hoverable={!!onClick}
      className={selected ? 'selected' : ''}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', fontSize: 11 }}
            >
              {material.brand}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Roboto Mono' }}>
              {material.itemCode}
            </Typography>
          </Box>
          <Typography
            variant="h6"
            color="primary.main"
            fontWeight={700}
            sx={{ fontFamily: 'Roboto Mono' }}
          >
            {formatPrice(material.basePrice, 'EGP')}
          </Typography>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 1 : 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {material.description}
        </Typography>

        {/* Specs */}
        {!compact && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {material.ratedCurrent && (
              <Chip
                icon={<ElectricBoltIcon />}
                label={`${material.ratedCurrent}A`}
                size="small"
                variant="outlined"
              />
            )}
            {material.isc && (
              <Chip
                label={`Isc: ${material.isc}kA`}
                size="small"
                variant="outlined"
              />
            )}
            {material.noOfPoles && (
              <Chip
                label={`${material.noOfPoles}P`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Category & Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <Chip
            label={material.category}
            size="small"
            sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
          />

          {showActions && onAddToPanel && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                type="number"
                size="small"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                onClick={(e) => e.stopPropagation()}
                inputProps={{ min: 1, style: { width: 50, textAlign: 'center' } }}
                sx={{ width: 70 }}
              />
              <Tooltip title="Add to Panel">
                <IconButton
                  color="primary"
                  onClick={handleAdd}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {showActions && (onEdit || onDelete) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {onEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(material); }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(material); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default MaterialCard;
