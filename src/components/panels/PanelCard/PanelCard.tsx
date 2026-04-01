import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import GroupIcon from '@mui/icons-material/Group';
import { ActionMenu, MenuAction } from '../../common';
import { EntityStatusBadge } from '../../shared';
import { Panel, PanelSummary } from '../../../types';

interface PanelCardProps {
  panel: Panel;
  summary?: PanelSummary;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onManageCollaborators?: () => void;
}

export const PanelCard: React.FC<PanelCardProps> = ({
  panel,
  summary,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  onManageCollaborators,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const actions: MenuAction[] = [
    ...(onEdit ? [{ label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: onEdit }] : []),
    ...(onDuplicate
      ? [{ label: 'Duplicate', icon: <FileCopyIcon fontSize="small" />, onClick: onDuplicate }]
      : []),
    ...(onManageCollaborators
      ? [{ label: 'Collaborators', icon: <GroupIcon fontSize="small" />, onClick: onManageCollaborators }]
      : []),
    ...(onDelete
      ? [
          {
            label: 'Delete',
            icon: <DeleteIcon fontSize="small" />,
            onClick: onDelete,
            color: 'error' as const,
            divider: true,
          },
        ]
      : []),
  ];

  const isComplete = summary && summary.totalItems > 0;

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: { xs: 1.5, sm: 2 },
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 2,
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        backgroundColor: isSelected ? 'primary.light' : 'white',
        transition: 'all 0.2s',
        '&:hover': onClick
          ? {
              boxShadow: 2,
              borderColor: 'primary.light',
            }
          : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: isComplete ? 'success.light' : 'grey.100',
              color: isComplete ? 'success.main' : 'grey.500',
              display: 'flex',
            }}
          >
            {isComplete ? <CheckCircleIcon /> : <ViewInArIcon />}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {panel.panelName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Margin: {panel.margin}%
            </Typography>
          </Box>
        </Box>
        {actions.length > 0 && <ActionMenu actions={actions} />}
      </Box>

      {/* Status Badge */}
      {panel.status != null && (
        <Box sx={{ mt: 1.5 }}>
          <EntityStatusBadge status={panel.status} />
        </Box>
      )}

      {summary && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, alignItems: 'center' }}>
          <Chip
            label={`${summary.totalItems} Items`}
            size="small"
            variant="outlined"
          />
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {formatPrice(summary.totalPrice)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PanelCard;
