# User Management & Role-Based Access Control (RBAC) - Frontend Documentation

## 📋 Overview

This document describes the User Management and Role-Based Access Control system for SmartOffer. The frontend must implement:

1. **Authentication** - Login page with JWT-based authentication
2. **User Management** - CRUD operations for users (Super Admin only)
3. **Role Management** - CRUD operations for roles (Super Admin only)
4. **Permission Management** - CRUD operations for permissions (Super Admin only)
5. **Audit Logs** - View system activity logs (Super Admin only)
6. **Profile** - User profile and password change

---

## 🔐 Authentication Flow

### Login Flow
```
Login Page → Enter Email/Username + Password → Submit
→ API validates credentials → Returns JWT Token + User Info
→ Store token in localStorage/sessionStorage → Redirect to Dashboard
```

### Token Management
- **Access Token**: Short-lived JWT (60 minutes), sent in `Authorization: Bearer {token}` header
- **Refresh Token**: Long-lived token (7 days), used to get new access token
- **Auto-refresh**: Refresh token before expiration
- **Logout**: Clears tokens and redirects to login

### Protected Routes
- All routes except `/login` require authentication
- Role-based route protection (e.g., `/admin/*` requires SuperAdmin role)
- Redirect to login if token is invalid/expired

---

## 📦 TypeScript Interfaces

### Authentication Types

```typescript
// Login Request
interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

// Login Response
interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
  user: UserDto;
}

// Refresh Token Request
interface RefreshTokenRequest {
  refreshToken: string;
}

// Change Password Request
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Reset Password Request (Admin only)
interface ResetPasswordRequest {
  userId: string; // GUID
  newPassword: string;
}
```

### User Types

```typescript
interface UserDto {
  id: string; // GUID
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  lastLoginAt: string | null;
  roles: string[];
  permissions: string[];
}

interface CreateUserDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  isActive: boolean;
  roleIds: string[]; // Array of Role GUIDs
}

interface UpdateUserDto {
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
}

interface AssignRolesDto {
  roleIds: string[]; // Array of Role GUIDs
}
```

### Role Types

```typescript
interface RoleDto {
  id: string; // GUID
  name: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  permissions: string[];
}

interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds: string[]; // Array of Permission GUIDs
}

interface UpdateRoleDto {
  name: string;
  description?: string;
}

interface AssignPermissionsDto {
  permissionIds: string[]; // Array of Permission GUIDs
}
```

### Permission Types

```typescript
interface PermissionDto {
  id: string; // GUID
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}

interface CreatePermissionDto {
  name: string;
  description?: string;
  category: string;
}

interface UpdatePermissionDto {
  name: string;
  description?: string;
  category: string;
}
```

### Audit Log Types

```typescript
interface AuditLogDto {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  timestamp: string;
}

interface AuditLogFilter {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}
```

### Auth Context Type

```typescript
interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}
```

---

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Login with credentials | No |
| `POST` | `/api/auth/refresh` | Refresh access token | No |
| `POST` | `/api/auth/change-password` | Change current user's password | Yes |
| `POST` | `/api/auth/reset-password` | Reset another user's password | Yes (SuperAdmin) |
| `POST` | `/api/auth/logout` | Logout current user | Yes |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | Get all users | Yes (SuperAdmin) |
| `GET` | `/api/users/{id}` | Get user by ID | Yes (SuperAdmin) |
| `GET` | `/api/users/me` | Get current user profile | Yes |
| `POST` | `/api/users` | Create new user | Yes (SuperAdmin) |
| `PUT` | `/api/users/{id}` | Update user | Yes (SuperAdmin) |
| `DELETE` | `/api/users/{id}` | Delete user | Yes (SuperAdmin) |
| `POST` | `/api/users/{id}/activate` | Activate user | Yes (SuperAdmin) |
| `POST` | `/api/users/{id}/deactivate` | Deactivate user | Yes (SuperAdmin) |
| `POST` | `/api/users/{id}/roles` | Assign roles to user | Yes (SuperAdmin) |
| `GET` | `/api/users/{id}/permissions` | Get user's permissions | Yes (SuperAdmin) |

### Role Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/roles` | Get all roles | Yes (SuperAdmin) |
| `GET` | `/api/roles/{id}` | Get role by ID | Yes (SuperAdmin) |
| `POST` | `/api/roles` | Create new role | Yes (SuperAdmin) |
| `PUT` | `/api/roles/{id}` | Update role | Yes (SuperAdmin) |
| `DELETE` | `/api/roles/{id}` | Delete role | Yes (SuperAdmin) |
| `POST` | `/api/roles/{id}/permissions` | Assign permissions to role | Yes (SuperAdmin) |

### Permission Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/permissions` | Get all permissions | Yes (SuperAdmin) |
| `GET` | `/api/permissions/{id}` | Get permission by ID | Yes (SuperAdmin) |
| `GET` | `/api/permissions/category/{category}` | Get by category | Yes (SuperAdmin) |
| `GET` | `/api/permissions/categories` | Get all categories | Yes (SuperAdmin) |
| `POST` | `/api/permissions` | Create permission | Yes (SuperAdmin) |
| `PUT` | `/api/permissions/{id}` | Update permission | Yes (SuperAdmin) |
| `DELETE` | `/api/permissions/{id}` | Delete permission | Yes (SuperAdmin) |

### Audit Log Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/auditlogs` | Get audit logs (with filters) | Yes (SuperAdmin) |
| `GET` | `/api/auditlogs/user/{userId}` | Get logs for specific user | Yes (SuperAdmin) |

---

## 📄 Required Pages

### 1. Login Page (`/login`)

**Purpose**: Authenticate users

**UI Elements**:
- Logo/Brand header
- Email or Username input field
- Password input field (with show/hide toggle)
- "Remember me" checkbox (optional)
- Login button
- Error message display area
- Loading state on submit

**Validation**:
- Email/Username: Required
- Password: Required, min 6 characters

**Wireframe**:
```
┌─────────────────────────────────────────┐
│                                         │
│            🔌 SmartOffer                │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  📧 Email or Username           │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  🔒 Password              👁️    │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ☐ Remember me                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │           LOGIN                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ⚠️ Invalid credentials (error)        │
│                                         │
└─────────────────────────────────────────┘
```

**Error Handling**:
- Invalid credentials: "Invalid email/username or password"
- Account locked: "Account is locked. Try again after {time}"
- Account deactivated: "Your account has been deactivated"
- Network error: "Unable to connect to server"

---

### 2. User Management Page (`/admin/users`)

**Purpose**: View and manage all users (Super Admin only)

**UI Elements**:
- Page title: "User Management"
- "Add User" button (opens modal/drawer)
- Search input (filter by name/email/username)
- Filter by status (All, Active, Inactive)
- Filter by role dropdown
- Users table with columns:
  - Full Name
  - Email
  - Username
  - Roles (badges)
  - Status (Active/Inactive badge)
  - Last Login
  - Actions (Edit, Activate/Deactivate, Reset Password, Delete)
- Pagination

**Wireframe**:
```
┌────────────────────────────────────────────────────────────────────┐
│  User Management                                    [+ Add User]   │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Search...          [All ▼]  [All Roles ▼]                      │
├────────────────────────────────────────────────────────────────────┤
│  Full Name    │ Email           │ Username │ Roles      │ Status  │ Actions │
│───────────────┼─────────────────┼──────────┼────────────┼─────────┼─────────│
│  John Doe     │ john@email.com  │ johndoe  │ 🏷️ Admin   │ 🟢 Active│ ⋮      │
│  Jane Smith   │ jane@email.com  │ jsmith   │ 🏷️ Engineer│ 🟢 Active│ ⋮      │
│  Bob Wilson   │ bob@email.com   │ bwilson  │ 🏷️ Manager │ 🔴 Inactive│ ⋮    │
├────────────────────────────────────────────────────────────────────┤
│  « 1 2 3 4 5 »                                  Showing 1-10 of 50 │
└────────────────────────────────────────────────────────────────────┘
```

**Actions Menu** (⋮):
- Edit User
- Assign Roles
- Reset Password
- Activate/Deactivate
- Delete (with confirmation)

---

### 3. Create/Edit User Modal

**UI Elements**:
- Modal title: "Create User" or "Edit User"
- Full Name input (required)
- Email input (required, email format)
- Username input (required, alphanumeric)
- Password input (required for create, hidden for edit)
- Confirm Password input (required for create)
- Active toggle switch
- Role selection (multi-select dropdown or checkboxes)
- Cancel and Save buttons

**Validation**:
- Full Name: Required, 2-200 characters
- Email: Required, valid email format, unique
- Username: Required, 3-100 characters, alphanumeric, unique
- Password: Required (create), min 8 chars, must contain uppercase, lowercase, number, special char

---

### 4. Assign Roles Modal

**UI Elements**:
- Modal title: "Assign Roles to {User Name}"
- List of all roles with checkboxes
- System roles indicator (🔒)
- Role description on hover
- Current roles pre-selected
- Cancel and Save buttons

---

### 5. Reset Password Modal

**UI Elements**:
- Modal title: "Reset Password for {User Name}"
- New Password input
- Confirm Password input
- Password requirements hint
- Cancel and Reset buttons

---

### 6. Role Management Page (`/admin/roles`)

**Purpose**: View and manage roles (Super Admin only)

**UI Elements**:
- Page title: "Role Management"
- "Add Role" button
- Roles table:
  - Role Name
  - Description
  - Permissions count
  - Users count
  - System Role badge
  - Actions (Edit, Manage Permissions, Delete)

**Wireframe**:
```
┌────────────────────────────────────────────────────────────────────┐
│  Role Management                                    [+ Add Role]   │
├────────────────────────────────────────────────────────────────────┤
│  Role Name        │ Description              │ Perms │ Users │ Actions │
│───────────────────┼──────────────────────────┼───────┼───────┼─────────│
│  🔒 SuperAdmin    │ Full system access       │  42   │   1   │    ⋮    │
│  🔒 TenderingMgr  │ Manager with pricing...  │  21   │   3   │    ⋮    │
│  🔒 TenderingEng  │ Engineer with project... │  11   │   8   │    ⋮    │
│  Custom Role      │ Custom permissions       │   5   │   2   │    ⋮    │
└────────────────────────────────────────────────────────────────────┘
```

**Note**: System roles (🔒) cannot be edited or deleted.

---

### 7. Create/Edit Role Modal

**UI Elements**:
- Role Name input (required)
- Description textarea
- Permission selection (grouped by category)
- Cancel and Save buttons

---

### 8. Manage Role Permissions Modal

**UI Elements**:
- Modal title: "Manage Permissions for {Role Name}"
- Permissions grouped by category (accordion/tabs)
- Checkbox for each permission
- Select All / Deselect All per category
- Permission description on hover
- Cancel and Save buttons

**Permission Categories**:
- User Management
- Role Management
- Permission Management
- Projects
- Panels
- Pricing
- Materials
- Offers
- System

---

### 9. Permission Management Page (`/admin/permissions`)

**Purpose**: View and manage permissions (Super Admin only)

**UI Elements**:
- Page title: "Permission Management"
- "Add Permission" button
- Filter by category dropdown
- Permissions table:
  - Permission Name
  - Description
  - Category
  - Used by (roles count)
  - Actions (Edit, Delete)

---

### 10. Audit Logs Page (`/admin/audit-logs`)

**Purpose**: View system activity logs (Super Admin only)

**UI Elements**:
- Page title: "Audit Logs"
- Filters:
  - User dropdown
  - Action type dropdown
  - Entity type dropdown
  - Date range picker
- Logs table:
  - Timestamp
  - User
  - Action
  - Entity Type
  - Entity ID
  - Details (expandable)
- Pagination
- Export to CSV button (optional)

**Wireframe**:
```
┌────────────────────────────────────────────────────────────────────┐
│  Audit Logs                                         [Export CSV]   │
├────────────────────────────────────────────────────────────────────┤
│  [All Users ▼]  [All Actions ▼]  [All Entities ▼]  📅 Date Range   │
├────────────────────────────────────────────────────────────────────┤
│  Timestamp        │ User      │ Action        │ Entity  │ Details  │
│───────────────────┼───────────┼───────────────┼─────────┼──────────│
│  2024-01-15 14:30 │ admin     │ UserCreated   │ User    │   👁️     │
│  2024-01-15 14:25 │ admin     │ RolesAssigned │ User    │   👁️     │
│  2024-01-15 14:20 │ john.doe  │ Login         │ User    │   👁️     │
│  2024-01-15 14:15 │ admin     │ PriceModified │ Material│   👁️     │
├────────────────────────────────────────────────────────────────────┤
│  « 1 2 3 4 5 »                                Showing 1-50 of 1234 │
└────────────────────────────────────────────────────────────────────┘
```

**Log Detail Modal**:
- Full action details
- Old values (JSON)
- New values (JSON)
- IP Address
- Timestamp

---

### 11. User Profile Page (`/profile`)

**Purpose**: View and update current user's profile

**UI Elements**:
- Profile header with avatar/initials
- User info display:
  - Full Name
  - Email
  - Username
  - Roles (badges)
  - Member since
  - Last login
- "Change Password" button
- Edit profile option (name only)

---

### 12. Change Password Modal

**UI Elements**:
- Current Password input
- New Password input
- Confirm New Password input
- Password requirements checklist
- Cancel and Change Password buttons

**Password Requirements Display**:
- ✓/✗ At least 8 characters
- ✓/✗ Contains uppercase letter
- ✓/✗ Contains lowercase letter
- ✓/✗ Contains number
- ✓/✗ Contains special character

---

## 🧩 Required Components

### Authentication Components

```typescript
// Components to create
components/
├── auth/
│   ├── LoginForm.tsx           // Login form with validation
│   ├── PasswordInput.tsx       // Password input with show/hide
│   ├── ProtectedRoute.tsx      // Route wrapper for auth check
│   ├── RoleGuard.tsx           // Component wrapper for role check
│   └── PermissionGuard.tsx     // Component wrapper for permission check
```

### User Management Components

```typescript
components/
├── users/
│   ├── UserTable.tsx           // Users data table
│   ├── UserForm.tsx            // Create/Edit user form
│   ├── UserStatusBadge.tsx     // Active/Inactive badge
│   ├── AssignRolesModal.tsx    // Assign roles modal
│   ├── ResetPasswordModal.tsx  // Reset password modal
│   └── UserActions.tsx         // Actions dropdown menu
```

### Role Management Components

```typescript
components/
├── roles/
│   ├── RoleTable.tsx           // Roles data table
│   ├── RoleForm.tsx            // Create/Edit role form
│   ├── SystemRoleBadge.tsx     // System role indicator
│   ├── PermissionSelector.tsx  // Permission multi-select
│   └── RoleActions.tsx         // Actions dropdown menu
```

### Permission Components

```typescript
components/
├── permissions/
│   ├── PermissionTable.tsx     // Permissions data table
│   ├── PermissionForm.tsx      // Create/Edit permission form
│   ├── PermissionGroup.tsx     // Grouped permissions by category
│   └── CategoryBadge.tsx       // Permission category badge
```

### Audit Components

```typescript
components/
├── audit/
│   ├── AuditLogTable.tsx       // Audit logs data table
│   ├── AuditLogFilters.tsx     // Filter controls
│   ├── AuditLogDetail.tsx      // Log detail modal
│   └── JsonDiffViewer.tsx      // Old/New values comparison
```

### Shared Components

```typescript
components/
├── shared/
│   ├── ConfirmDialog.tsx       // Confirmation dialog
│   ├── StatusBadge.tsx         // Colored status badge
│   ├── RoleBadge.tsx           // Role badge with color
│   ├── DateRangePicker.tsx     // Date range selection
│   └── MultiSelect.tsx         // Multi-select dropdown
```

---

## 🎨 Design Specifications

### Color Scheme for Status/Roles

| Element | Color | Hex |
|---------|-------|-----|
| Active Status | Green | `#4CAF50` |
| Inactive Status | Red | `#F44336` |
| SuperAdmin Role | Purple | `#9C27B0` |
| TenderingManager Role | Blue | `#2196F3` |
| TenderingEngineer Role | Teal | `#009688` |
| Custom Role | Grey | `#607D8B` |
| System Role Lock Icon | Orange | `#FF9800` |

### Action Colors

| Action | Color | Hex |
|--------|-------|-----|
| Create/Add | Primary Blue | `#1976D2` |
| Edit | Blue | `#2196F3` |
| Delete | Red | `#F44336` |
| Activate | Green | `#4CAF50` |
| Deactivate | Orange | `#FF9800` |
| Reset Password | Purple | `#9C27B0` |

### Permission Category Colors

| Category | Color |
|----------|-------|
| UserManagement | `#E91E63` (Pink) |
| RoleManagement | `#9C27B0` (Purple) |
| PermissionManagement | `#673AB7` (Deep Purple) |
| Projects | `#3F51B5` (Indigo) |
| Panels | `#2196F3` (Blue) |
| Pricing | `#FF9800` (Orange) |
| Materials | `#4CAF50` (Green) |
| Offers | `#00BCD4` (Cyan) |
| System | `#607D8B` (Blue Grey) |

---

## 🔒 Authorization Rules

### Route Access by Role

| Route | SuperAdmin | TenderingManager | TenderingEngineer |
|-------|------------|------------------|-------------------|
| `/login` | ✓ (redirect if logged in) | ✓ | ✓ |
| `/dashboard` | ✓ | ✓ | ✓ |
| `/projects` | ✓ | ✓ | ✓ |
| `/admin/users` | ✓ | ✗ | ✗ |
| `/admin/roles` | ✓ | ✗ | ✗ |
| `/admin/permissions` | ✓ | ✗ | ✗ |
| `/admin/audit-logs` | ✓ | ✗ | ✗ |
| `/profile` | ✓ | ✓ | ✓ |

### UI Element Visibility

```typescript
// Examples of conditional rendering
{hasRole('SuperAdmin') && <AdminMenu />}
{hasPermission('Users.Create') && <AddUserButton />}
{hasPermission('Pricing.Modify') && <EditPriceButton />}
{hasAnyPermission(['Discounts.Apply', 'Discounts.ApplyGlobal']) && <ApplyDiscountButton />}
```

---

## 🔄 State Management

### Auth State (Context or Zustand/Redux)

```typescript
interface AuthState {
  user: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions
type AuthActions = {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  loadUserFromStorage: () => void;
  clearError: () => void;
};
```

### Token Storage

```typescript
// Store tokens securely
const TOKEN_KEY = 'smartoffer_token';
const REFRESH_TOKEN_KEY = 'smartoffer_refresh_token';
const USER_KEY = 'smartoffer_user';

// On login success
localStorage.setItem(TOKEN_KEY, response.token);
localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
localStorage.setItem(USER_KEY, JSON.stringify(response.user));

// On logout
localStorage.removeItem(TOKEN_KEY);
localStorage.removeItem(REFRESH_TOKEN_KEY);
localStorage.removeItem(USER_KEY);
```

### API Interceptor Setup

```typescript
// Axios interceptor for adding auth header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await api.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem(TOKEN_KEY, response.data.token);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.token}`;
          return api.request(error.config);
        } catch {
          // Refresh failed, logout
          logout();
          window.location.href = '/login';
        }
      } else {
        logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 📱 React Query Hooks

```typescript
// Auth hooks
const useLogin = () => useMutation({
  mutationFn: (data: LoginRequest) => authApi.login(data),
  onSuccess: (data) => { /* store tokens, redirect */ }
});

// User hooks
const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: () => userApi.getAll()
});

const useUser = (id: string) => useQuery({
  queryKey: ['users', id],
  queryFn: () => userApi.getById(id)
});

const useCreateUser = () => useMutation({
  mutationFn: (data: CreateUserDto) => userApi.create(data),
  onSuccess: () => queryClient.invalidateQueries(['users'])
});

const useUpdateUser = () => useMutation({
  mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => 
    userApi.update(id, data),
  onSuccess: () => queryClient.invalidateQueries(['users'])
});

const useDeleteUser = () => useMutation({
  mutationFn: (id: string) => userApi.delete(id),
  onSuccess: () => queryClient.invalidateQueries(['users'])
});

// Similar hooks for roles, permissions, audit logs...
```

---

## 🧪 Test Credentials

| Role | Email | Username | Password |
|------|-------|----------|----------|
| Super Admin | admin@smartoffer.com | admin | Admin@123! |

---

## ✅ Implementation Checklist

### Phase 1: Authentication
- [ ] Create Auth Context/Store
- [ ] Implement Login Page
- [ ] Implement ProtectedRoute component
- [ ] Add API interceptors for token handling
- [ ] Add logout functionality
- [ ] Handle token refresh

### Phase 2: User Management
- [ ] Users list page
- [ ] Create user modal
- [ ] Edit user modal
- [ ] Assign roles modal
- [ ] Reset password modal
- [ ] Activate/Deactivate functionality
- [ ] Delete user with confirmation

### Phase 3: Role Management
- [ ] Roles list page
- [ ] Create role modal
- [ ] Edit role modal
- [ ] Manage permissions modal
- [ ] Delete role with confirmation

### Phase 4: Permission Management
- [ ] Permissions list page
- [ ] Create permission modal
- [ ] Edit permission modal
- [ ] Delete permission with confirmation

### Phase 5: Audit & Profile
- [ ] Audit logs page with filters
- [ ] Log detail modal
- [ ] User profile page
- [ ] Change password functionality

### Phase 6: Authorization
- [ ] Role-based route guards
- [ ] Permission-based UI visibility
- [ ] Admin navigation menu

---

## 🚀 API Service Implementation

```typescript
// services/authService.ts
export const authService = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/api/auth/login', data),
  
  refresh: (data: RefreshTokenRequest) => 
    api.post<LoginResponse>('/api/auth/refresh', data),
  
  changePassword: (data: ChangePasswordRequest) => 
    api.post('/api/auth/change-password', data),
  
  resetPassword: (data: ResetPasswordRequest) => 
    api.post('/api/auth/reset-password', data),
  
  logout: () => 
    api.post('/api/auth/logout')
};

// services/userService.ts
export const userService = {
  getAll: () => 
    api.get<UserDto[]>('/api/users'),
  
  getById: (id: string) => 
    api.get<UserDto>(`/api/users/${id}`),
  
  getMe: () => 
    api.get<UserDto>('/api/users/me'),
  
  create: (data: CreateUserDto) => 
    api.post<UserDto>('/api/users', data),
  
  update: (id: string, data: UpdateUserDto) => 
    api.put<UserDto>(`/api/users/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/api/users/${id}`),
  
  activate: (id: string) => 
    api.post(`/api/users/${id}/activate`),
  
  deactivate: (id: string) => 
    api.post(`/api/users/${id}/deactivate`),
  
  assignRoles: (id: string, data: AssignRolesDto) => 
    api.post(`/api/users/${id}/roles`, data),
  
  getPermissions: (id: string) => 
    api.get<string[]>(`/api/users/${id}/permissions`)
};

// Similar services for roles, permissions, auditLogs...
```

---

## 📝 Notes for Frontend Developer

1. **Security**: Never store sensitive data in localStorage in production. Consider using httpOnly cookies for tokens.

2. **Token Refresh**: Implement proactive token refresh (e.g., 5 minutes before expiration).

3. **Error Handling**: Show user-friendly error messages, not raw API errors.

4. **Loading States**: Always show loading indicators during API calls.

5. **Optimistic Updates**: Consider optimistic updates for better UX (especially for toggles like activate/deactivate).

6. **Form Validation**: Use a form library (React Hook Form, Formik) with Yup/Zod for validation.

7. **Accessibility**: Ensure forms are accessible (proper labels, ARIA attributes, keyboard navigation).

8. **Responsive Design**: Admin pages should work on desktop; mobile support is secondary.

9. **Navigation**: Add admin menu items only visible to SuperAdmin role.

---

**Questions?** Refer to the backend API Swagger documentation at `/swagger` for detailed endpoint information.
