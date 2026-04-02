import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { PageHeader, ProjectForm, Loading, Button } from '../../components';
import { useProject, useUpdateProject, useCustomers, useUsers, useProjectLockGuard } from '../../hooks';
import { UpdateProject } from '../../types';
import toast from 'react-hot-toast';

export const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || '0');

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: customers } = useCustomers();
  const { data: users } = useUsers();
  const updateProjectMutation = useUpdateProject();
  const { isProjectLocked, ensureProjectUnlocked } = useProjectLockGuard(project?.isLocked);

  const handleSubmit = async (data: UpdateProject) => {
    if (!ensureProjectUnlocked()) {
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({ id: projectId, data });
      toast.success('Project updated successfully!');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      toast.error('Failed to update project');
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
          mode="edit"
        />
      </Box>
    </Box>
  );
};

export default ProjectEditPage;