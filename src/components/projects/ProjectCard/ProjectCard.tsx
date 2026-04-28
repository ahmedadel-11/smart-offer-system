import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Avatar, Tooltip } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DownloadIcon from '@mui/icons-material/Download';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import { Card, ActionMenu, MenuAction } from '../../common';
import { EntityStatusBadge } from '../../shared';
import { Project } from '../../../types';

interface ProjectCardProps {
  project: Project;
  ownerName?: string;
  panelCount?: number;
  totalPrice?: number;
  collaboratorCount?: number;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
  onExport?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  ownerName,
  panelCount = 0,
  totalPrice = 0,
  collaboratorCount = 0,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.projectId}`);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOwnerInitials = () => {
    const source = ownerName?.trim() || project.createdByUserId || '';
    if (!source) return '?';

    if (ownerName) {
      const parts = ownerName.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return ownerName.slice(0, 2).toUpperCase();
    }

    return source.substring(0, 2).toUpperCase();
  };

  const actions: MenuAction[] = [
    ...(!project.isLocked && onEdit
      ? [{ label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: () => onEdit(project) }]
      : []),
    ...(!project.isLocked && onDuplicate
      ? [
          {
            label: 'Duplicate',
            icon: <FileCopyIcon fontSize="small" />,
            onClick: () => onDuplicate(project),
          },
        ]
      : []),
    ...(onExport
      ? [
          {
            label: 'Export',
            icon: <DownloadIcon fontSize="small" />,
            onClick: () => onExport(project),
          },
        ]
      : []),
    ...(!project.isLocked && onDelete
      ? [
          {
            label: 'Delete',
            icon: <DeleteIcon fontSize="small" />,
            onClick: () => onDelete(project),
            color: 'error' as const,
            divider: true,
          },
        ]
      : []),
  ];

  return (
    <Card
      onClick={handleClick}
      hoverable
      headerAction={actions.length > 0 ? <ActionMenu actions={actions} /> : undefined}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
              display: 'flex',
            }}
          >
            <FolderIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {project.projectName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {project.customer}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ color: 'text.secondary', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ViewInArIcon fontSize="small" />
            <Typography variant="body2">{project.panelCount || panelCount} Panels</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoneyIcon fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              {formatPrice(totalPrice, project.currency)}
            </Typography>
          </Box>
          {collaboratorCount > 0 && (
            <Tooltip title={`${collaboratorCount} collaborator(s)`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GroupIcon fontSize="small" />
                <Typography variant="body2">{collaboratorCount}</Typography>
              </Box>
            </Tooltip>
          )}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EntityStatusBadge status={project.status} />
            {project.isLocked && (
              <Tooltip title="Project is locked">
                <LockIcon sx={{ fontSize: 16, color: 'warning.dark' }} />
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {project.createdByUserId && (
              <Tooltip title={ownerName ? `Owner: ${ownerName}` : `Owner ID: ${project.createdByUserId}`}>
                <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: 'grey.400' }}>
                  {getOwnerInitials()}
                </Avatar>
              </Tooltip>
            )}
            {ownerName && (
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 100 }} noWrap>
                {ownerName}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {formatDate(project.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default ProjectCard;
