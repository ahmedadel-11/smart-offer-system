/**
 * Centralized Authorization Service
 *
 * Provides utility functions for role-based and permission-based access control.
 * Based on the SmartOffer backend RBAC model with 3 system roles and 44 permissions.
 *
 * Role hierarchy (policy-based):
 *   SuperAdmin       → full access
 *   TenderingManager → mid-tier (business operations + admin-like project control)
 *   TenderingEngineer → base tier (create and work on own projects/panels)
 */

import type { UserDto } from '../types';

// =====================
// System Roles
// =====================

export const SystemRoles = {
  SuperAdmin: 'SuperAdmin',
  TenderingManager: 'TenderingManager',
  TenderingEngineer: 'TenderingEngineer',
} as const;

export type SystemRole = (typeof SystemRoles)[keyof typeof SystemRoles];

// Role hierarchy — matches backend policy configuration
// SuperAdmin passes all, TenderingManager passes Manager + Engineer, Engineer passes only Engineer
export const ROLE_HIERARCHY: Record<string, string[]> = {
  SuperAdmin: ['SuperAdmin', 'TenderingManager', 'TenderingEngineer'],
  TenderingManager: ['TenderingManager', 'TenderingEngineer'],
  TenderingEngineer: ['TenderingEngineer'],
};

// =====================
// Permission Constants
// =====================

export const Permissions = {
  // UserManagement
  'Users.View': 'Users.View',
  'Users.Create': 'Users.Create',
  'Users.Edit': 'Users.Edit',
  'Users.Delete': 'Users.Delete',
  'Users.ResetPassword': 'Users.ResetPassword',
  // RoleManagement
  'Roles.View': 'Roles.View',
  'Roles.Create': 'Roles.Create',
  'Roles.Edit': 'Roles.Edit',
  'Roles.Delete': 'Roles.Delete',
  'Roles.AssignPermissions': 'Roles.AssignPermissions',
  // PermissionManagement
  'Permissions.View': 'Permissions.View',
  'Permissions.Create': 'Permissions.Create',
  'Permissions.Edit': 'Permissions.Edit',
  'Permissions.Delete': 'Permissions.Delete',
  // Projects
  'Projects.View': 'Projects.View',
  'Projects.ViewAll': 'Projects.ViewAll',
  'Projects.Create': 'Projects.Create',
  'Projects.Edit': 'Projects.Edit',
  'Projects.Delete': 'Projects.Delete',
  'Projects.Approve': 'Projects.Approve',
  'Projects.ManageCollaborators': 'Projects.ManageCollaborators',
  'Projects.ChangeStatus': 'Projects.ChangeStatus',
  // Panels
  'Panels.View': 'Panels.View',
  'Panels.Create': 'Panels.Create',
  'Panels.Edit': 'Panels.Edit',
  'Panels.Delete': 'Panels.Delete',
  'Panels.ManageCollaborators': 'Panels.ManageCollaborators',
  'Panels.ChangeStatus': 'Panels.ChangeStatus',
  'Panels.Duplicate': 'Panels.Duplicate',
  // Pricing
  'Pricing.View': 'Pricing.View',
  'Pricing.Modify': 'Pricing.Modify',
  'Discounts.Apply': 'Discounts.Apply',
  'Discounts.ApplyGlobal': 'Discounts.ApplyGlobal',
  // Materials
  'Materials.View': 'Materials.View',
  'Materials.Create': 'Materials.Create',
  'Materials.Edit': 'Materials.Edit',
  'Materials.Delete': 'Materials.Delete',
  'Materials.Import': 'Materials.Import',
  // Offers
  'Offers.View': 'Offers.View',
  'Offers.Generate': 'Offers.Generate',
  'Offers.Export': 'Offers.Export',
  // System
  'AuditLogs.View': 'AuditLogs.View',
  'System.Configure': 'System.Configure',
} as const;

export type PermissionName = (typeof Permissions)[keyof typeof Permissions];

// =====================
// Minimum Role (kept for backward compatibility)
// =====================

export type MinimumRole = 'SuperAdmin' | 'TenderingManager' | 'TenderingEngineer' | 'Authenticated';

// =====================
// Permission-Based Page Access
// Maps each page/route to the permissions that grant access.
// A user can see/access a page if they have ANY of the listed permissions.
// Empty array = visible to any authenticated user (no specific permission needed).
//
// This is the SINGLE SOURCE OF TRUTH for page visibility.
// When the SuperAdmin changes a user's permissions, the UI adapts automatically.
// =====================

export const PAGE_PERMISSIONS: Record<string, string[]> = {
  // Core pages — no specific permission required
  '/dashboard': [],
  '/profile': [],
  '/settings': [],

  // Business pages — visible if user has any related permission
  '/projects': [
    Permissions['Projects.View'],
    Permissions['Projects.Create'],
    Permissions['Projects.Edit'],
    Permissions['Projects.Delete'],
    Permissions['Projects.ViewAll'],
    Permissions['Projects.Approve'],
    Permissions['Projects.ManageCollaborators'],
    Permissions['Projects.ChangeStatus'],
  ],
  '/materials': [
    Permissions['Materials.View'],
    Permissions['Materials.Create'],
    Permissions['Materials.Edit'],
    Permissions['Materials.Delete'],
    Permissions['Materials.Import'],
  ],
  '/offers': [
    Permissions['Offers.View'],
    Permissions['Offers.Generate'],
    Permissions['Offers.Export'],
  ],
  '/import': [
    Permissions['Materials.Import'],
  ],

  // Admin pages — visible if user has any related admin permission
  '/admin/users': [
    Permissions['Users.View'],
    Permissions['Users.Create'],
    Permissions['Users.Edit'],
    Permissions['Users.Delete'],
    Permissions['Users.ResetPassword'],
  ],
  '/admin/roles': [
    Permissions['Roles.View'],
    Permissions['Roles.Create'],
    Permissions['Roles.Edit'],
    Permissions['Roles.Delete'],
    Permissions['Roles.AssignPermissions'],
  ],
  '/admin/permissions': [
    Permissions['Permissions.View'],
    Permissions['Permissions.Create'],
    Permissions['Permissions.Edit'],
    Permissions['Permissions.Delete'],
  ],
  '/admin/audit-logs': [
    Permissions['AuditLogs.View'],
  ],
};

// =====================
// Authorization Check Functions
// =====================

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserDto | null, role: string): boolean {
  return user?.roles?.includes(role) ?? false;
}

/**
 * Check if user has any of the given roles
 */
export function hasAnyRole(user: UserDto | null, roles: string[]): boolean {
  return roles.some((role) => user?.roles?.includes(role) ?? false);
}

/**
 * Check if user has all of the given roles
 */
export function hasAllRoles(user: UserDto | null, roles: string[]): boolean {
  return roles.every((role) => user?.roles?.includes(role) ?? false);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserDto | null, permission: string): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(user: UserDto | null, permissions: string[]): boolean {
  return permissions.some((perm) => user?.permissions?.includes(perm) ?? false);
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(user: UserDto | null, permissions: string[]): boolean {
  return permissions.every((perm) => user?.permissions?.includes(perm) ?? false);
}

/**
 * Check if user meets the minimum role requirement (respects role hierarchy).
 * For example, a SuperAdmin meets the TenderingManager requirement.
 */
export function meetsMinimumRole(user: UserDto | null, minimumRole: MinimumRole): boolean {
  if (!user) return false;
  if (minimumRole === 'Authenticated') return true;

  // User passes if any of their roles includes the minimumRole in its hierarchy
  return (user.roles ?? []).some((userRole) => {
    const passesFor = ROLE_HIERARCHY[userRole];
    return passesFor?.includes(minimumRole) ?? false;
  });
}

/**
 * Check if user is a SuperAdmin
 */
export function isSuperAdmin(user: UserDto | null): boolean {
  return hasRole(user, SystemRoles.SuperAdmin);
}

/**
 * Check if user is at least a TenderingManager (or SuperAdmin)
 */
export function isManagerOrAbove(user: UserDto | null): boolean {
  return hasAnyRole(user, [SystemRoles.SuperAdmin, SystemRoles.TenderingManager]);
}

/**
 * Check if user can access a given page path (permission-based).
 * Returns true if the page has no required permissions (public to authenticated users)
 * or if the user has ANY of the required permissions.
 */
export function canAccessPage(user: UserDto | null, path: string): boolean {
  if (!user) return false;

  // Find the most specific matching route
  const matchingPaths = Object.keys(PAGE_PERMISSIONS)
    .filter((routePath) => path.startsWith(routePath))
    .sort((a, b) => b.length - a.length); // Most specific first

  if (matchingPaths.length === 0) return true; // No restriction defined

  const requiredPermissions = PAGE_PERMISSIONS[matchingPaths[0]];
  if (requiredPermissions.length === 0) return true; // Empty = any authenticated user

  return hasAnyPermission(user, requiredPermissions);
}

/**
 * Get the permissions required for a page path.
 * Returns undefined if no page config exists for the path.
 */
export function getPagePermissions(path: string): string[] | undefined {
  const matchingPaths = Object.keys(PAGE_PERMISSIONS)
    .filter((routePath) => path.startsWith(routePath))
    .sort((a, b) => b.length - a.length);

  if (matchingPaths.length === 0) return undefined;
  return PAGE_PERMISSIONS[matchingPaths[0]];
}

/**
 * @deprecated Use canAccessPage() instead — permission-based access control.
 */
export function canAccessRoute(user: UserDto | null, path: string): boolean {
  return canAccessPage(user, path);
}
