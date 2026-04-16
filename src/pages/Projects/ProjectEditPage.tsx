import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { PageHeader, ProjectForm, Loading, Button } from '../../components';
import { useProject, useUpdateProject, useCustomers, useUsers, useProjectLockGuard, useCurrencyRates } from '../../hooks';
import { UpdateProject } from '../../types';
import toast from 'react-hot-toast';

const extractApiErrorMessage = (error: unknown, fallback: string): string => {
  const maybeError = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } | string };
  };

  if (typeof maybeError.response?.data === 'string') {
    return maybeError.response.data;
  }

  if (maybeError.response?.data && typeof maybeError.response.data === 'object') {
    const message = maybeError.response.data.message;
    if (message) {
      return message;
    }

    const validationErrors = maybeError.response.data.errors;
    if (validationErrors) {
      const firstError = Object.values(validationErrors).flat()[0];
      if (firstError) {
        return firstError;
      }
    }
  }

  return fallback;
};

export const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || '0');

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: customers } = useCustomers();
  const { data: users } = useUsers();
  const { data: currencyRates = [] } = useCurrencyRates();
  const updateProjectMutation = useUpdateProject();
  const { isProjectLocked, ensureProjectUnlocked } = useProjectLockGuard(project?.isLocked);

  const supportedCurrencies = React.useMemo(() => {
    const unique = new Set(currencyRates.map((rate) => rate.currencyCode.toUpperCase()));
    unique.add('EGP');
    return Array.from(unique).sort();
  }, [currencyRates]);

  const handleSubmit = async (data: UpdateProject) => {
    if (!ensureProjectUnlocked()) {
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({ id: projectId, data });
      toast.success('Project updated successfully!');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to update project'));
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading project..." />;
  }

  if (error || !project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">
          Project not found
        </Typography>
        <Button variant="ghost" onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  // Convert project data to form initial values
  const initialData = {
    projectName: project.projectName,
    customer: project.customer,
    currency: project.currency,
    createdByUserId: project.createdByUserId || '',
    notes: project.notes || '',
  };

  return (
    <Box>
      <PageHeader
        title="Edit Project"
        subtitle={project.projectName}
        breadcrumbs={[
          { label: 'Projects', path: '/projects' },
          { label: project.projectName, path: `/projects/${projectId}` },
          { label: 'Edit' },
        ]}
        backButton={{ label: 'Back to Project' }}
      />

      <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {isProjectLocked && (
          <Alert severity="warning" icon={<LockIcon fontSize="inherit" />} sx={{ mb: 2 }}>
            This project is locked and cannot be edited.
          </Alert>
        )}
        <ProjectForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateProjectMutation.isPending || isProjectLocked}
          customers={customers || []}
          users={users || []}
          supportedCurrencies={supportedCurrencies}
          mode="edit"
        />
      </Box>
    </Box>
  );
};

export default ProjectEditPage;