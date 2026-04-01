import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RequireRoleProps {
  /** Single role name to check */
  role?: string;
  /** Multiple roles — user must have ANY of them (or ALL if requireAll=true) */
  roles?: string[];
  /** If true, requires ALL listed roles. Default: false (any one suffices) */
  requireAll?: boolean;
  /** What to render if the user lacks the required role(s). Default: nothing */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's roles.
 *
 * Usage:
 * ```tsx
 * <RequireRole role="SuperAdmin">
 *   <AdminPanel />
 * </RequireRole>
 *
 * <RequireRole roles={["SuperAdmin", "TenderingManager"]}>
 *   <ManagerView />
 * </RequireRole>
 * ```
 */
export const RequireRole: React.FC<RequireRoleProps> = ({
  role,
  roles,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasRole, hasAnyRole } = useAuth();

  const roleList = roles ?? (role ? [role] : []);

  if (roleList.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? roleList.every((r) => hasRole(r))
    : hasAnyRole(roleList);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RequireRole;
