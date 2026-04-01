import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PageHeader, Loading, EntityStatusBadge } from '../../components';
import { useProjects } from '../../hooks';
import { useAuth } from '../../contexts';
import { Project } from '../../types';

export const OffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const canGenerate = hasPermission('Offers.Generate');
  const canExport = hasPermission('Offers.Export');

  const { data: projects, isLoading } = useProjects();

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        project.projectName.toLowerCase().includes(term) ||
        project.customer.toLowerCase().includes(term)
      );
    });
  }, [projects, searchTerm]);

  const handleViewOffer = (projectId: number) => {
    navigate(`/projects/${projectId}/offer`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading projects..." />;
  }

  return (
    <Box>
      <PageHeader
        title="Offers"
        subtitle="Generate commercial and technical offers for your projects"
      />

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredProjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchTerm
              ? 'No projects match your search.'
              : 'No projects found. Create a project first to generate offers.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredProjects.map((project: Project) => (
            <Grid item xs={12} sm={6} md={4} key={project.projectId}>
              <Paper
                sx={{
                  p: 2.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => handleViewOffer(project.projectId)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1, mr: 1 }}>
                    {project.projectName}
                  </Typography>
                  <EntityStatusBadge status={project.status} size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {project.customer}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={`${project.panelCount} Panel${project.panelCount !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip label={project.currency} size="small" variant="outlined" />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                  <Tooltip title="View Offer">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewOffer(project.projectId); }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canGenerate && (
                    <Tooltip title="Generate PDF">
                      <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleViewOffer(project.projectId); }}>
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canExport && (
                    <Tooltip title="Export Excel">
                      <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleViewOffer(project.projectId); }}>
                        <TableChartIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default OffersPage;
