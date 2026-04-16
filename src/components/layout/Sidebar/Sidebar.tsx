import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  ListSubheader,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import InventoryIcon from '@mui/icons-material/Inventory';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import BoltIcon from '@mui/icons-material/Bolt';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../../contexts/AuthContext';
import { canAccessPage } from '../../../services/authorizationService';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  isMobile: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

// =====================
// Navigation item definitions
// Visibility is determined dynamically by the user's permissions
// via PAGE_PERMISSIONS in authorizationService (single source of truth).
// No roles or static permission lists here — everything adapts
// automatically when a SuperAdmin changes a user's permissions.
// =====================

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: <FolderIcon />, path: '/projects' },
  { id: 'materials', label: 'Materials', icon: <InventoryIcon />, path: '/materials' },
  { id: 'offers', label: 'Offers', icon: <DescriptionIcon />, path: '/offers' },
  { id: 'import', label: 'Import', icon: <UploadFileIcon />, path: '/import' },
];

const adminItems: NavItem[] = [
  { id: 'users', label: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { id: 'roles', label: 'Roles', icon: <SecurityIcon />, path: '/admin/roles' },
  { id: 'permissions', label: 'Permissions', icon: <VpnKeyIcon />, path: '/admin/permissions' },
  { id: 'audit-logs', label: 'Audit Logs', icon: <HistoryIcon />, path: '/admin/audit-logs' },
];

const settingsItems: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: <PersonIcon />, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { id: 'currency-rates', label: 'Currency Rates', icon: <CurrencyExchangeIcon />, path: '/settings/currency-rates' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  drawerWidth,
  isMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Filter items purely by permissions — uses PAGE_PERMISSIONS from authorizationService
  const visibleNavItems = useMemo(
    () => navigationItems.filter((item) => canAccessPage(user, item.path)),
    [user]
  );
  const visibleAdminItems = useMemo(
    () => adminItems.filter((item) => canAccessPage(user, item.path)),
    [user]
  );
  const visibleSettingsItems = useMemo(
    () => settingsItems.filter((item) => canAccessPage(user, item.path)),
    [user]
  );
  const showAdminSection = visibleAdminItems.length > 0;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BoltIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              Electric Technology
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Smart Panel Solutions
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        {visibleNavItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {showAdminSection && (
        <>
          <Divider />
          <List
            sx={{ px: 1, py: 1 }}
            subheader={
              <ListSubheader
                component="div"
                sx={{
                  lineHeight: '36px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  bgcolor: 'transparent',
                }}
              >
                Administration
              </ListSubheader>
            }
          >
            {visibleAdminItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        {visibleSettingsItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
