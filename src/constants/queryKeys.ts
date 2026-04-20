/**
 * React Query Key Factory
 * Centralized query key management for consistent cache invalidation
 * Reference: https://tanstack.com/query/latest/docs/react/important-defaults
 */

export const queryKeys = {
  // Materials
  materials: {
    all: ['materials'] as const,
    lists: () => [...queryKeys.materials.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.materials.lists(), filters] as const,
    details: () => [...queryKeys.materials.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.materials.details(), id] as const,
    categories: () => [...queryKeys.materials.all, 'categories'] as const,
    brands: () => [...queryKeys.materials.all, 'brands'] as const,
  },

  // Packages
  packages: {
    all: ['packages'] as const,
    lists: () => [...queryKeys.packages.all, 'list'] as const,
    list: () => [...queryKeys.packages.lists()] as const,
    details: () => [...queryKeys.packages.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.packages.details(), id] as const,
    searches: () => [...queryKeys.packages.all, 'search'] as const,
    search: (term: string) => [...queryKeys.packages.searches(), term] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.projects.details(), id] as const,
  },

  // Panels
  panels: {
    all: ['panels'] as const,
    lists: () => [...queryKeys.panels.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.panels.lists(), filters] as const,
    details: () => [...queryKeys.panels.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.panels.details(), id] as const,
  },

  // Panel Items
  panelItems: {
    all: ['panelItems'] as const,
    lists: () => [...queryKeys.panelItems.all, 'list'] as const,
    list: (panelId?: string | number) =>
      [...queryKeys.panelItems.lists(), panelId] as const,
    details: () => [...queryKeys.panelItems.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.panelItems.details(), id] as const,
  },

  // Offers
  offers: {
    all: ['offers'] as const,
    lists: () => [...queryKeys.offers.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.offers.lists(), filters] as const,
    details: () => [...queryKeys.offers.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.offers.details(), id] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.users.details(), id] as const,
  },

  // Roles
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: () => [...queryKeys.roles.lists()] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.roles.details(), id] as const,
  },

  // Permissions
  permissions: {
    all: ['permissions'] as const,
    lists: () => [...queryKeys.permissions.all, 'list'] as const,
    list: () => [...queryKeys.permissions.lists()] as const,
  },

  // Audit Logs
  auditLogs: {
    all: ['auditLogs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.auditLogs.lists(), filters] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    overview: () => [...queryKeys.dashboard.all, 'overview'] as const,
  },

  // Auth
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },
} as const;

// Derived types for better TypeScript support
export type QueryKeys = typeof queryKeys;
