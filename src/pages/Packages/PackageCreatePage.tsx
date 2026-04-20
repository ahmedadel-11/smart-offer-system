import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { PageHeader } from '../../components';
import { PackageForm, PackageFormValues } from '../../components/packages';
import { useCreatePackage } from '../../hooks';
import { CreatePackageRequest } from '../../types';
import { getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';

export const PackageCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createPackageMutation = useCreatePackage();

  const handleSubmit = async (values: PackageFormValues) => {
    const request: CreatePackageRequest = {
      packageName: values.packageName,
      description: values.description || undefined,
      items: values.items,
    };

    try {
      const createdPackage = await createPackageMutation.mutateAsync(request);
      toast.success('Package created successfully');
      navigate(`/packages/${createdPackage.packageId}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create package'));
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Package"
        subtitle="Build a reusable bundle of materials"
        breadcrumbs={[
          { label: 'Packages', path: '/packages' },
          { label: 'Create Package' },
        ]}
        backButton={{ label: 'Back to Packages' }}
      />

      <PackageForm
        submitLabel="Create Package"
        loading={createPackageMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/packages')}
      />
    </Box>
  );
};

export default PackageCreatePage;