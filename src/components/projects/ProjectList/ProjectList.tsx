import React from 'react';
import { Grid, Box } from '@mui/material';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { Loading, EmptyState } from '../../common';
import { Project } from '../../../types';
import FolderIcon from '@mui/icons-material/Folder';

interface ProjectListProps {
  projects: Project[];
  ownerNameById?: Record<string, string>;
  loading?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
  onExport?: (project: Project) => void;
  onCreateNew?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  ownerNameById,
  loading = false,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  onCreateNew,
}) => {
  if (loading) {
    return <Loading message="Loading projects..." />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderIcon />}
        title="No Projects Yet"
        description="Create your first project to start building electrical panel quotations."
        action={onCreateNew ? { label: 'Create Project', onClick: onCreateNew } : undefined}
      />
    );
  }

  return (
    <Box>
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={project.projectId}>
            <ProjectCard
              project={project}
              ownerName={project.createdByUserId ? ownerNameById?.[project.createdByUserId] : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onExport={onExport}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProjectList;
