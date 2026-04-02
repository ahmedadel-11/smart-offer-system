import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Divider, Badge } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  PageHeader,
  Button,
  Loading,
  PanelCard,
  EntityStatusBadge,
  StatusChangeDropdown,
  ConfirmDialog,
  CollaboratorModal,
} from '../../components';
import { useAuth } from '../../contexts';
import {
  useProject,
  useProjectTotalPrice,
  useCreatePanel,
  useChangeProjectStatus,
  useDuplicatePanel,
  useDeletePanel,
  useAddProjectCollaborator,
  useRemoveProjectCollaborator,
  useLockProject,
  useUnlockProject,
  useCloneProject,
  useUsers,
  useProjectLockGuard,
} from '../../hooks';
import { EntityStatus } from '../../types';
import { panelService } from '../../services/panelService';
import toast from 'react-hot-toast';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || '0');
  const { user, hasRole, hasPermission } = useAuth();

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: totalPriceData } = useProjectTotalPrice(projectId);
  const createPanelMutation = useCreatePanel();
  const changeStatusMutation = useChangeProjectStatus();
  const duplicatePanelMutation = useDuplicatePanel();
  const deletePanelMutation = useDeletePanel();
  const addCollaboratorMutation = useAddProjectCollaborator();
  const removeCollaboratorMutation = useRemoveProjectCollaborator();
  const lockProjectMutation = useLockProject();
  const unlockProjectMutation = useUnlockProject();
  const cloneProjectMutation = useCloneProject();
  const { data: allUsers } = useUsers();

  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [duplicatePanelId, setDuplicatePanelId] = useState<number | null>(null);
  const [deletePanelId, setDeletePanelId] = useState<number | null>(null);
  const [showCloneConfirm, setShowCloneConfirm] = useState(false);

  const canChangeStatus =
    hasRole('SuperAdmin') ||
    hasRole('TenderingManager') ||
    project?.createdByUserId === user?.id;

  const canLockUnlock = hasPermission('Projects.Lock') || hasRole('SuperAdmin');

  const canManageCollaborators =
    hasRole('SuperAdmin') || hasRole('TenderingManager');

  const {
    isProjectLocked,
    ensureProjectUnlocked,
    ensurePanelUnlocked,
  } = useProjectLockGuard(project?.isLocked);

  if (isLoading) {
    return <Loading fullScreen message="Loading project..." />;
  }

  if (error || !project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">
          Failed to load project
        </Typography>
        <Button variant="ghost" onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  const handleAddPanel = async () => {
    if (!ensureProjectUnlocked()) {
      return;
    }

    try {
      const panelNumber = (project.panels?.length || 0) + 1;
      const newPanel = await createPanelMutation.mutateAsync({
        projectId: project.projectId,
        panelName: `Panel ${panelNumber}`,
        margin: 20,
      });
      toast.success('Panel added successfully');
      if (newPanel?.panelId) {
        navigate(`/projects/${projectId}/panel/${newPanel.panelId}`);
      }
    } catch (error) {
      toast.error('Failed to add panel');
    }
  };

  const handleStatusChange = async (newStatus: EntityStatus) => {
    if (!ensureProjectUnlocked()) {
      return;
    }

    try {
      await changeStatusMutation.mutateAsync({ id: projectId, dto: { newStatus } });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDuplicatePanel = async () => {
    if (!duplicatePanelId) return;
    if (!ensurePanelUnlocked()) {
      return;
    }

    try {
      const newPanel = await duplicatePanelMutation.mutateAsync(duplicatePanelId);
      toast.success('Panel duplicated successfully');
      setDuplicatePanelId(null);
      if (newPanel?.panelId) {
        navigate(`/projects/${projectId}/panel/${newPanel.panelId}`);
      }
    } catch {
      toast.error('Failed to duplicate panel');
    }
  };

  const handleDeletePanel = async () => {
    if (!deletePanelId) return;
    if (!ensurePanelUnlocked()) {
      return;
    }

    try {
      await deletePanelMutation.mutateAsync(deletePanelId);
      toast.success('Panel deleted');
      setDeletePanelId(null);
    } catch {
      toast.error('Failed to delete panel');
    }
  };

  const handleLockProject = async () => {
    try {
      await lockProjectMutation.mutateAsync(projectId);
      toast.success('Project locked');
    } catch {
      toast.error('Failed to lock project. It may already be locked.');
    }
  };

  const handleUnlockProject = async () => {
    try {
      await unlockProjectMutation.mutateAsync(projectId);
      toast.success('Project unlocked');
    } catch {
      toast.error('Failed to unlock project. It may not be locked.');
    }
  };

  const handleCloneProject = async () => {
    if (!ensureProjectUnlocked()) {
      return;
    }

    try {
      const cloned = await cloneProjectMutation.mutateAsync(projectId);
      toast.success('Project cloned successfully');
      setShowCloneConfirm(false);
      navigate(`/projects/${cloned.projectId}`);
    } catch {
      toast.error('Failed to clone project');
    }
  };

  const handleAddCollaborator = async (dto: { userId: string; roleInProject?: string }) => {
    if (!ensureProjectUnlocked()) {
      return;
    }

    await addCollaboratorMutation.mutateAsync({ projectId, dto });
    // Also add collaborator to all existing panels in this project
    if (project?.panels?.length) {
      const panelPromises = project.panels.map((panel) =>
        panelService.addCollaborator(panel.panelId, { userId: dto.userId, roleInProject: dto.roleInProject }).catch(() => {
          // Silently ignore if already a collaborator on this panel
        })
      );
      await Promise.allSettled(panelPromises);
    }
    toast.success('Collaborator added to project and all panels');
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!ensureProjectUnlocked()) {
      return;
    }

    await removeCollaboratorMutation.mutateAsync({ projectId, userId });
    toast.success('Collaborator removed');
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EGP',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const panelBeingDuplicated = project.panels?.find((p) => p.panelId === duplicatePanelId);

  return (
    <Box>
      <PageHeader
        title={project.projectName}
        subtitle={project.customer}
        breadcrumbs={[
          { label: 'Projects', path: '/projects' },
          { label: project.projectName },
        ]}
        backButton={{ label: 'Back to Projects' }}
        actions={
          <>
            {canManageCollaborators && (
              <Button
                variant="outline"
                icon={
                  <Badge badgeContent={project.collaborators?.length || 0} color="primary" max={9}>
                    <GroupIcon />
                  </Badge>
                }
                onClick={() => setIsCollaboratorModalOpen(true)}
                disabled={isProjectLocked}
              >
                Collaborators
              </Button>
            )}
            {/* Lock / Unlock */}
            {canLockUnlock && !isProjectLocked && (
              <Button
                variant="outline"
                icon={<LockIcon />}
                onClick={handleLockProject}
                loading={lockProjectMutation.isPending}
              >
                Lock
              </Button>
            )}
            {canLockUnlock && isProjectLocked && (
              <Button
                variant="outline"
                icon={<LockOpenIcon />}
                onClick={handleUnlockProject}
                loading={unlockProjectMutation.isPending}
              >
                Unlock
              </Button>
            )}
            {/* Clone */}
            <Button
              variant="outline"
              icon={<ContentCopyIcon />}
              onClick={() => setShowCloneConfirm(true)}
              loading={cloneProjectMutation.isPending}
              disabled={isProjectLocked}
            >
              Clone
            </Button>
            <Button
              variant="outline"
              icon={<EditIcon />}
              onClick={() => navigate(`/projects/${project.projectId}/edit`)}
              disabled={isProjectLocked}
            >
              Edit
            </Button>
            <Button
              variant="primary"
              icon={<DescriptionIcon />}
              onClick={() => navigate(`/projects/${project.projectId}/offer`)}
            >
              Generate Offer
            </Button>
          </>
        }
      />

      {/* Project Summary */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        {isProjectLocked && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1.5, borderRadius: 1, backgroundColor: '#FFF3E0' }}>
            <LockIcon sx={{ color: '#E65100', fontSize: 20 }} />
            <Typography variant="body2" color="#E65100" fontWeight={500}>
              This project is locked{project.lockedAt ? ` since ${formatDate(project.lockedAt)}` : ''}. Editing is disabled.
            </Typography>
          </Box>
        )}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {canChangeStatus ? (
                    <StatusChangeDropdown
                      currentStatus={project.status}
                      onStatusChange={handleStatusChange}
                      disabled={isProjectLocked}
                      loading={changeStatusMutation.isPending}
                    />
                  ) : (
                    <EntityStatusBadge status={project.status} />
                  )}
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Currency
                </Typography>
                <Typography variant="body1">{project.currency}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {project.createdAt ? formatDate(project.createdAt) : 'N/A'}
                </Typography>
              </Box>
              {project.updatedAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">{formatDate(project.updatedAt)}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 3,
                backgroundColor: 'primary.light',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Panels</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {project.panels?.length || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Items</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {totalPriceData?.totalItems ?? project.totalItems ?? 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Total Cost</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatPrice(totalPriceData?.totalCost ?? 0, project.currency)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Margin</Typography>
                <Typography variant="body1" fontWeight={600} color="success.main">
                  {formatPrice(totalPriceData?.totalMarginAmount ?? 0, project.currency)}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight={500}>
                  Total Price
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="primary.main"
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
                >
                  {formatPrice(totalPriceData?.totalPrice ?? project.totalPrice ?? 0, project.currency)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Notes */}
      {project.notes && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Notes
          </Typography>
          <Typography variant="body1">{project.notes}</Typography>
        </Paper>
      )}

      {/* Panels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Panels ({project.panels?.length || 0})
        </Typography>
        <Button
          variant="outline"
          icon={<AddIcon />}
          onClick={handleAddPanel}
          loading={createPanelMutation.isPending}
          disabled={isProjectLocked}
        >
          Add Panel
        </Button>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {project.panels?.map((panel) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={panel.panelId}>
            <PanelCard
              panel={panel}
              summary={panel.summary}
              onClick={() => navigate(`/projects/${projectId}/panel/${panel.panelId}`)}
              onDuplicate={!isProjectLocked ? () => setDuplicatePanelId(panel.panelId) : undefined}
              onDelete={!isProjectLocked ? () => setDeletePanelId(panel.panelId) : undefined}
            />
          </Grid>
        ))}

        {/* Add Panel Card - always shown in grid for easy access */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper
            onClick={isProjectLocked ? undefined : handleAddPanel}
            sx={{
              p: { xs: 1.5, sm: 2 },
              cursor: isProjectLocked ? 'not-allowed' : 'pointer',
              opacity: isProjectLocked ? 0.6 : 1,
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300',
              backgroundColor: 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: 100, sm: 130 },
              transition: 'all 0.2s',
              ...(isProjectLocked
                ? {}
                : {
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light',
                      '& .add-icon': {
                        color: 'primary.main',
                      },
                    },
                  }),
            }}
          >
            <AddIcon
              className="add-icon"
              sx={{ fontSize: 36, color: 'grey.400', mb: 1, transition: 'color 0.2s' }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Add New Panel
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {(!project.panels || project.panels.length === 0) && (
        <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', mt: -8 }}>
          <Typography color="text.secondary" gutterBottom>
            No panels yet. Click the card above or the button to add your first panel.
          </Typography>
        </Paper>
      )}

      {/* Clone Project Confirmation */}
      <ConfirmDialog
        open={showCloneConfirm}
        title="Clone Project"
        message={`Clone "${project.projectName}"? A copy will be created with all panels and items.`}
        confirmText="Clone"
        confirmColor="primary"
        onConfirm={handleCloneProject}
        onCancel={() => setShowCloneConfirm(false)}
        loading={cloneProjectMutation.isPending}
      />

      {/* Duplicate Panel Confirmation */}
      <ConfirmDialog
        open={!!duplicatePanelId}
        title="Duplicate Panel"
        message={`Duplicate "${panelBeingDuplicated?.panelName || ''}"? This will copy all materials and quantities.`}
        confirmText="Duplicate"
        confirmColor="primary"
        onConfirm={handleDuplicatePanel}
        onCancel={() => setDuplicatePanelId(null)}
        loading={duplicatePanelMutation.isPending}
      />

      {/* Delete Panel Confirmation (Soft Delete) */}
      <ConfirmDialog
        open={!!deletePanelId}
        title="Delete Panel"
        message={`Are you sure you want to delete this panel? This action can be reversed by an administrator.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeletePanel}
        onCancel={() => setDeletePanelId(null)}
        loading={deletePanelMutation.isPending}
      />

      {/* Collaborator Modal */}
      <CollaboratorModal
        open={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        title={`Collaborators for "${project.projectName}"`}
        collaborators={project.collaborators || []}
        users={allUsers || []}
        onAdd={handleAddCollaborator}
        onRemove={handleRemoveCollaborator}
        loading={addCollaboratorMutation.isPending || removeCollaboratorMutation.isPending}
      />
    </Box>
  );
};

export default ProjectDetailPage;
