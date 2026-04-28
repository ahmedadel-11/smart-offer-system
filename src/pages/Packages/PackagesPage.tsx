import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayersIcon from '@mui/icons-material/Layers';
import PaidIcon from '@mui/icons-material/Paid';
import { Button, EmptyState, Loading, PageHeader, ConfirmDialog } from '../../components';
import { PackageCard } from '../../components/packages';
import { useAuth } from '../../contexts';
import { useDeletePackage, useDeactivatePackage, usePackages, useSearchPackages } from '../../hooks';
import { PackageDto } from '../../types';
import { getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';

type PendingAction = 'deactivate' | 'delete' | null;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(value);

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('packages:create');
  const canEdit = hasPermission('packages:edit');
  const canDeactivate = hasPermission('packages:deactivate');
  const canDelete = hasPermission('packages:delete');

  const [searchTerm, setSearchTerm] = useState('');
  const [pendingPackage, setPendingPackage] = useState<PackageDto | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const packagesQuery = usePackages();
  const searchQuery = useSearchPackages(searchTerm);
  const deactivatePackageMutation = useDeactivatePackage();
  const deletePackageMutation = useDeletePackage();

  const allPackages = packagesQuery.data ?? [];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const localFilteredPackages = useMemo(() => {
    if (!normalizedSearch) {
      return allPackages;
    }

    return allPackages.filter((pkg) => {
      return (
        pkg.packageName.toLowerCase().includes(normalizedSearch) ||
        (pkg.description ?? '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [allPackages, normalizedSearch]);

  const displayingSearchResults = normalizedSearch.length >= 2;
  const visiblePackages = displayingSearchResults
    ? searchQuery.data ?? localFilteredPackages
    : allPackages;

  const stats = useMemo(() => {
    return allPackages.reduce(
      (acc, pkg) => {
        acc.totalItems += pkg.items.length;
        acc.totalQuantity += pkg.items.reduce((sum, item) => sum + item.quantity, 0);
        acc.totalValue += pkg.items.reduce(
          (sum, item) => sum + item.quantity * (item.materialBasePrice ?? 0),
          0
        );

        if (pkg.isActive) {
          acc.active += 1;
        } else {
          acc.inactive += 1;
        }

        return acc;
      },
      { totalItems: 0, totalQuantity: 0, totalValue: 0, active: 0, inactive: 0 }
    );
  }, [allPackages]);

  const isInitialLoading = packagesQuery.isLoading && allPackages.length === 0;
  const packagesErrorMessage = packagesQuery.isError
    ? getErrorMessage(packagesQuery.error, 'Failed to load packages')
    : '';

  if (packagesQuery.isError && allPackages.length === 0) {
    return (
      <Box>
        <PageHeader
          title="Packages"
          subtitle="Build reusable material bundles and manage standard enclosure sets"
        />
        <EmptyState
          icon={<Inventory2Icon />}
          title="Unable to load packages"
          description={packagesErrorMessage}
          action={{
            label: 'Try Again',
            onClick: () => packagesQuery.refetch(),
          }}
        />
      </Box>
    );
  }

  const handleView = (pkg: PackageDto) => {
    navigate(`/packages/${pkg.packageId}`);
  };

  const handleEdit = (pkg: PackageDto) => {
    navigate(`/packages/${pkg.packageId}/edit`);
  };

  const handleDeactivate = (pkg: PackageDto) => {
    setPendingPackage(pkg);
    setPendingAction('deactivate');
  };

  const handleDelete = (pkg: PackageDto) => {
    setPendingPackage(pkg);
    setPendingAction('delete');
  };

  const handleConfirmAction = async () => {
    if (!pendingPackage || !pendingAction) return;

    try {
      if (pendingAction === 'deactivate') {
        await deactivatePackageMutation.mutateAsync(pendingPackage.packageId);
        toast.success('Package deactivated successfully');
      } else {
        await deletePackageMutation.mutateAsync(pendingPackage.packageId);
        toast.success('Package deleted successfully');
      }

      setPendingPackage(null);
      setPendingAction(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error, pendingAction === 'deactivate' ? 'Failed to deactivate package' : 'Failed to delete package')
      );
    }
  };

  return (
    <Box>
      <PageHeader
        title="Packages"
        subtitle="Build reusable material bundles and manage standard enclosure sets"
        actions={
          canCreate ? (
            <Button variant="primary" icon={<AddIcon />} onClick={() => navigate('/packages/new')}>
              New Package
            </Button>
          ) : undefined
        }
      />

      <Paper
        variant="outlined"
        sx={(theme) => ({
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
        })}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ md: 'center' }}
            justifyContent="space-between"
          >
            <TextField
              fullWidth
              placeholder="Search packages by name or description..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              size="small"
              sx={{ maxWidth: { md: 520 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" icon={<LayersIcon />} label={`${allPackages.length} packages`} />
              <Chip size="small" icon={<CheckCircleIcon />} label={`${stats.active} active`} />
              <Chip size="small" icon={<Inventory2Icon />} label={`${stats.totalItems} items`} />
              <Chip size="small" icon={<PaidIcon />} label={formatCurrency(stats.totalValue)} />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {isInitialLoading ? (
        <Loading message="Loading packages..." />
      ) : visiblePackages.length === 0 ? (
        <EmptyState
          icon={<Inventory2Icon />}
          title={displayingSearchResults ? 'No matching packages found' : 'No packages yet'}
          description={
            displayingSearchResults
              ? 'Try another search term or clear the search box to see the full catalog.'
              : 'Create your first package to bundle materials into reusable configurations.'
          }
          action={
            displayingSearchResults
              ? {
                  label: 'Clear Search',
                  onClick: () => setSearchTerm(''),
                }
              : canCreate
                ? {
                    label: 'Create Package',
                    onClick: () => navigate('/packages/new'),
                  }
                : undefined
          }
        />
      ) : (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {visiblePackages.map((pkg) => (
            <Grid item xs={12} sm={6} lg={4} key={pkg.packageId}>
              <PackageCard
                packageItem={pkg}
                onView={handleView}
                onEdit={canEdit ? handleEdit : undefined}
                onDeactivate={canDeactivate ? handleDeactivate : undefined}
                onDelete={canDelete ? handleDelete : undefined}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={!!pendingPackage && pendingAction !== null}
        title={pendingAction === 'delete' ? 'Delete Package' : 'Deactivate Package'}
        message={
          pendingAction === 'delete'
            ? `Permanently delete ${pendingPackage?.packageName}? This cannot be undone.`
            : `Deactivate ${pendingPackage?.packageName}? It will stay in the system but will no longer be available for new use.`
        }
        confirmText={pendingAction === 'delete' ? 'Delete' : 'Deactivate'}
        confirmColor={pendingAction === 'delete' ? 'error' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setPendingPackage(null);
          setPendingAction(null);
        }}
        loading={deactivatePackageMutation.isPending || deletePackageMutation.isPending}
      />
    </Box>
  );
};

export default PackagesPage;