import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AppLayout } from '../components';

// Lazy load pages to reduce initial bundle size (~30-40KB savings)
// This enables code splitting: each route is in a separate chunk
const DashboardPage = React.lazy(() =>
  import('../pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage }))
);
const ProjectsPage = React.lazy(() =>
  import('../pages/Projects/ProjectsPage').then(m => ({ default: m.ProjectsPage }))
);
const ProjectDetailPage = React.lazy(() =>
  import('../pages/Projects/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage }))
);
const ProjectEditPage = React.lazy(() =>
  import('../pages/Projects/ProjectEditPage').then(m => ({ default: m.ProjectEditPage }))
);
const PackagesPage = React.lazy(() =>
  import('../pages/Packages/PackagesPage').then(m => ({ default: m.PackagesPage }))
);
const PackageCreatePage = React.lazy(() =>
  import('../pages/Packages/PackageCreatePage').then(m => ({ default: m.PackageCreatePage }))
);
const PackageEditPage = React.lazy(() =>
  import('../pages/Packages/PackageEditPage').then(m => ({ default: m.PackageEditPage }))
);
const PackageDetailPage = React.lazy(() =>
  import('../pages/Packages/PackageDetailPage').then(m => ({ default: m.PackageDetailPage }))
);
const MaterialsPage = React.lazy(() =>
  import('../pages/Materials/MaterialsPage').then(m => ({ default: m.MaterialsPage }))
);
const PanelDesignerPage = React.lazy(() =>
  import('../pages/PanelDesigner/PanelDesignerPage').then(m => ({ default: m.PanelDesignerPage }))
);
const OfferGeneratorPage = React.lazy(() =>
  import('../pages/OfferGenerator/OfferGeneratorPage').then(m => ({ default: m.OfferGeneratorPage }))
);
const OffersPage = React.lazy(() =>
  import('../pages/Offers/OffersPage').then(m => ({ default: m.OffersPage }))
);
const ImportPage = React.lazy(() =>
  import('../pages/Import/ImportPage').then(m => ({ default: m.ImportPage }))
);
const SettingsPage = React.lazy(() =>
  import('../pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage }))
);
const CurrencyRatesPage = React.lazy(() =>
  import('../pages/Settings/CurrencyRatesPage').then(m => ({ default: m.CurrencyRatesPage }))
);
const LoginPage = React.lazy(() =>
  import('../pages/Login/LoginPage').then(m => ({ default: m.LoginPage }))
);
const ProfilePage = React.lazy(() =>
  import('../pages/Profile/ProfilePage').then(m => ({ default: m.ProfilePage }))
);
const UserManagementPage = React.lazy(() =>
  import('../pages/Admin/UserManagementPage').then(m => ({ default: m.UserManagementPage }))
);
const RoleManagementPage = React.lazy(() =>
  import('../pages/Admin/RoleManagementPage').then(m => ({ default: m.RoleManagementPage }))
);
const PermissionManagementPage = React.lazy(() =>
  import('../pages/Admin/PermissionManagementPage').then(m => ({ default: m.PermissionManagementPage }))
);
const AuditLogsPage = React.lazy(() =>
  import('../pages/Admin/AuditLogsPage').then(m => ({ default: m.AuditLogsPage }))
);

// Auth guards
import { ProtectedRoute } from '../components/auth/ProtectedRoute';


/**
 * Loading fallback component for lazy-loaded routes
 * Shown while a route chunk is being downloaded
 */
const RouteLoadingFallback: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '14px',
      color: '#666',
    }}
  >
    <span>Loading...</span>
  </div>
);

/**
 * Suspense wrapper for lazy routes
 * Wraps route elements in Suspense with loading fallback
 */
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense fallback={<RouteLoadingFallback />}>
    {children}
  </React.Suspense>
);

// Layout wrapper — requires authentication (any role)
const LayoutWrapper: React.FC = () => (
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
);

// Route definitions — permission-based access control.
// ProtectedRoute auto-resolves permissions from PAGE_PERMISSIONS in authorizationService.
// No roles are hardcoded here — everything adapts when a SuperAdmin changes a user's permissions.
const routes = [
  {
    path: '/login',
    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
  },
  {
    path: '/',
    element: <LayoutWrapper />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper>,
      },
      // Projects — requires any Projects.* permission
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><ProjectsPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><ProjectDetailPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredPermissions={['Projects.Edit']}>
                <SuspenseWrapper><ProjectEditPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/offer',
            element: (
              <ProtectedRoute requiredPermissions={['Offers.View', 'Offers.Generate', 'Offers.Export']}>
                <SuspenseWrapper><OfferGeneratorPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/panel/:panelId',
            element: (
              <ProtectedRoute requiredPermissions={['Panels.View', 'Panels.Edit', 'Panels.Create']}>
                <SuspenseWrapper><PanelDesignerPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },
      // Packages
      {
        path: 'packages',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermissions={['packages:view']}>
                <SuspenseWrapper><PackagesPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredPermissions={['packages:create']}>
                <SuspenseWrapper><PackageCreatePage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute requiredPermissions={['packages:view']}>
                <SuspenseWrapper><PackageDetailPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredPermissions={['packages:edit']}>
                <SuspenseWrapper><PackageEditPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },
      // Materials — requires any Materials.* permission
      {
        path: 'materials',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper><MaterialsPage /></SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      // Offers — requires any Offers.* permission
      {
        path: 'offers',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper><OffersPage /></SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      // Import — requires Materials.Import permission
      {
        path: 'import',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper><ImportPage /></SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><SettingsPage /></SuspenseWrapper>,
      },
      {
        path: 'settings/currency-rates',
        element: (
          <ProtectedRoute requiredPermissions={['CurrencyRates.View', 'CurrencyRates.Manage']}>
            <SuspenseWrapper><CurrencyRatesPage /></SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper>,
      },
      // Admin routes — requires respective admin permissions
      {
        path: 'admin',
        children: [
          {
            path: 'users',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><UserManagementPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'roles',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><RoleManagementPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'permissions',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><PermissionManagementPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
          {
            path: 'audit-logs',
            element: (
              <ProtectedRoute>
                <SuspenseWrapper><AuditLogsPage /></SuspenseWrapper>
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];

// Create router instance
export const router = createBrowserRouter(routes);

// Router component
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
