import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import BoltIcon from '@mui/icons-material/Bolt';
import { useAuth } from '../../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  drawerWidth: number;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, drawerWidth }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileNavigation = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettingsNavigation = () => {
    navigate('/settings');
    handleClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout API fails
      navigate('/login', { replace: true });
    }
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: { xs: 1, sm: 2 }, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BoltIcon sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            fontWeight={600}
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Electric Technology
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit" size="medium">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              size="medium"
              onClick={handleSettingsNavigation}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton onClick={handleProfileClick} size="small" sx={{ ml: { xs: 0.5, sm: 1 } }}>
              <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: 'primary.main' }}>
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 1.5 }}
        >
          <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.fullName || user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.roles?.[0] || 'User'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileNavigation}>
            <AccountCircleIcon sx={{ mr: 2, fontSize: 20 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleSettingsNavigation} sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
