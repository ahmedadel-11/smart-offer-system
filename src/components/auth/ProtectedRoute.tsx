import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessPage } from '../../services/authorizationService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Permissions required to access this route.
   * By default (requireAll=false), user needs ANY of them.
   * If omitted, the route auto-resolves permissions from PAGE_PERMISSIONS config.
   */
  requiredPermissions?: string[];
  /** If true, user needs ALL listed permissions. Default: false (ANY) */
  requireAll?: boolean;
  /** Where to redirect if unauthorized. Default: /dashboard */
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions,
  requireAll = false,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, isLoading, user, hasAnyPermission, hasAllPermissions } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If explicit permissions are provided, check them
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <Navigate to={redirectTo} replace />;
    }
  }
  // If no explicit permissions, auto-resolve from PAGE_PERMISSIONS config
  else if (!requiredPermissions) {
    if (!canAccessPage(user, location.pathname)) {
      return <Navigate to={redirectTo} replace />;
    }
  }
  // requiredPermissions = [] (empty array) means any authenticated user can access

  return <>{children}</>;
};

export default ProtectedRoute;
