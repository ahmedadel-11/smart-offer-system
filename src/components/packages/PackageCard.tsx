import React, { useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Button, Card } from '../common';
import { PackageDto } from '../../types';

interface PackageCardProps {
  packageItem: PackageDto;
  onView?: (packageItem: PackageDto) => void;
  onEdit?: (packageItem: PackageDto) => void;
  onDeactivate?: (packageItem: PackageDto) => void;
  onDelete?: (packageItem: PackageDto) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(value);

export const PackageCard: React.FC<PackageCardProps> = ({
  packageItem,
  onView,
  onEdit,
  onDeactivate,
  onDelete,
}) => {
  const itemCount = packageItem.items.length;
  const totalQuantity = useMemo(
    () => packageItem.items.reduce((sum, item) => sum + item.quantity, 0),
    [packageItem.items]
  );
  const estimatedValue = useMemo(
    () =>
      packageItem.items.reduce(
        (sum, item) => sum + item.quantity * (item.materialBasePrice ?? 0),
        0
      ),
    [packageItem.items]
  );

  return (
    <Card
      hoverable
      variant="outlined"
      title={packageItem.packageName}
      subtitle={packageItem.description || 'No description provided'}
      headerAction={
        <Chip
          size="small"
          color={packageItem.isActive ? 'success' : 'default'}
          label={packageItem.isActive ? 'Active' : 'Inactive'}
          variant={packageItem.isActive ? 'filled' : 'outlined'}
          icon={<Inventory2Icon fontSize="small" />}
        />
      }
      actions={
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ px: 2, pb: 2 }}>
          {onView && (
            <Button variant="ghost" size="small" icon={<VisibilityIcon />} onClick={() => onView(packageItem)}>
              View
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="small" icon={<EditIcon />} onClick={() => onEdit(packageItem)}>
              Edit
            </Button>
          )}
          {onDeactivate && packageItem.isActive && (
            <Button
              variant="outline"
              size="small"
              icon={<PauseCircleOutlineIcon />}
              onClick={() => onDeactivate(packageItem)}
            >
              Deactivate
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="small"
              icon={<DeleteOutlineIcon />}
              onClick={() => onDelete(packageItem)}
            >
              Delete
            </Button>
          )}
        </Stack>
      }
      sx={{ borderRadius: 3, overflow: 'hidden' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
          {packageItem.description || 'Reusable material bundle for panels and projects.'}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`${itemCount} items`} variant="outlined" />
          <Chip size="small" label={`${totalQuantity} total qty`} variant="outlined" />
          <Chip size="small" label={formatCurrency(estimatedValue)} variant="outlined" />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1,
            mt: 0.5,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Package ID
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              #{packageItem.packageId}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {packageItem.createdAt ? new Date(packageItem.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Updated
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {packageItem.updatedAt ? new Date(packageItem.updatedAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default PackageCard;