import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  Chip,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TuneIcon from '@mui/icons-material/Tune';
import { PanelItem } from '../../../types';

interface ZoneItemProps {
  item: PanelItem;
  onRemove?: () => void;
  onQuantityChange?: (quantity: number) => void;
  onOverrideChange?: (itemId: number, updates: { overrideDiscount?: number; overrideMargin?: number; extraDiscount?: number }) => void;
}

export const ZoneItem: React.FC<ZoneItemProps> = ({
  item,
  onRemove,
  onQuantityChange,
  onOverrideChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 1 },
        p: { xs: 1, sm: 1.5 },
        backgroundColor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        '&:hover': {
          borderColor: 'grey.400',
          boxShadow: 1,
        },
      }}
    >
      {/* Item Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ fontFamily: 'Roboto Mono' }}
          >
            {item.itemCode}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
            }}
          >
            {item.description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            {item.brand}
            {item.ratedCurrent && ` • ${item.ratedCurrent}A`}
            {(item.noOfPoles ?? item.poles) && ` • ${item.noOfPoles ?? item.poles}P`}
          </Typography>
          {item.discount > 0 && (
            <Chip label={`-${item.discount}%`} size="small" color="success" sx={{ height: 18, fontSize: 10 }} />
          )}
          {item.extraDiscount > 0 && (
            <Chip label={`Extra -${item.extraDiscount}%`} size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />
          )}
          {item.margin > 0 && (
            <Chip label={`M ${item.margin}%`} size="small" color="info" sx={{ height: 18, fontSize: 10 }} />
          )}
        </Box>
      </Box>

      {/* Quantity Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {onQuantityChange ? (
          <>
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
          </>
        ) : (
          <Chip label={`x${item.quantity}`} size="small" variant="outlined" />
        )}
      </Box>

      {/* Price Breakdown */}
      <Box sx={{ textAlign: 'right', minWidth: { xs: 80, sm: 120 } }}>
        <Typography
          variant="body2"
          fontWeight={600}
          color="primary.main"
          sx={{ fontFamily: 'Roboto Mono', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
        >
          {formatPrice(item.totalPrice)}
        </Typography>
        {item.unitCost > 0 && item.unitCost !== item.totalPrice && (
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Roboto Mono', display: 'block' }}>
            {formatPrice(item.unitCost)}/ea
          </Typography>
        )}
      </Box>

      {/* Remove Button */}
      {onRemove && (
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
      )}

      {/* Pricing Adjust Toggle */}
      {onOverrideChange && (
        <Tooltip title="Adjust pricing">
          <IconButton size="small" onClick={() => setExpanded(!expanded)} color={expanded ? 'primary' : 'default'}>
            <TuneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>

    {/* Expandable Pricing Override Row */}
    {onOverrideChange && (
      <Collapse in={expanded}>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            px: { xs: 1, sm: 1.5 },
            pb: 1.5,
            pt: 0.5,
            backgroundColor: 'grey.50',
            borderTop: '1px dashed',
            borderColor: 'grey.300',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="Discount %"
            type="number"
            size="small"
            defaultValue={item.discount || 0}
            onBlur={(e) => onOverrideChange(item.panelItemId, { overrideDiscount: parseFloat(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 100, step: 0.5, style: { width: 60 } }}
            sx={{ width: 100 }}
          />
          <TextField
            label="Extra Disc %"
            type="number"
            size="small"
            defaultValue={item.extraDiscount || 0}
            onBlur={(e) => onOverrideChange(item.panelItemId, { extraDiscount: parseFloat(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 100, step: 0.5, style: { width: 60 } }}
            sx={{ width: 110 }}
          />
          <TextField
            label="Margin %"
            type="number"
            size="small"
            defaultValue={item.margin || 0}
            onBlur={(e) => onOverrideChange(item.panelItemId, { overrideMargin: parseFloat(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 100, step: 0.5, style: { width: 60 } }}
            sx={{ width: 100 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Typography variant="caption" color="text.secondary">Base: {formatPrice(item.basePrice)}</Typography>
            <Typography variant="caption" color="text.secondary">Unit Cost: {formatPrice(item.unitCost)}</Typography>
          </Box>
        </Box>
      </Collapse>
    )}
    </>
  );
};

export default ZoneItem;
