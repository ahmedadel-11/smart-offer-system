import React, { useState } from 'react';
import { Box, Typography, Chip, Paper, Button, IconButton, TextField, Tooltip, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  packageGroups?: PackageGroupView[];
  color: string;
  description: string;
  onRemove?: (itemId: number) => void;
  onQuantityChange?: (itemId: number, quantity: number) => void;
  onPackageItemQuantityChange?: (itemId: number, quantity: number) => void;
  onPackageQuantityChange?: (packageInstanceId: string, quantity: number) => void;
  onPackageRemove?: (packageInstanceId: string) => void;
  onAddItems?: () => void;
  addButtonLabel?: string;
  emptyStateLabel?: string;
  onOverrideChange?: (itemId: number, updates: { overrideDiscount?: number; overrideMargin?: number; extraDiscount?: number }) => void;
  renderItem?: (item: PanelItem) => React.ReactNode;
}

export interface PackageGroupView {
  packageInstanceId: string;
  packageId: number;
  packageName: string;
  quantity: number;
  items: PanelItem[];
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
  packageGroups = [],
  color,
  description,
  onRemove,
  onQuantityChange,
  onPackageItemQuantityChange,
  onPackageQuantityChange,
  onPackageRemove,
  onAddItems,
  addButtonLabel = 'Add Items',
  emptyStateLabel = 'Click to add items',
  onOverrideChange,
  renderItem,
}) => {
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  const togglePackage = (packageInstanceId: string) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [packageInstanceId]: prev[packageInstanceId] === false,
    }));
  };

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
            label={items.length + packageGroups.length}
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
              {addButtonLabel}
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
        {items.length === 0 && packageGroups.length === 0 ? (
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
            {onAddItems ? emptyStateLabel : 'No items'}
          </Box>
        ) : (
          <>
            {packageGroups.map((group) => {
              const isExpanded = expandedPackages[group.packageInstanceId] !== false;

              return (
              <Paper
                key={group.packageInstanceId}
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  borderColor: color,
                  backgroundColor: `${color}08`,
                }}
              >
                <Box
                  onClick={() => togglePackage(group.packageInstanceId)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {group.packageName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.items.length} item{group.items.length === 1 ? '' : 's'} in package
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePackage(group.packageInstanceId);
                      }}
                    >
                      {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                    {onPackageQuantityChange ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPackageQuantityChange(group.packageInstanceId, Math.max(1, group.quantity - 1));
                          }}
                          disabled={group.quantity <= 1}
                        >
                          -
                        </IconButton>
                        <TextField
                          type="number"
                          size="small"
                          value={group.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (value > 0) {
                              onPackageQuantityChange(group.packageInstanceId, value);
                            }
                          }}
                          inputProps={{
                            min: 1,
                            style: { width: 44, textAlign: 'center', padding: '4px' },
                          }}
                          sx={{ width: 64 }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPackageQuantityChange(group.packageInstanceId, group.quantity + 1);
                          }}
                        >
                          +
                        </IconButton>
                      </>
                    ) : (
                      <Chip label={`x${group.quantity}`} size="small" variant="outlined" />
                    )}
                    {onPackageRemove && (
                      <Tooltip title="Remove package">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPackageRemove(group.packageInstanceId);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 1, pl: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {group.items.map((item) => (
                      <ZoneItem
                        key={item.panelItemId}
                        item={item}
                        onQuantityChange={onPackageItemQuantityChange ? (qty) => onPackageItemQuantityChange(item.panelItemId, qty) : undefined}
                        onOverrideChange={onOverrideChange}
                      />
                    ))}
                  </Box>
                </Collapse>
              </Paper>
              );
            })}

            {items.map((item) => (
              <React.Fragment key={item.panelItemId}>
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <ZoneItem
                    item={item}
                    onRemove={onRemove ? () => onRemove(item.panelItemId) : undefined}
                    onQuantityChange={onQuantityChange ? (qty) => onQuantityChange(item.panelItemId, qty) : undefined}
                    onOverrideChange={onOverrideChange}
                  />
                )}
              </React.Fragment>
            ))}
          </>
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
