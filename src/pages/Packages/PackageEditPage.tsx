import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { PageHeader, Loading, EmptyState } from '../../components';
import { PackageForm, PackageFormValues } from '../../components/packages';
import { usePackage, useUpdatePackage } from '../../hooks';
import { UpdatePackageRequest } from '../../types';
import { getErrorMessage } from '../../utils';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import toast from 'react-hot-toast';

export const PackageEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const packageId = parseInt(id || '0', 10);

  const { data: packageData, isLoading, error } = usePackage(packageId);
  const updatePackageMutation = useUpdatePackage();

  const initialValues = useMemo<PackageFormValues | undefined>(() => {
    if (!packageData) return undefined;

    return {
      packageName: packageData.packageName,
      description: packageData.description ?? '',
      items: packageData.items.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
      })),
    };
  }, [packageData]);

  const handleSubmit = async (values: PackageFormValues) => {
    if (!packageId) return;

    const request: UpdatePackageRequest = {
      packageName: values.packageName,
      description: values.description || undefined,
      items: values.items,
    };

    try {
      const updatedPackage = await updatePackageMutation.mutateAsync({ id: packageId, data: request });
      toast.success('Package updated successfully');
      navigate(`/packages/${updatedPackage.packageId}`);
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Failed to update package'));
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading package..." />;
  }

  if (error || !packageData) {
    return (
      <Box sx={{ py: 6 }}>
        <EmptyState
          icon={<Inventory2Icon />}
          title="Package not found"
          description="The package may have been deleted or you may not have access to it."
          action={{ label: 'Back to Packages', onClick: () => navigate('/packages') }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit Package"
        subtitle={packageData.packageName}
        breadcrumbs={[
          { label: 'Packages', path: '/packages' },
          { label: packageData.packageName, path: `/packages/${packageData.packageId}` },
          { label: 'Edit Package' },
        ]}
        backButton={{ label: 'Back to Package' }}
      />

      <PackageForm
        initialValues={initialValues}
        submitLabel="Save Changes"
        loading={updatePackageMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/packages/${packageData.packageId}`)}
      />
    </Box>
  );
};

export default PackageEditPage;