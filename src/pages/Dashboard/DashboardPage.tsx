import React from 'react';
import { Box, Grid, Paper, Typography, Skeleton, Avatar, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import ArchiveIcon from '@mui/icons-material/Archive';
import DraftsIcon from '@mui/icons-material/Drafts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import { PageHeader, Button, EntityStatusBadge } from '../../components';
import { useProjects, useDashboardStats, useRecentActivity } from '../../hooks';
import { useAuth } from '../../contexts';
import { RecentActivityItem } from '../../types';
import { parseUtcTimestamp } from '../../utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => (
  <Paper sx={{ p: { xs: 2, sm: 3 } }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={40} />
        ) : (
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {value}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: { xs: 1, sm: 1.5 },
          borderRadius: 2,
          backgroundColor: `${color}20`,
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ label, icon, onClick }) => (
  <Button
    variant="outline"
    onClick={onClick}
    icon={icon}
    fullWidth
    sx={{ justifyContent: 'flex-start', py: 1.5 }}
  >
    {label}
  </Button>
);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentActivity(10);

  const isLoading = statsLoading || projectsLoading;

  const recentProjects = React.useMemo(() => {
    if (!projects) return [];
    return [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [projects]);

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your projects and activities"
        actions={
          hasPermission('Projects.Create') ? (
            <Button variant="primary" icon={<AddIcon />} onClick={() => navigate('/projects/new')}>
              New Project
            </Button>
          ) : undefined
        }
      />

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={dashboardStats?.totalProjects ?? 0}
            icon={<FolderIcon />}
            color="#1976D2"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={dashboardStats?.inProgressProjects ?? 0}
            icon={<PendingActionsIcon />}
            color="#FF9800"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={dashboardStats?.completedProjects ?? 0}
            icon={<CheckCircleIcon />}
            color="#4CAF50"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Panels"
            value={dashboardStats?.totalPanels ?? 0}
            icon={<DashboardIcon />}
            color="#9C27B0"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Draft Projects"
            value={dashboardStats?.draftProjects ?? 0}
            icon={<DraftsIcon />}
            color="#9E9E9E"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Archived"
            value={dashboardStats?.archivedProjects ?? 0}
            icon={<ArchiveIcon />}
            color="#607D8B"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Active Offers Value"
            value={dashboardStats ? `${dashboardStats.totalActiveOffersValue.toLocaleString()}` : '0'}
            icon={<AttachMoneyIcon />}
            color="#00BCD4"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Materials"
            value={dashboardStats?.totalMaterials ?? 0}
            icon={<CategoryIcon />}
            color="#E91E63"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Recent Projects */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Projects
              </Typography>
              <Button variant="ghost" onClick={() => navigate('/projects')}>
                View All →
              </Button>
            </Box>

            {projectsLoading ? (
              <Box>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : recentProjects.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No projects yet. Create your first project to get started.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentProjects.map((project) => (
                  <Box
                    key={project.projectId}
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'grey.50' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FolderIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={500}>
                          {project.projectName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.customer}
                        </Typography>
                      </Box>
                    </Box>
                    <EntityStatusBadge status={project.status} />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {hasPermission('Projects.Create') && (
                <QuickAction
                  label="New Project"
                  icon={<AddIcon />}
                  onClick={() => navigate('/projects/new')}
                />
              )}
              <QuickAction
                label="Browse Materials"
                icon={<InventoryIcon />}
                onClick={() => navigate('/materials')}
              />
              {hasPermission('Offers.Generate') && (
                <QuickAction
                  label="Generate Report"
                  icon={<DescriptionIcon />}
                  onClick={() => navigate('/offers')}
                />
              )}
              {hasPermission('Materials.Import') && (
                <QuickAction
                  label="Import Data"
                  icon={<UploadFileIcon />}
                  onClick={() => navigate('/import')}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity — uses /dashboard/recent-activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Recent Activity
                </Typography>
              </Box>
              {hasPermission('AuditLogs.View') && (
                <Button variant="ghost" onClick={() => navigate('/admin/audit-logs')}>
                  View All →
                </Button>
              )}
            </Box>

            {activityLoading ? (
              <Box>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={50} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : recentActivity.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No recent activity recorded.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentActivity.map((log: RecentActivityItem) => (
                  <Box
                    key={log.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 1,
                      '&:hover': { backgroundColor: 'grey.50' },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        bgcolor: getActionColor(log.action),
                      }}
                    >
                      {(log.userName || '?')[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2">
                        <strong>{log.userName || 'System'}</strong>{' '}
                        {log.action.toLowerCase().replace(/_/g, ' ')}{' '}
                        <Chip
                          label={log.entityType}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                        {log.entityId && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}#{log.entityId}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatRelativeTime(log.timestamp)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

function getActionColor(action: string): string {
  if (action.includes('Create') || action.includes('Add')) return '#4CAF50';
  if (action.includes('Update') || action.includes('Change')) return '#FF9800';
  if (action.includes('Delete') || action.includes('Remove')) return '#F44336';
  return '#1976D2';
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = parseUtcTimestamp(dateStr);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default DashboardPage;
