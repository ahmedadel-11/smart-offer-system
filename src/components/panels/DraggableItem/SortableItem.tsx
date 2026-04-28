import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { PanelItem } from '../../../types';

interface SortableItemProps {
  item: PanelItem;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  item,
  onRemove,
  onQuantityChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.panelItemId}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 1 },
        p: { xs: 1, sm: 1.5 },
        backgroundColor: isDragging ? 'grey.100' : 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: isDragging ? 'primary.main' : 'grey.200',
        boxShadow: isDragging ? 3 : 0,
        cursor: 'grab',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        '&:hover': {
          borderColor: 'grey.400',
          boxShadow: 1,
        },
      }}
    >
      {/* Drag Handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <DragIndicatorIcon />
      </Box>

      {/* Item Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            fontWeight={600}
          >
            {item.itemCode}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.description}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {item.brand}
          {item.ratedCurrent && ` • ${item.ratedCurrent}A`}
          {item.poles && ` • ${item.poles}P`}
        </Typography>
      </Box>

      {/* Quantity Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
          disabled={item.quantity <= 1}
        >
          -
        </IconButton>
        <TextField
          type="number"
          size="small"
          value={item.quantity}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (value > 0) onQuantityChange(value);
          }}
          inputProps={{
            min: 1,
            style: { width: 40, textAlign: 'center', padding: '4px' },
          }}
          sx={{ width: 60 }}
        />
        <IconButton
          size="small"
          onClick={() => onQuantityChange(item.quantity + 1)}
        >
          +
        </IconButton>
      </Box>

      {/* Price */}
      <Typography
        variant="body2"
        fontWeight={600}
        color="primary.main"
        sx={{
          minWidth: { xs: 60, sm: 80 },
          textAlign: 'right',
          fontSize: { xs: '0.7rem', sm: '0.875rem' },
        }}
      >
        {formatPrice(item.totalPrice)}
      </Typography>

      {/* Remove Button */}
      <Tooltip title="Remove item">
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.main',
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SortableItem;
