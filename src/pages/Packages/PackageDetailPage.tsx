import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaidIcon from '@mui/icons-material/Paid';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Button, ConfirmDialog, EmptyState, Loading, PageHeader } from '../../components';
import { useAuth } from '../../contexts';
import { useDeactivatePackage, useDeletePackage, usePackage } from '../../hooks';
import { getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string | null) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const packageId = parseInt(id || '0', 10);
  const { hasPermission } = useAuth();

  const { data: packageData, isLoading, error } = usePackage(packageId);
  const deactivatePackageMutation = useDeactivatePackage();
  const deletePackageMutation = useDeletePackage();

  const canEdit = hasPermission('packages:edit');
  const canDeactivate = hasPermission('packages:deactivate');
  const canDelete = hasPermission('packages:delete');

  const [pendingAction, setPendingAction] = useState<'deactivate' | 'delete' | null>(null);

  const totals = useMemo(() => {
    if (!packageData) {
      return { totalQuantity: 0, estimatedValue: 0 };
    }

    return packageData.items.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.estimatedValue += item.quantity * (item.materialBasePrice ?? 0);
        return acc;
      },
      { totalQuantity: 0, estimatedValue: 0 }
    );
  }, [packageData]);

  if (isLoading) {
    return <Loading fullScreen message="Loading package..." />;
  }

  if (error || !packageData) {
    return (
      <Box sx={{ py: 6 }}>
        <EmptyState
          icon={<Inventory2Icon />}
          title="Package not found"
          description="The package may have been removed or you may not have permission to view it."
          action={{ label: 'Back to Packages', onClick: () => navigate('/packages') }}
        />
      </Box>
    );
  }

  const handleConfirm = async () => {
    if (!pendingAction) return;

    try {
      if (pendingAction === 'deactivate') {
        await deactivatePackageMutation.mutateAsync(packageData.packageId);
        toast.success('Package deactivated successfully');
      } else {
        await deletePackageMutation.mutateAsync(packageData.packageId);
        toast.success('Package deleted successfully');
        navigate('/packages');
      }

      setPendingAction(null);
    } catch (submitError) {
      toast.error(
        getErrorMessage(
          submitError,
          pendingAction === 'deactivate' ? 'Failed to deactivate package' : 'Failed to delete package'
        )
      );
    }
  };

  return (
    <Box>
      <PageHeader
        title={packageData.packageName}
        subtitle={packageData.description || 'Package details'}
        breadcrumbs={[
          { label: 'Packages', path: '/packages' },
          { label: packageData.packageName },
        ]}
        backButton={{ label: 'Back to Packages' }}
        actions={
          <>
            {canEdit && (
              <Button
                variant="outline"
                icon={<EditIcon />}
                onClick={() => navigate(`/packages/${packageData.packageId}/edit`)}
              >
                Edit
              </Button>
            )}
            {canDeactivate && packageData.isActive && (
              <Button
                variant="outline"
                icon={<PauseCircleOutlineIcon />}
                onClick={() => setPendingAction('deactivate')}
                loading={deactivatePackageMutation.isPending}
              >
                Deactivate
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger"
                icon={<DeleteOutlineIcon />}
                onClick={() => setPendingAction('delete')}
                loading={deletePackageMutation.isPending}
              >
                Delete
              </Button>
            )}
          </>
        }
      />

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(156, 39, 176, 0.04) 100%)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Package Status
            </Typography>
            <Chip
              label={packageData.isActive ? 'Active' : 'Inactive'}
              color={packageData.isActive ? 'success' : 'default'}
              variant={packageData.isActive ? 'filled' : 'outlined'}
              sx={{ width: 'fit-content' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
              {packageData.description || 'No description provided for this package.'}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="flex-start">
            <Chip size="small" icon={<InventoryIcon />} label={`${packageData.items.length} items`} />
            <Chip size="small" icon={<Inventory2Icon />} label={`${totals.totalQuantity} total qty`} />
            <Chip size="small" icon={<PaidIcon />} label={formatCurrency(totals.estimatedValue)} />
            <Chip size="small" icon={<CalendarMonthIcon />} label={`Created ${formatDate(packageData.createdAt)}`} />
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Typography variant="caption" color="text.secondary">
              Created By
            </Typography>
            <Typography variant="h6" fontWeight={700} noWrap>
              {packageData.createdByUserId || 'System'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Typography variant="caption" color="text.secondary">
              Updated By
            </Typography>
            <Typography variant="h6" fontWeight={700} noWrap>
              {packageData.updatedByUserId || 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Typography variant="caption" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="h6" fontWeight={700} noWrap>
              {formatDate(packageData.updatedAt)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={700}>
            Items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Materials that make up this reusable package.
          </Typography>
        </Box>

        {packageData.items.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyState
              icon={<Inventory2Icon />}
              title="No items found"
              description="This package does not contain any items yet."
            />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Base Price</TableCell>
                  <TableCell align="right">Line Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {packageData.items.map((item) => {
                  const lineTotal = item.quantity * (item.materialBasePrice ?? 0);

                  return (
                    <TableRow key={item.packageItemId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {item.materialCode || `Material #${item.materialId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.materialDescription || 'No material description available'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {item.materialBasePrice !== null && item.materialBasePrice !== undefined
                          ? formatCurrency(item.materialBasePrice)
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {item.materialBasePrice !== null && item.materialBasePrice !== undefined
                          ? formatCurrency(lineTotal)
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction === 'delete' ? 'Delete Package' : 'Deactivate Package'}
        message={
          pendingAction === 'delete'
            ? `Permanently delete ${packageData.packageName}? This cannot be undone.`
            : `Deactivate ${packageData.packageName}? It will remain in the system but will no longer be available for new use.`
        }
        confirmText={pendingAction === 'delete' ? 'Delete' : 'Deactivate'}
        confirmColor={pendingAction === 'delete' ? 'error' : 'warning'}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
        loading={deactivatePackageMutation.isPending || deletePackageMutation.isPending}
      />
    </Box>
  );
};

export default PackageDetailPage;