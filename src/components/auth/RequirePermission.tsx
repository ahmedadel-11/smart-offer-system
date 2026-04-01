import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RequirePermissionProps {
  /** Single permission name to check */
  permission?: string;
  /** Multiple permissions — user must have ANY of them (or ALL if requireAll=true) */
  permissions?: string[];
  /** If true, requires ALL listed permissions. Default: false (any one suffices) */
  requireAll?: boolean;
  /** What to render if the user lacks the required permission(s). Default: nothing */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * Usage:
 * ```tsx
 * <RequirePermission permission="Projects.Delete">
 *   <DeleteButton />
 * </RequirePermission>
 *
 * <RequirePermission permissions={["Projects.Edit", "Projects.Delete"]} requireAll>
 *   <AdminPanel />
 * </RequirePermission>
 * ```
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasAnyPermission, hasAllPermissions } = useAuth();

  const permList = permissions ?? (permission ? [permission] : []);

  if (permList.length === 0) {
    // No permission specified — render children
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? hasAllPermissions(permList)
    : hasAnyPermission(permList);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RequirePermission;
