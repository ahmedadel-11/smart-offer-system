import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AppLayout } from '../components';

// Import pages directly (no lazy loading to avoid Suspense issues)
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { ProjectsPage } from '../pages/Projects/ProjectsPage';
import { ProjectDetailPage } from '../pages/Projects/ProjectDetailPage';
import { ProjectEditPage } from '../pages/Projects/ProjectEditPage';
import { MaterialsPage } from '../pages/Materials/MaterialsPage';
import { PanelDesignerPage } from '../pages/PanelDesigner/PanelDesignerPage';
import { OfferGeneratorPage } from '../pages/OfferGenerator/OfferGeneratorPage';
import { OffersPage } from '../pages/Offers/OffersPage';
import { ImportPage } from '../pages/Import/ImportPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';

// Auth & RBAC pages
import { LoginPage } from '../pages/Login/LoginPage';
import { ProfilePage } from '../pages/Profile/ProfilePage';
import { UserManagementPage } from '../pages/Admin/UserManagementPage';
import { RoleManagementPage } from '../pages/Admin/RoleManagementPage';
import { PermissionManagementPage } from '../pages/Admin/PermissionManagementPage';
import { AuditLogsPage } from '../pages/Admin/AuditLogsPage';

// Auth guards
import { ProtectedRoute } from '../components/auth/ProtectedRoute';



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
    element: <LoginPage />,
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
        element: <DashboardPage />,
      },
      // Projects — requires any Projects.* permission
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredPermissions={['Projects.Edit']}>
                <ProjectEditPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/offer',
            element: (
              <ProtectedRoute requiredPermissions={['Offers.View', 'Offers.Generate', 'Offers.Export']}>
                <OfferGeneratorPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/panel/:panelId',
            element: (
              <ProtectedRoute requiredPermissions={['Panels.View', 'Panels.Edit', 'Panels.Create']}>
                <PanelDesignerPage />
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
            <MaterialsPage />
          </ProtectedRoute>
        ),
      },
      // Offers — requires any Offers.* permission
      {
        path: 'offers',
        element: (
          <ProtectedRoute>
            <OffersPage />
          </ProtectedRoute>
        ),
      },
      // Import — requires Materials.Import permission
      {
        path: 'import',
        element: (
          <ProtectedRoute>
            <ImportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // Admin routes — requires respective admin permissions
      {
        path: 'admin',
        children: [
          {
            path: 'users',
            element: (
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'roles',
            element: (
              <ProtectedRoute>
                <RoleManagementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'permissions',
            element: (
              <ProtectedRoute>
                <PermissionManagementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'audit-logs',
            element: (
              <ProtectedRoute>
                <AuditLogsPage />
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
