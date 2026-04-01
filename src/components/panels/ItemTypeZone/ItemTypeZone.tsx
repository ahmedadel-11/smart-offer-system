import React from 'react';
import { Box, Typography, Chip, Paper, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ZoneItem } from '../DraggableItem/ZoneItem';
import { PanelItem, PanelItemType, PanelItemTypeColors, PanelItemTypeDescriptions } from '../../../types';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CableIcon from '@mui/icons-material/Cable';

type ZoneType = 'unassigned' | 'incoming' | 'outgoing' | 'enclosure' | 'busbarAndCables';

interface ItemTypeZoneProps {
  id: ZoneType;
  label: string;
  items: PanelItem[];
  color: string;
  description: string;
  onRemove?: (itemId: number) => void;
  onQuantityChange?: (itemId: number, quantity: number) => void;
  onAddItems?: () => void;
  onOverrideChange?: (itemId: number, updates: { overrideDiscount?: number; overrideMargin?: number; extraDiscount?: number }) => void;
}

const zoneIcons: Record<ZoneType, React.ReactNode> = {
  unassigned: <ViewInArIcon />,
  incoming: <InputIcon />,
  outgoing: <OutputIcon />,
  enclosure: <ViewInArIcon />,
  busbarAndCables: <CableIcon />,
};

export const ItemTypeZone: React.FC<ItemTypeZoneProps> = ({
  id,
  label,
  items,
  color,
  description,
  onRemove,
  onQuantityChange,
  onAddItems,
  onOverrideChange,
}) => {
  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        backgroundColor: 'white',
        borderRadius: 2,
        border: '2px solid',
        borderColor: 'grey.300',
        transition: 'all 0.2s ease',
        minHeight: { xs: 120, sm: 200 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Zone Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          pb: 1,
          borderBottom: 2,
          borderColor: color,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color }}>
          {zoneIcons[id]}
          <Typography variant="subtitle1" fontWeight={600}>
            {label}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={items.length}
            size="small"
            sx={{
              backgroundColor: color,
              color: 'white',
              fontWeight: 500,
              minWidth: 28,
            }}
          />
          {onAddItems && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddItems}
              sx={{
                borderColor: color,
                color: color,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: color,
                  backgroundColor: `${color}10`,
                },
              }}
            >
              Add Items
            </Button>
          )}
        </Box>
      </Box>

      {/* Zone Description */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>

      {/* Zone Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minHeight: 60 }}>
        {items.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'text.disabled',
              fontSize: 14,
              gap: 1,
              py: 3,
              border: '1px dashed',
              borderColor: 'grey.300',
              borderRadius: 1,
              cursor: onAddItems ? 'pointer' : 'default',
              '&:hover': onAddItems ? {
                borderColor: color,
                backgroundColor: `${color}05`,
              } : {},
            }}
            onClick={onAddItems}
          >
            <AddIcon sx={{ fontSize: 28, color: 'grey.400' }} />
            {onAddItems ? 'Click to add items' : 'No items'}
          </Box>
        ) : (
          items.map((item) => (
            <ZoneItem
              key={item.panelItemId}
              item={item}
              onRemove={onRemove ? () => onRemove(item.panelItemId) : undefined}
              onQuantityChange={onQuantityChange ? (qty) => onQuantityChange(item.panelItemId, qty) : undefined}
              onOverrideChange={onOverrideChange}
            />
          ))
        )}
      </Box>
    </Paper>
  );
};

// Zone configuration helper
export const getZoneConfig = (type: ZoneType) => {
  const configs: Record<ZoneType, { label: string; color: string; description: string }> = {
    unassigned: {
      label: 'Unassigned',
      color: '#9E9E9E',
      description: 'Items not yet categorized',
    },
    incoming: {
      label: 'Incoming',
      color: PanelItemTypeColors[PanelItemType.Incoming],
      description: PanelItemTypeDescriptions[PanelItemType.Incoming],
    },
    outgoing: {
      label: 'Outgoing',
      color: PanelItemTypeColors[PanelItemType.Outgoing],
      description: PanelItemTypeDescriptions[PanelItemType.Outgoing],
    },
    enclosure: {
      label: 'Enclosure',
      color: PanelItemTypeColors[PanelItemType.Enclosure],
      description: PanelItemTypeDescriptions[PanelItemType.Enclosure],
    },
    busbarAndCables: {
      label: 'Busbar & Cables',
      color: PanelItemTypeColors[PanelItemType.BusbarAndCables],
      description: PanelItemTypeDescriptions[PanelItemType.BusbarAndCables],
    },
  };

  return configs[type];
};

export default ItemTypeZone;
