# Role & Permission-Based Authorization — SmartOffer Backend Reference

> **Audience:** Frontend developers and AI agents integrating with the SmartOffer API.  
> **Last Updated:** Based on `feature/project-panel-collaboration-audit` branch.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Entities](#database-entities)
4. [System Roles](#system-roles)
5. [All Permissions (39 + 5)](#all-permissions)
6. [Permissions Per Role — Full Matrix](#permissions-per-role--full-matrix)
7. [Authorization Policies](#authorization-policies)
8. [Controller → Policy Mapping](#controller--policy-mapping)
9. [JWT Token Structure](#jwt-token-structure)
10. [Role & Permission Management API](#role--permission-management-api)
11. [User Management API](#user-management-api)
12. [Business Rules & Constraints](#business-rules--constraints)
13. [Custom Roles](#custom-roles)
14. [RequirePermissionAttribute](#requirepermissionattribute)
15. [Seeded Data](#seeded-data)
16. [TypeScript Interfaces](#typescript-interfaces)
17. [Frontend Integration Guide](#frontend-integration-guide)
18. [Known Gaps & Notes](#known-gaps--notes)

---

## Overview

SmartOffer uses a **dual-layer authorization** model:

1. **Role-Based Access Control (RBAC)** — 3 system roles define hierarchical access tiers. Controllers use `[Authorize(Policy = "...")]` with role-based policies.
2. **Permission-Based Access Control** — 44 granular permissions are assigned to roles and embedded as JWT claims. Permission-based policies exist but are not currently enforced on controllers.

Both **role names** and **permission names** are embedded in the JWT access token as claims. The frontend can read them to show/hide UI elements.

---

## Architecture

```
User ──┬──► UserRole ──► Role ──┬──► RolePermission ──► Permission
       │                        │
       │    (many-to-many)      │    (many-to-many)
       │                        │
       └──► JWT Token           └──► Authorization Policy
            ├── ClaimTypes.Role: "SuperAdmin"
            ├── ClaimTypes.Role: "TenderingManager"
            └── "Permission": "Projects.View"
```

**Flow:**
1. User logs in → `AuthService` loads roles + permissions from DB
2. `JwtService.GenerateAccessToken` embeds role claims (`ClaimTypes.Role`) and permission claims (`"Permission"`)
3. Controller `[Authorize(Policy = "X")]` checks role claims
4. Middleware evaluates policy → grants or denies (`200` / `403`)

---

## Database Entities

### Role

| Field | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `Name` | `string` | Unique role name (e.g. `"SuperAdmin"`) |
| `Description` | `string?` | Human-readable description |
| `IsSystemRole` | `bool` | `true` = cannot delete, cannot rename |
| `CreatedAt` | `DateTime` | |
| `CreatedBy` | `Guid?` | |
| `UpdatedAt` | `DateTime?` | |
| `UpdatedBy` | `Guid?` | |

### Permission

| Field | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `Name` | `string` | Unique permission name (e.g. `"Projects.View"`) |
| `Description` | `string?` | Human-readable description |
| `Category` | `string` | Grouping key (e.g. `"Projects"`, `"System"`) |
| `CreatedAt` | `DateTime` | |
| `CreatedBy` | `Guid?` | |

### RolePermission (Join Table)

| Field | Type |
|---|---|
| `RoleId` | `Guid` |
| `PermissionId` | `Guid` |
| `AssignedAt` | `DateTime` |
| `AssignedBy` | `Guid?` |

### UserRole (Join Table)

| Field | Type |
|---|---|
| `UserId` | `Guid` |
| `RoleId` | `Guid` |
| `AssignedAt` | `DateTime` |
| `AssignedBy` | `Guid?` |

---

## System Roles

Three system roles are seeded on first run. They cannot be deleted and their names cannot be changed (renaming would break authorization policies).

| Role | `IsSystemRole` | Description | Access Tier |
|---|---|---|---|
| **SuperAdmin** | `true` | Full system access with all permissions | Highest — can do everything |
| **TenderingManager** | `true` | Engineer Team Leader with pricing, approval, and collaborator management access | Mid — all business operations + admin-like project control |
| **TenderingEngineer** | `true` | Tendering Engineer with project creation and quotation access | Base — create and work on own projects/panels |

### Role Hierarchy (Policy-Based)

Authorization policies are configured hierarchically:

```
SuperAdmin policy       → requires role: SuperAdmin
TenderingManager policy → requires role: SuperAdmin OR TenderingManager
TenderingEngineer policy → requires role: SuperAdmin OR TenderingManager OR TenderingEngineer
```

This means a **SuperAdmin** passes ALL policies, a **TenderingManager** passes `TenderingManager` and `TenderingEngineer` policies, and a **TenderingEngineer** only passes the `TenderingEngineer` policy.

---

## All Permissions

### Category: UserManagement (5)

| Permission | Description |
|---|---|
| `Users.View` | View users |
| `Users.Create` | Create users |
| `Users.Edit` | Edit users |
| `Users.Delete` | Delete users |
| `Users.ResetPassword` | Reset user passwords |

### Category: RoleManagement (5)

| Permission | Description |
|---|---|
| `Roles.View` | View roles |
| `Roles.Create` | Create roles |
| `Roles.Edit` | Edit roles |
| `Roles.Delete` | Delete roles |
| `Roles.AssignPermissions` | Assign permissions to roles |

### Category: PermissionManagement (4)

| Permission | Description |
|---|---|
| `Permissions.View` | View permissions |
| `Permissions.Create` | Create permissions |
| `Permissions.Edit` | Edit permissions |
| `Permissions.Delete` | Delete permissions |

### Category: Projects (8)

| Permission | Description |
|---|---|
| `Projects.View` | View projects |
| `Projects.ViewAll` | View all projects |
| `Projects.Create` | Create projects |
| `Projects.Edit` | Edit projects |
| `Projects.Delete` | Delete projects |
| `Projects.Approve` | Approve projects |
| `Projects.ManageCollaborators` | Add/remove project collaborators |
| `Projects.ChangeStatus` | Change project status |

### Category: Panels (7)

| Permission | Description |
|---|---|
| `Panels.View` | View panels |
| `Panels.Create` | Create panels |
| `Panels.Edit` | Edit panels |
| `Panels.Delete` | Delete panels |
| `Panels.ManageCollaborators` | Add/remove panel collaborators |
| `Panels.ChangeStatus` | Change panel status |
| `Panels.Duplicate` | Duplicate panels |

### Category: Pricing (4)

| Permission | Description |
|---|---|
| `Pricing.View` | View pricing |
| `Pricing.Modify` | Modify product prices |
| `Discounts.Apply` | Apply additional discounts |
| `Discounts.ApplyGlobal` | Apply global discounts |

### Category: Materials (5)

| Permission | Description |
|---|---|
| `Materials.View` | View materials |
| `Materials.Create` | Create materials |
| `Materials.Edit` | Edit materials |
| `Materials.Delete` | Delete materials |
| `Materials.Import` | Import materials |

### Category: Offers (3)

| Permission | Description |
|---|---|
| `Offers.View` | View offers |
| `Offers.Generate` | Generate quotations |
| `Offers.Export` | Export offers to PDF/Excel |

### Category: System (2)

| Permission | Description |
|---|---|
| `AuditLogs.View` | View audit logs |
| `System.Configure` | System configuration access |

**Total: 44 permissions** (39 initial + 5 added for collaboration/status/duplication features)

---

## Permissions Per Role — Full Matrix

✅ = granted, ❌ = not granted

| Permission | SuperAdmin | TenderingManager | TenderingEngineer |
|---|:---:|:---:|:---:|
| **UserManagement** | | | |
| `Users.View` | ✅ | ❌ | ❌ |
| `Users.Create` | ✅ | ❌ | ❌ |
| `Users.Edit` | ✅ | ❌ | ❌ |
| `Users.Delete` | ✅ | ❌ | ❌ |
| `Users.ResetPassword` | ✅ | ❌ | ❌ |
| **RoleManagement** | | | |
| `Roles.View` | ✅ | ❌ | ❌ |
| `Roles.Create` | ✅ | ❌ | ❌ |
| `Roles.Edit` | ✅ | ❌ | ❌ |
| `Roles.Delete` | ✅ | ❌ | ❌ |
| `Roles.AssignPermissions` | ✅ | ❌ | ❌ |
| **PermissionManagement** | | | |
| `Permissions.View` | ✅ | ❌ | ❌ |
| `Permissions.Create` | ✅ | ❌ | ❌ |
| `Permissions.Edit` | ✅ | ❌ | ❌ |
| `Permissions.Delete` | ✅ | ❌ | ❌ |
| **Projects** | | | |
| `Projects.View` | ✅ | ✅ | ✅ |
| `Projects.ViewAll` | ✅ | ✅ | ❌ |
| `Projects.Create` | ✅ | ✅ | ✅ |
| `Projects.Edit` | ✅ | ✅ | ✅ |
| `Projects.Delete` | ✅ | ✅ | ❌ |
| `Projects.Approve` | ✅ | ✅ | ❌ |
| `Projects.ManageCollaborators` | ✅ | ✅ | ❌ |
| `Projects.ChangeStatus` | ✅ | ✅ | ❌ |
| **Panels** | | | |
| `Panels.View` | ✅ | ✅ | ✅ |
| `Panels.Create` | ✅ | ✅ | ✅ |
| `Panels.Edit` | ✅ | ✅ | ✅ |
| `Panels.Delete` | ✅ | ✅ | ❌ |
| `Panels.ManageCollaborators` | ✅ | ✅ | ❌ |
| `Panels.ChangeStatus` | ✅ | ✅ | ❌ |
| `Panels.Duplicate` | ✅ | ✅ | ✅ |
| **Pricing** | | | |
| `Pricing.View` | ✅ | ✅ | ✅ |
| `Pricing.Modify` | ✅ | ✅ | ❌ |
| `Discounts.Apply` | ✅ | ✅ | ❌ |
| `Discounts.ApplyGlobal` | ✅ | ✅ | ❌ |
| **Materials** | | | |
| `Materials.View` | ✅ | ✅ | ✅ |
| `Materials.Create` | ✅ | ✅ | ❌ |
| `Materials.Edit` | ✅ | ✅ | ❌ |
| `Materials.Delete` | ✅ | ✅ | ❌ |
| `Materials.Import` | ✅ | ✅ | ❌ |
| **Offers** | | | |
| `Offers.View` | ✅ | ✅ | ✅ |
| `Offers.Generate` | ✅ | ✅ | ✅ |
| `Offers.Export` | ✅ | ✅ | ✅ |
| **System** | | | |
| `AuditLogs.View` | ✅ | ❌ | ❌ |
| `System.Configure` | ✅ | ❌ | ❌ |

**Summary counts:**
- **SuperAdmin:** 44/44 (all permissions)
- **TenderingManager:** 22 base + 5 collaboration = 27 permissions
- **TenderingEngineer:** 11 base + 1 duplication = 12 permissions

---

## Authorization Policies

Defined in `DependencyInjection.cs`:

### Role-Based Policies (Used on Controllers)

| Policy Name | Requirement | Who Passes |
|---|---|---|
| `SuperAdmin` | `RequireRole("SuperAdmin")` | SuperAdmin only |
| `TenderingManager` | `RequireRole("SuperAdmin", "TenderingManager")` | SuperAdmin + TenderingManager |
| `TenderingEngineer` | `RequireRole("SuperAdmin", "TenderingManager", "TenderingEngineer")` | All three roles |

### Permission-Based Policies (Defined but NOT Used on Controllers)

| Policy Name | Required Claims | Purpose |
|---|---|---|
| `ManageUsers` | `Permission: Users.Create OR Users.Edit OR Users.Delete` | User CRUD |
| `ManageRoles` | `Permission: Roles.Create OR Roles.Edit OR Roles.Delete` | Role CRUD |
| `ManagePermissions` | `Permission: Permissions.Create OR Permissions.Edit OR Permissions.Delete` | Permission CRUD |
| `ManagePricing` | `Permission: Pricing.Modify` | Price modifications |
| `ApplyDiscounts` | `Permission: Discounts.Apply` | Discount application |
| `ApproveProjects` | `Permission: Projects.Approve` | Project approval |

> ⚠️ **Note:** These permission-based policies exist in the codebase but **no controller currently uses them**. All endpoint authorization is done via the 3 role-based policies. A `RequirePermissionAttribute` helper also exists but is unused.

---

## Controller → Policy Mapping

### Complete Endpoint Authorization Matrix

| Controller | Endpoint | Method | Policy | Effective Access |
|---|---|---|---|---|
| **AuthController** | | | | |
| | `/api/auth/login` | `POST` | `[AllowAnonymous]` | Everyone |
| | `/api/auth/refresh` | `POST` | `[AllowAnonymous]` | Everyone |
| **UsersController** | | | | |
| | `/api/users` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/users/{id}` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/users/me` | `GET` | `[Authorize]` | Any authenticated user |
| | `/api/users` | `POST` | `SuperAdmin` | SuperAdmin |
| | `/api/users/{id}` | `PUT` | `SuperAdmin` | SuperAdmin |
| | `/api/users/{id}` | `DELETE` | `SuperAdmin` | SuperAdmin |
| | `/api/users/{id}/activate` | `POST` | `SuperAdmin` | SuperAdmin |
| | `/api/users/{id}/deactivate` | `POST` | `SuperAdmin` | SuperAdmin |
| | `/api/users/{id}/roles` | `POST` | `SuperAdmin` | SuperAdmin |
| | `/api/users/{id}/permissions` | `GET` | `SuperAdmin` | SuperAdmin |
| **RolesController** | | | | |
| | `/api/roles` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/roles/{id}` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/roles` | `POST` | `SuperAdmin` | SuperAdmin |
| | `/api/roles/{id}` | `PUT` | `SuperAdmin` | SuperAdmin |
| | `/api/roles/{id}/system` | `PUT` | `SuperAdmin` | SuperAdmin |
| | `/api/roles/{id}` | `DELETE` | `SuperAdmin` | SuperAdmin |
| | `/api/roles/{id}/permissions` | `POST` | `SuperAdmin` | SuperAdmin |
| **PermissionsController** | | | | |
| | `/api/permissions` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/permissions/{id}` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/permissions/category/{cat}` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/permissions/categories` | `GET` | `SuperAdmin` | SuperAdmin |
| **AuditLogsController** | | | | |
| | `/api/auditlogs` | `GET` | `SuperAdmin` | SuperAdmin |
| | `/api/auditlogs/user/{userId}` | `GET` | `SuperAdmin` | SuperAdmin |
| **ProjectsController** | | | | |
| | `/api/projects` | `GET` | `TenderingEngineer` | All roles |
| | `/api/projects/{id}` | `GET` | `TenderingEngineer` | All roles (+ access check) |
| | `/api/projects/{id}/detail` | `GET` | `TenderingEngineer` | All roles (+ access check) |
| | `/api/projects/{id}/summary` | `GET` | `TenderingEngineer` | All roles (+ access check) |
| | `/api/projects/customer/{name}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/projects/status/{status}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/projects` | `POST` | `TenderingEngineer` | All roles |
| | `/api/projects/{id}` | `PUT` | `TenderingEngineer` | All roles |
| | `/api/projects/{id}` | `DELETE` | `TenderingEngineer` | All roles |
| | `/api/projects/{id}/status` | `PUT` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/projects/{id}/collaborators` | `POST` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/projects/{id}/collaborators/{uid}` | `DELETE` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/projects/{id}/export` | `GET` | `TenderingEngineer` | All roles |
| | `/api/projects/{id}/export-summary` | `GET` | `TenderingEngineer` | All roles |
| **PanelsController** | | | | |
| | `/api/panels/project/{projectId}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/panels/{id}` | `GET` | `TenderingEngineer` | All roles (+ access check) |
| | `/api/panels/{id}/summary` | `GET` | `TenderingEngineer` | All roles (+ access check) |
| | `/api/panels` | `POST` | `TenderingEngineer` | All roles |
| | `/api/panels/{id}` | `PUT` | `TenderingEngineer` | All roles |
| | `/api/panels/{id}` | `DELETE` | `TenderingEngineer` | All roles |
| | `/api/panels/{id}/duplicate` | `POST` | `TenderingEngineer` | All roles |
| | `/api/panels/{id}/status` | `PUT` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/panels/{id}/collaborators` | `POST` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/panels/{id}/collaborators/{uid}` | `DELETE` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/panels/{id}/export` | `GET` | `TenderingEngineer` | All roles |
| **MaterialsController** | | | | |
| | `/api/materials` | `GET` | `TenderingEngineer` | All roles |
| | `/api/materials/{id}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/materials/search` | `GET` | `TenderingEngineer` | All roles |
| | `/api/materials/categories` | `GET` | `TenderingEngineer` | All roles |
| | `/api/materials/brands` | `GET` | `TenderingEngineer` | All roles |
| | `/api/materials/category/{cat}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/materials` | `POST` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/materials/{id}` | `PUT` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/materials/{id}` | `DELETE` | `TenderingManager` | SuperAdmin + TenderingManager |
| **PanelItemsController** | | | | |
| | `/api/panelitems/panel/{panelId}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/panelitems/panel/{id}/type/{t}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/panelitems/types` | `GET` | `TenderingEngineer` | All roles |
| | `/api/panelitems/{id}` | `GET` | `TenderingEngineer` | All roles |
| | `/api/panelitems` | `POST` | `TenderingEngineer` | All roles |
| | `/api/panelitems/{id}` | `PUT` | `TenderingEngineer` | All roles |
| | `/api/panelitems/{id}` | `DELETE` | `TenderingEngineer` | All roles |
| **ImportController** | | | | |
| | `/api/import/materials` | `POST` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/import/project` | `POST` | `TenderingManager` | SuperAdmin + TenderingManager |
| | `/api/import/materials/template` | `GET` | `[Authorize]` | Any authenticated user |
| | `/api/import/project/template` | `GET` | `[Authorize]` | Any authenticated user |

---

## JWT Token Structure

When a user logs in, the JWT access token contains the following claims:

```json
{
  "nameid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "admin@smartoffer.com",
  "unique_name": "admin",
  "FullName": "Super Administrator",
  "jti": "e1b2c3d4-...",
  "role": ["SuperAdmin"],
  "Permission": [
    "Users.View",
    "Users.Create",
    "Projects.View",
    "Projects.Create",
    "..."
  ],
  "exp": 1738740000,
  "iss": "SmartOffer",
  "aud": "SmartOfferClient"
}
```

**Key claim types:**
- `nameid` (`ClaimTypes.NameIdentifier`) — User's `Guid` ID
- `role` (`ClaimTypes.Role`) — Array of role names
- `Permission` — Array of permission names (custom claim)

---

## Role & Permission Management API

### Roles API (SuperAdmin only)

| Method | Route | Body | Description |
|---|---|---|---|
| `GET` | `/api/roles` | — | Get all roles |
| `GET` | `/api/roles/{id}` | — | Get role by ID |
| `POST` | `/api/roles` | `CreateRoleDto` | Create custom role |
| `PUT` | `/api/roles/{id}` | `UpdateRoleDto` | Update custom role (name + description) |
| `PUT` | `/api/roles/{id}/system` | `UpdateSystemRoleDto` | Update system role (description + permissions) |
| `DELETE` | `/api/roles/{id}` | — | Delete custom role |
| `POST` | `/api/roles/{id}/permissions` | `AssignPermissionsDto` | Replace permissions on any role |

**DTOs:**

```typescript
// Response
interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  permissions: string[];  // permission names
}

// Create custom role
interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds: string[];  // GUIDs
}

// Update custom role
interface UpdateRoleDto {
  name: string;
  description?: string;
}

// Update system role (name excluded — cannot be changed)
interface UpdateSystemRoleDto {
  description?: string;
  permissionIds: string[];  // replaces ALL permissions
}

// Replace permissions on any role
interface AssignPermissionsDto {
  permissionIds: string[];  // replaces ALL permissions
}
```

### Permissions API (SuperAdmin only)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/permissions` | Get all permissions |
| `GET` | `/api/permissions/{id}` | Get permission by ID |
| `GET` | `/api/permissions/category/{category}` | Get permissions by category |
| `GET` | `/api/permissions/categories` | Get all category names |

**DTO:**

```typescript
interface PermissionDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}
```

---

## User Management API

### Users API (SuperAdmin only, except `/me`)

| Method | Route | Body | Description |
|---|---|---|---|
| `GET` | `/api/users` | — | Get all users |
| `GET` | `/api/users/{id}` | — | Get user by ID |
| `GET` | `/api/users/me` | — | Get current user's profile (any auth) |
| `POST` | `/api/users` | `CreateUserDto` | Create user with roles |
| `PUT` | `/api/users/{id}` | `UpdateUserDto` | Update user info |
| `DELETE` | `/api/users/{id}` | — | Delete user |
| `POST` | `/api/users/{id}/activate` | — | Activate user |
| `POST` | `/api/users/{id}/deactivate` | — | Deactivate user |
| `POST` | `/api/users/{id}/roles` | `AssignRolesDto` | Replace user's roles |
| `GET` | `/api/users/{id}/permissions` | — | Get user's effective permissions |

**DTOs:**

```typescript
interface UserDto {
  id: string;
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];       // role names
  permissions: string[]; // permission names
}

interface CreateUserDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  isActive: boolean;   // default: true
  roleIds: string[];   // GUIDs
}

interface UpdateUserDto {
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
}

interface AssignRolesDto {
  roleIds: string[];  // replaces ALL roles
}
```

---

## Business Rules & Constraints

### System Role Protection

| Operation | Custom Roles | System Roles |
|---|---|---|
| View | ✅ | ✅ |
| Create | ✅ | ❌ (only via seeder) |
| Rename | ✅ | ❌ (name tied to policies) |
| Edit description | ✅ (`PUT /roles/{id}`) | ✅ (`PUT /roles/{id}/system`) |
| Edit permissions | ✅ (`POST /roles/{id}/permissions`) | ✅ (`PUT /roles/{id}/system` or `POST /roles/{id}/permissions`) |
| Delete | ✅ (if no users assigned) | ❌ (blocked in code) |

### User Constraints

- Email must be unique
- Username must be unique
- Users can have multiple roles
- Deactivated users (`IsActive = false`) cannot log in
- After 5 failed login attempts → account locked for 15 minutes

### Permission Inheritance

Permissions are **additive** — if a user has multiple roles, they get the **union** of all permissions from all their roles.

---

## Custom Roles

SuperAdmins can create custom roles with any combination of the 44 available permissions.

**Creating a custom role:**
```http
POST /api/roles
{
  "name": "ProjectViewer",
  "description": "Can only view projects and panels",
  "permissionIds": ["<Projects.View GUID>", "<Panels.View GUID>", "<Pricing.View GUID>"]
}
```

**Important:** Custom roles are **not** recognized by the 3 role-based authorization policies (`SuperAdmin`, `TenderingManager`, `TenderingEngineer`). A user with only a custom role will be **denied** access to all controller endpoints that use these policies. Custom roles currently only work if the user **also** has at least one system role assigned.

---

## RequirePermissionAttribute

A `RequirePermissionAttribute` exists in the codebase for fine-grained permission checks:

```csharp
// Usage (NOT currently applied to any controller):
[RequirePermission("Projects.Edit")]
public async Task<ActionResult> EditProject(...)
```

This attribute creates a dynamic policy (`Permission:Projects.Edit`) that checks for the `"Permission"` claim in the JWT. It is fully functional but **not used on any endpoint**.

---

## Seeded Data

### Default Admin User

| Field | Value |
|---|---|
| FullName | `Super Administrator` |
| Email | `admin@smartoffer.com` |
| Username | `admin` |
| Password | `Admin@123!` |
| Role | `SuperAdmin` |

### Seeding Order

1. **Permissions** — 39 base permissions created
2. **New Permissions** — 5 additional permissions for collaboration/status/duplication
3. **Roles** — 3 system roles created with their respective permissions
4. **SuperAdmin User** — Default admin created with `SuperAdmin` role

---

## TypeScript Interfaces

```typescript
// === Entities ===

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];
  permissions: string[];
}

// === Auth ===

interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

interface LoginResponse {
  token: string;        // JWT access token
  refreshToken: string;
  expiresAt: string;
  user: User;
}

// === Permission Categories ===

type PermissionCategory =
  | 'UserManagement'
  | 'RoleManagement'
  | 'PermissionManagement'
  | 'Projects'
  | 'Panels'
  | 'Pricing'
  | 'Materials'
  | 'Offers'
  | 'System';
```

---

## Frontend Integration Guide

### Reading Permissions from JWT

After login, the frontend receives the `LoginResponse`. The `user.permissions` array contains all permission names. Use these to control UI visibility:

```typescript
// Check if user has a specific permission
const hasPermission = (user: User, permission: string): boolean =>
  user.permissions.includes(permission);

// Check if user has a specific role
const hasRole = (user: User, role: string): boolean =>
  user.roles.includes(role);

// Examples
if (hasPermission(user, 'Materials.Edit')) {
  // Show edit button
}

if (hasRole(user, 'SuperAdmin')) {
  // Show admin panel
}
```

### UI Visibility Rules

| UI Element | Show When |
|---|---|
| Admin sidebar (Users, Roles, Permissions, Audit Logs) | `hasRole("SuperAdmin")` |
| Material Create/Edit/Delete buttons | `hasPermission("Materials.Create")` etc. |
| Project Delete button | `hasPermission("Projects.Delete")` |
| Project Status dropdown | `hasPermission("Projects.ChangeStatus")` |
| Collaborator management section | `hasPermission("Projects.ManageCollaborators")` |
| Panel Duplicate button | `hasPermission("Panels.Duplicate")` |
| Import section | `hasPermission("Materials.Import")` |
| Pricing Modify controls | `hasPermission("Pricing.Modify")` |
| Discount fields | `hasPermission("Discounts.Apply")` |

### Role-Based Page Access

| Page | Minimum Role |
|---|---|
| Login | None |
| Dashboard / Projects list | `TenderingEngineer` (any role) |
| Project detail / Panel detail | `TenderingEngineer` (any role) |
| Materials list (read-only) | `TenderingEngineer` (any role) |
| Materials management (CRUD) | `TenderingManager` |
| Import page | `TenderingManager` |
| Status / Collaborator management | `TenderingManager` |
| User management | `SuperAdmin` |
| Role management | `SuperAdmin` |
| Permission management | `SuperAdmin` |
| Audit logs | `SuperAdmin` |

---

## Known Gaps & Notes

| # | Issue | Impact |
|---|---|---|
| 1 | **Permission-based policies defined but not enforced** — Controllers use role-based policies only. Permission-based policies (`ManageUsers`, `ManagePricing`, etc.) and `RequirePermissionAttribute` exist but are unused. | Frontend can use permissions for UI gating, but the backend does not enforce them at the endpoint level. |
| 2 | **Custom roles don't map to policies** — Only `SuperAdmin`, `TenderingManager`, and `TenderingEngineer` are recognized by policy checks. Users with only custom roles get `403` on every endpoint. | Custom roles only work alongside a system role. |
| 3 | **No password change endpoint** — `ChangePasswordDto` and `ResetPasswordDto` exist in DTOs but no controller endpoint exposes them. | Users cannot change their own password via API. |
| 4 | **Refresh tokens stored in-memory** — `ConcurrentDictionary` in `JwtService`. Lost on server restart. | Users must re-login after deployment. |
| 5 | **Permissions not re-evaluated on role change** — If a SuperAdmin changes a user's permissions or role, the user's JWT still contains old claims until it expires or is refreshed. | Token expiration (default 60 min) controls when permission changes take effect. |
