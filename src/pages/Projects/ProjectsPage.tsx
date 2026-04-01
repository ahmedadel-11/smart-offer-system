import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { PageHeader, Button, ProjectList, ProjectForm, Modal } from '../../components';
import { useProjects, useCreateProjectWithPanels, useDeleteProject, useCustomers } from '../../hooks';
import { Project, EntityStatus, EntityStatusLabels, CreateProject } from '../../types';
import { useAuth } from '../../contexts';
import toast from 'react-hot-toast';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('Projects.Create');
  const canEdit = hasPermission('Projects.Edit');
  const canDelete = hasPermission('Projects.Delete');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useProjects();
  const { data: customers } = useCustomers();
  const createProjectMutation = useCreateProjectWithPanels();
  const deleteProjectMutation = useDeleteProject();

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.customer.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || String(project.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Count projects by status
  const statusCounts = useMemo(() => {
    if (!projects) return {};

    return projects.reduce((acc, project) => {
      acc[String(project.status)] = (acc[String(project.status)] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [projects]);

  const handleCreateProject = async (data: CreateProject) => {
    try {
      const newProject = await createProjectMutation.mutateAsync(data);
      toast.success('Project created successfully!');
      setIsCreateModalOpen(false);
      navigate(`/projects/${newProject.projectId}`);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) return;

    try {
      await deleteProjectMutation.mutateAsync(deleteProject.projectId);
      toast.success('Project deleted successfully');
      setDeleteProject(null);
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Projects"
        subtitle="Manage your electrical panel projects"
        actions={
          canCreate ? (
            <Button
              variant="primary"
              icon={<AddIcon />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Project
            </Button>
          ) : undefined
        }
      />

      {/* Search Bar */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <TextField
          fullWidth
          placeholder="Search projects by name or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { xs: '100%', sm: 500 } }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, sm: 3 } }}>
        <Tabs
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="all"
            label={
              <Badge badgeContent={projects?.length || 0} color="primary" max={99}>
                <Box sx={{ pr: 2 }}>All</Box>
              </Badge>
            }
          />
          {Object.values(EntityStatus)
            .filter((v) => typeof v === 'number')
            .map((status) => (
            <Tab
              key={status}
              value={String(status)}
              label={
                <Badge badgeContent={statusCounts[String(status)] || 0} color="default" max={99}>
                  <Box sx={{ pr: 2 }}>{EntityStatusLabels[status as EntityStatus]}</Box>
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Projects Grid */}
      <ProjectList
        projects={filteredProjects}
        loading={isLoading}
        onEdit={canEdit ? (project) => navigate(`/projects/${project.projectId}/edit`) : undefined}
        onDelete={canDelete ? (project) => setDeleteProject(project) : undefined}
        onCreateNew={canCreate ? () => setIsCreateModalOpen(true) : undefined}
      />

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        size="md"
      >
        <ProjectForm
          mode="create"
          onSubmit={handleCreateProject}
          isLoading={createProjectMutation.isPending}
          customers={customers || []}
        />
      </Modal>

      {/* Delete Confirmation Dialog (Soft Delete) */}
      <Dialog open={!!deleteProject} onClose={() => setDeleteProject(null)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Delete Project
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteProject?.projectName}"?
          </DialogContentText>
          <DialogContentText sx={{ mt: 1, fontSize: '0.85rem', color: 'text.secondary' }}>
            This action can be reversed by an administrator.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" onClick={() => setDeleteProject(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteProject}
            loading={deleteProjectMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;
