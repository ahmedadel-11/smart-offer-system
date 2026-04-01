import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { PageHeader, ProjectForm, Loading, Button } from '../../components';
import { useProject, useUpdateProject, useCustomers, useUsers } from '../../hooks';
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

  const handleSubmit = async (data: UpdateProject) => {
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
        <ProjectForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateProjectMutation.isPending}
          customers={customers || []}
          users={users || []}
          mode="edit"
        />
      </Box>
    </Box>
  );
};

export default ProjectEditPage;