import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
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
import { useProjects, useCreateProjectWithPanels, useDeleteProject, useCustomers, useUsers, useCurrencyRates } from '../../hooks';
import { Project, EntityStatus, EntityStatusLabels, CreateProject } from '../../types';
import { useAuth } from '../../contexts';
import { parseUtcTimestamp } from '../../utils';
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

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('Projects.Create');
  const canEdit = hasPermission('Projects.Edit');
  const canDelete = hasPermission('Projects.Delete');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');
  const [createdFromFilter, setCreatedFromFilter] = useState('');
  const [createdToFilter, setCreatedToFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useProjects();
  const { data: users = [] } = useUsers();
  const { data: customers } = useCustomers();
  const { data: currencyRates = [] } = useCurrencyRates();
  const createProjectMutation = useCreateProjectWithPanels();
  const deleteProjectMutation = useDeleteProject();

  const supportedCurrencies = useMemo(() => {
    const unique = new Set(currencyRates.map((rate) => rate.currencyCode.toUpperCase()));
    unique.add('EGP');
    return Array.from(unique).sort();
  }, [currencyRates]);

  const ownerNameById = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user.fullName;
      return acc;
    }, {} as Record<string, string>);
  }, [users]);

  const createdByOptions = useMemo(() => {
    if (!projects) return [];

    const uniqueOwnerIds = Array.from(
      new Set(projects.map((project) => project.createdByUserId).filter(Boolean) as string[])
    );

    return uniqueOwnerIds
      .map((ownerId) => ({
        id: ownerId,
        label: ownerNameById[ownerId] || ownerId,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [projects, ownerNameById]);

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

      // Created by filter
      const matchesCreatedBy =
        createdByFilter === 'all' ||
        (project.createdByUserId || '') === createdByFilter;

      const createdDate = parseUtcTimestamp(project.createdAt);
      const hasValidCreatedDate = !Number.isNaN(createdDate.getTime());

      const fromBoundary = createdFromFilter
        ? new Date(`${createdFromFilter}T00:00:00`)
        : null;
      const toBoundary = createdToFilter
        ? new Date(`${createdToFilter}T23:59:59.999`)
        : null;

      const matchesCreatedFrom = fromBoundary
        ? hasValidCreatedDate && createdDate >= fromBoundary
        : true;

      const matchesCreatedTo = toBoundary
        ? hasValidCreatedDate && createdDate <= toBoundary
        : true;

      return matchesSearch && matchesStatus && matchesCreatedBy && matchesCreatedFrom && matchesCreatedTo;
    });
  }, [projects, searchTerm, statusFilter, createdByFilter, createdFromFilter, createdToFilter]);

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
      toast.error(extractApiErrorMessage(error, 'Failed to create project'));
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

      <Paper variant="outlined" sx={{ p: 2, mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ md: 'center' }}
          sx={{ mb: 1.5 }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: { md: 110 } }}>
            Advanced Filters
          </Typography>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
            <InputLabel>Created By</InputLabel>
            <Select
              value={createdByFilter}
              label="Created By"
              onChange={(e) => setCreatedByFilter(e.target.value)}
            >
              <MenuItem value="all">All Owners</MenuItem>
              {createdByOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Created From"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={createdFromFilter}
            onChange={(e) => setCreatedFromFilter(e.target.value)}
            sx={{ minWidth: { xs: '100%', md: 180 } }}
          />

          <TextField
            type="date"
            label="Created To"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={createdToFilter}
            onChange={(e) => setCreatedToFilter(e.target.value)}
            sx={{ minWidth: { xs: '100%', md: 180 } }}
          />

          <Button
            variant="ghost"
            onClick={() => {
              setCreatedByFilter('all');
              setCreatedFromFilter('');
              setCreatedToFilter('');
            }}
            disabled={createdByFilter === 'all' && !createdFromFilter && !createdToFilter}
          >
            Reset
          </Button>
        </Stack>
      </Paper>

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
        ownerNameById={ownerNameById}
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
          supportedCurrencies={supportedCurrencies}
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
