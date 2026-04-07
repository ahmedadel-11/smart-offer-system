# SmartOffer — Complete Backend Reference
> **Audience:** Frontend AI Agent / Frontend Developer  
> **Purpose:** Authoritative single-source description of every entity, relationship, endpoint, business rule, pricing formula, RBAC policy, audit flow, and known gap in the SmartOffer .NET 8 backend.  
> **Base URL:** `https://localhost:{port}` (development) — configured per environment.  
> **Auth:** JWT Bearer — include `Authorization: Bearer <token>` on every protected request.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Domain Entities & Relationships](#2-domain-entities--relationships)
3. [Enums](#3-enums)
4. [Authentication & JWT Flow](#4-authentication--jwt-flow)
5. [RBAC — Roles, Permissions & Policies](#5-rbac--roles-permissions--policies)
6. [Complete API Reference](#6-complete-api-reference)
   - [Auth](#61-auth-controller)
   - [Users](#62-users-controller)
   - [Roles](#63-roles-controller)
   - [Permissions](#64-permissions-controller)
   - [Projects](#65-projects-controller)
   - [Panels](#66-panels-controller)
   - [Panel Items](#67-panel-items-controller)
   - [Materials](#68-materials-controller)
   - [Import](#69-import-controller)
   - [Audit Logs](#610-audit-logs-controller)
7. [Pricing Formula](#7-pricing-formula)
8. [Collaboration System](#8-collaboration-system)
9. [Status Lifecycle](#9-status-lifecycle)
10. [Soft Delete System](#10-soft-delete-system)
11. [Audit Log System](#11-audit-log-system)
12. [Import / Export System](#12-import--export-system)
13. [DTO Reference (Request & Response Shapes)](#13-dto-reference-request--response-shapes)
14. [Seeded Data (Default State)](#14-seeded-data-default-state)
15. [⚠️ Known Gaps & Unimplemented Frontend Features](#15-️-known-gaps--unimplemented-frontend-features)
16. [Frontend Integration Checklist](#16-frontend-integration-checklist)

---

## 1. Architecture Overview

```
SmartOffer.API           — Controllers, Program.cs, Auth middleware, JWT Bearer
SmartOffer.Application   — Services, Interfaces, DTOs, MediatR Commands & Handlers
SmartOffer.Domain        — Entities, Enums, Repository Interfaces
SmartOffer.Infrastructure — EF Core DbContext, Repository Implementations, JwtService, Excel services
```

### Technology Stack
| Layer | Technology |
|---|---|
| Runtime | .NET 8 |
| API Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core |
| Auth | JWT Bearer (Access Token + Refresh Token, in-memory store) |
| Passwords | BCrypt.Net |
| CQRS Mediator | MediatR |
| Excel | ClosedXML |
| CORS | AllowAll (all origins, methods, headers — **development only**) |

---

## 2. Domain Entities & Relationships

### Entity Relationship Diagram (logical)

```
User ──< UserRole >── Role ──< RolePermission >── Permission
 │
 ├──< Project (CreatedByUser)
 │       └──< ProjectCollaborator >── User
 │       └──< Panel
 │               └──< PanelCollaborator >── User
 │               └──< PanelItem >── Material
 │
 └── AuditLog (nullable UserId)
```

### User
| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | PK |
| `FullName` | `string` | |
| `Email` | `string` | Unique |
| `Username` | `string` | Unique |
| `PasswordHash` | `string` | BCrypt |
| `IsActive` | `bool` | Default `true` |
| `CreatedAt` | `DateTime` | UTC |
| `CreatedBy` | `Guid?` | FK → User |
| `UpdatedAt` | `DateTime?` | |
| `UpdatedBy` | `Guid?` | |
| `FailedLoginAttempts` | `int` | Resets on success |
| `LockoutEndTime` | `DateTime?` | Set after 5 failed attempts for 15 min |
| `LastLoginAt` | `DateTime?` | |
| `UserRoles` | `ICollection<UserRole>` | Navigation |

### Role
| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | PK |
| `Name` | `string` | e.g. `"SuperAdmin"`, `"TenderingManager"`, `"TenderingEngineer"` |
| `Description` | `string?` | |
| `IsSystemRole` | `bool` | Cannot be deleted if `true` |
| `CreatedAt` | `DateTime` | |
| `RolePermissions` | `ICollection<RolePermission>` | Navigation |

### Permission
| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | PK |
| `Name` | `string` | e.g. `"Projects.Create"` |
| `Description` | `string?` | |
| `Category` | `string` | Groups: `UserManagement`, `RoleManagement`, `PermissionManagement`, `Projects`, `Panels`, `Pricing`, `Materials`, `Offers`, `System` |
| `CreatedAt` | `DateTime` | |

### UserRole (join)
| Field | Type |
|---|---|
| `UserId` | `Guid` (FK) |
| `RoleId` | `Guid` (FK) |
| `AssignedAt` | `DateTime` |
| `AssignedBy` | `Guid?` |

### RolePermission (join)
| Field | Type |
|---|---|
| `RoleId` | `Guid` (FK) |
| `PermissionId` | `Guid` (FK) |
| `AssignedAt` | `DateTime` |
| `AssignedBy` | `Guid?` |

### Project
| Field | Type | Notes |
|---|---|---|
| `ProjectId` | `int` | PK |
| `ProjectName` | `string` | |
| `Customer` | `string` | Customer / client company name |
| `Currency` | `string` | Default `"USD"` |
| `DefaultMargin` | `decimal` | Percentage (e.g. `15` = 15%) |
| `CreatedDate` | `DateTime` | UTC |
| `UpdatedDate` | `DateTime?` | |
| `Status` | `EntityStatus` | Enum |
| `Notes` | `string?` | |
| `CreatedByUserId` | `Guid?` | FK → User |
| `UpdatedByUserId` | `Guid?` | |
| `IsDeleted` | `bool` | Soft delete flag |
| `DeletedAt` | `DateTime?` | |
| `DeletedByUserId` | `Guid?` | |
| `Panels` | `ICollection<Panel>` | Navigation |
| `Collaborators` | `ICollection<ProjectCollaborator>` | Navigation |

### Panel
| Field | Type | Notes |
|---|---|---|
| `PanelId` | `int` | PK |
| `PanelName` | `string` | |
| `Description` | `string?` | |
| `ProjectId` | `int` | FK → Project |
| `OverrideMargin` | `decimal?` | Overrides `Project.DefaultMargin` for this panel |
| `Status` | `EntityStatus` | Enum |
| `CreatedAt` | `DateTime` | |
| `UpdatedAt` | `DateTime?` | |
| `CreatedByUserId` | `Guid?` | |
| `OwnerId` | `Guid?` | Assigned owner/responsible engineer |
| `UpdatedByUserId` | `Guid?` | |
| `IsDeleted` | `bool` | Soft delete |
| `DeletedAt` | `DateTime?` | |
| `DeletedByUserId` | `Guid?` | |
| `Items` | `ICollection<PanelItem>` | Navigation |
| `Collaborators` | `ICollection<PanelCollaborator>` | Navigation |

### PanelItem
| Field | Type | Notes |
|---|---|---|
| `PanelItemId` | `int` | PK |
| `PanelId` | `int` | FK → Panel |
| `MaterialId` | `int` | FK → Material |
| `Quantity` | `int` | |
| `ItemType` | `PanelItemType` | Enum (Incoming/Outgoing/Enclosure/BusbarAndCables) |
| `OverrideDiscount` | `decimal?` | % — overrides `Material.DefaultDiscount` |
| `OverrideMargin` | `decimal?` | % — overrides Panel/Project margin |
| `ExtraDiscount` | `decimal?` | % — additional stacked discount |
| `Notes` | `string?` | |

### Material
| Field | Type | Notes |
|---|---|---|
| `MaterialId` | `int` | PK |
| `ItemCode` | `string` | Unique catalog code |
| `Description` | `string` | |
| `RatedCurrent` | `string?` | e.g. `"63A"` |
| `Isc` | `string?` | Short-circuit current |
| `NoOfPoles` | `int?` | |
| `Brand` | `string?` | e.g. `"Schneider"` |
| `Reference` | `string?` | Manufacturer reference |
| `BasePrice` | `decimal` | List price |
| `DefaultDiscount` | `decimal` | % discount applied by default |
| `Category` | `string` | |
| `IsActive` | `bool` | Soft disable flag |

### ProjectCollaborator
| Field | Type | Notes |
|---|---|---|
| `Id` | `int` | PK |
| `ProjectId` | `int` | FK → Project |
| `UserId` | `Guid` | FK → User |
| `RoleInProject` | `string?` | Free-text role label (e.g. `"Lead Engineer"`) |
| `AddedByUserId` | `Guid?` | |
| `AddedAt` | `DateTime` | |

### PanelCollaborator
| Field | Type | Notes |
|---|---|---|
| `Id` | `int` | PK |
| `PanelId` | `int` | FK → Panel |
| `UserId` | `Guid` | FK → User |
| `AddedByUserId` | `Guid?` | |
| `AddedAt` | `DateTime` | |
> ⚠️ `PanelCollaborator` does **not** have a `RoleInProject` field. The `CollaboratorDto` returns `null` for `RoleInProject` on panel collaborators.

### AuditLog
| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | PK |
| `UserId` | `Guid?` | FK → User (nullable for system actions) |
| `Action` | `string` | e.g. `"Create"`, `"Update"`, `"Delete"`, `"Login"`, `"FailedLogin"` |
| `EntityType` | `string` | e.g. `"Project"`, `"Panel"`, `"User"` |
| `EntityId` | `string?` | String ID of affected entity |
| `PropertyName` | `string?` | Field that changed (optional detail) |
| `OldValues` | `string?` | Human-readable previous state |
| `NewValues` | `string?` | Human-readable new state |
| `IpAddress` | `string?` | |
| `Timestamp` | `DateTime` | UTC |

---

## 3. Enums

### EntityStatus
```
Draft        = 1   (default for new Projects & Panels)
InProgress   = 2
UnderReview  = 3
Approved     = 4
Rejected     = 5
Completed    = 6
Archived     = 7
```

### PanelItemType
```
Incoming        = 1   (main supply, disconnects, incomer breakers)
Outgoing        = 2   (circuit breakers, contactors, loads — DEFAULT)
Enclosure       = 3   (panel body, mounting plates, doors)
BusbarAndCables = 4   (busbars, wiring, connectors)
```

---

## 4. Authentication & JWT Flow

### 4.1 Login
**`POST /api/auth/login`** (anonymous)

Request:
```json
{ "emailOrUsername": "admin", "password": "Admin@1234" }
```
Response `200 OK`:
```json
{
  "token": "<JWT access token>",
  "refreshToken": "<opaque refresh token>",
  "expiresAt": "2026-02-04T10:00:00Z",
  "user": {
    "id": "guid",
    "fullName": "System Administrator",
    "email": "admin@smartoffer.com",
    "username": "admin",
    "isActive": true,
    "roles": ["SuperAdmin"],
    "permissions": ["Users.View", "Projects.Create", ...]
  }
}
```

**Security rules:**
- 5 failed attempts → account locked for 15 minutes
- Inactive accounts → `401 Unauthorized`
- Locked accounts → `401` with unlock time in message

### 4.2 JWT Claims
The access token contains:
| Claim | Content |
|---|---|
| `nameidentifier` | User GUID |
| `email` | User email |
| `name` | Username |
| `FullName` | Display name |
| `role` | One per role (e.g. `"TenderingManager"`) |
| `Permission` | One per permission (e.g. `"Projects.Create"`) |

### 4.3 Token Refresh
**`POST /api/auth/refresh`** (anonymous)
```json
{ "refreshToken": "<refresh token from login>" }
```
Returns same shape as login. ⚠️ **Refresh tokens are stored in-memory (ConcurrentDictionary) — they are lost on server restart. Frontend must handle 401 and redirect to login.**

### 4.4 Logout
**`POST /api/auth/logout`** (authenticated)  
Invalidates the current user's refresh token. Returns `200 { "message": "Logged out successfully." }`.

### 4.5 Change Password
**`POST /api/auth/change-password`** (authenticated — any user for their own account)
```json
{ "currentPassword": "old", "newPassword": "new" }
```

### 4.6 Reset Password (Admin)
**`POST /api/auth/reset-password`** (SuperAdmin policy only)
```json
{ "userId": "guid", "newPassword": "new" }
```

---

## 5. RBAC — Roles, Permissions & Policies

### System Roles (seeded, cannot be deleted)

| Role | Description | Project Visibility |
|---|---|---|
| `SuperAdmin` | Full access, all permissions | All projects |
| `TenderingManager` | Team lead — pricing, approval, collaboration | All projects |
| `TenderingEngineer` | Engineer — create & work on projects | Own projects + projects where collaborator |

### Controller Authorization Policies
| Controller | Required Policy |
|---|---|
| `UsersController` | `SuperAdmin` (except `GET /me` → any authenticated) |
| `RolesController` | `SuperAdmin` |
| `PermissionsController` | `SuperAdmin` |
| `AuditLogsController` | `SuperAdmin` |
| `ProjectsController` | `TenderingEngineer` minimum (some actions require `TenderingManager`) |
| `PanelsController` | `TenderingEngineer` minimum (some actions require `TenderingManager`) |
| `PanelItemsController` | ⚠️ **No `[Authorize]`** — publicly accessible (see §15) |
| `MaterialsController` | ⚠️ **No `[Authorize]`** — publicly accessible (see §15) |
| `ImportController` | ⚠️ **No `[Authorize]`** — publicly accessible (see §15) |

### Actions Requiring `TenderingManager` Policy
- `PUT /api/projects/{id}/status`
- `POST /api/projects/{id}/collaborators`
- `DELETE /api/projects/{id}/collaborators/{userId}`
- `PUT /api/panels/{id}/status`
- `POST /api/panels/{id}/collaborators`
- `DELETE /api/panels/{id}/collaborators/{userId}`

### Permission Catalog (all seeded permissions)
| Permission Name | Category | Description |
|---|---|---|
| `Users.View` | UserManagement | |
| `Users.Create` | UserManagement | |
| `Users.Edit` | UserManagement | |
| `Users.Delete` | UserManagement | |
| `Users.ResetPassword` | UserManagement | |
| `Roles.View` | RoleManagement | |
| `Roles.Create` | RoleManagement | |
| `Roles.Edit` | RoleManagement | |
| `Roles.Delete` | RoleManagement | |
| `Roles.AssignPermissions` | RoleManagement | |
| `Permissions.View` | PermissionManagement | |
| `Permissions.Create` | PermissionManagement | |
| `Permissions.Edit` | PermissionManagement | |
| `Permissions.Delete` | PermissionManagement | |
| `Projects.View` | Projects | |
| `Projects.ViewAll` | Projects | See all projects regardless of ownership |
| `Projects.Create` | Projects | |
| `Projects.Edit` | Projects | |
| `Projects.Delete` | Projects | |
| `Projects.Approve` | Projects | |
| `Projects.ManageCollaborators` | Projects | |
| `Projects.ChangeStatus` | Projects | |
| `Panels.View` | Panels | |
| `Panels.Create` | Panels | |
| `Panels.Edit` | Panels | |
| `Panels.Delete` | Panels | |
| `Panels.ManageCollaborators` | Panels | |
| `Panels.ChangeStatus` | Panels | |
| `Panels.Duplicate` | Panels | |
| `Pricing.View` | Pricing | |
| `Pricing.Modify` | Pricing | |
| `Discounts.Apply` | Pricing | |
| `Discounts.ApplyGlobal` | Pricing | |
| `Materials.View` | Materials | |
| `Materials.Create` | Materials | |
| `Materials.Edit` | Materials | |
| `Materials.Delete` | Materials | |
| `Materials.Import` | Materials | |
| `Offers.View` | Offers | |
| `Offers.Generate` | Offers | |
| `Offers.Export` | Offers | |
| `AuditLogs.View` | System | |
| `System.Configure` | System | |

> **Note:** `RequirePermissionAttribute` exists in the codebase but is **not applied** on any controller endpoint yet. All authorization is currently purely role-based via `[Authorize(Policy = "RoleName")]`. The permission claims are embedded in the JWT for future granular use.

---

## 6. Complete API Reference

> All routes prefixed with `/api/`.  
> ✅ = actively used and expected by frontend  
> ⚠️ = exists but likely not wired in frontend

---

### 6.1 Auth Controller
`/api/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/login` | Anonymous | Login, get JWT + refresh token ✅ |
| POST | `/refresh` | Anonymous | Exchange refresh token for new access token ⚠️ |
| POST | `/logout` | Any auth | Invalidate refresh token ✅ |
| POST | `/change-password` | Any auth | Change own password ✅ |
| POST | `/reset-password` | SuperAdmin | Admin reset any user's password ⚠️ |

---

### 6.2 Users Controller
`/api/users` — Policy: `SuperAdmin` (except `/me`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | SuperAdmin | Get all users ✅ |
| GET | `/{id}` | SuperAdmin | Get user by GUID ✅ |
| GET | `/me` | Any auth | Get current user's own profile ✅ |
| POST | `/` | SuperAdmin | Create new user ✅ |
| PUT | `/{id}` | SuperAdmin | Update user info ✅ |
| DELETE | `/{id}` | SuperAdmin | Delete user ⚠️ |
| POST | `/{id}/activate` | SuperAdmin | Activate a deactivated user ⚠️ |
| POST | `/{id}/deactivate` | SuperAdmin | Deactivate a user ⚠️ |
| POST | `/{id}/roles` | SuperAdmin | Assign roles to user ⚠️ |

**Create User Request:**
```json
{
  "fullName": "Ahmed Ali",
  "email": "ahmed@company.com",
  "username": "ahmed.ali",
  "password": "Pass@123",
  "isActive": true,
  "roleIds": ["role-guid-1"]
}
```

**Update User Request:**
```json
{
  "fullName": "Ahmed Ali Updated",
  "email": "ahmed@company.com",
  "username": "ahmed.ali",
  "isActive": true
}
```

**Assign Roles Request:**
```json
{ "roleIds": ["role-guid-1", "role-guid-2"] }
```

**User Response Shape:**
```json
{
  "id": "guid",
  "fullName": "Ahmed Ali",
  "email": "ahmed@company.com",
  "username": "ahmed.ali",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "lastLoginAt": "2026-02-01T10:00:00Z",
  "roles": ["TenderingEngineer"],
  "permissions": ["Projects.View", "Projects.Create", ...]
}
```

---

### 6.3 Roles Controller
`/api/roles` — Policy: `SuperAdmin`

| Method | Route | Description |
|---|---|---|
| GET | `/` | Get all roles ✅ |
| GET | `/{id}` | Get role by GUID ✅ |
| POST | `/` | Create new role ⚠️ |
| PUT | `/{id}` | Update role name/description ⚠️ |
| DELETE | `/{id}` | Delete role ⚠️ |
| POST | `/{id}/permissions` | Assign permissions to role ✅ |

**Create Role Request:**
```json
{
  "name": "SalesEngineer",
  "description": "Can view and export offers",
  "permissionIds": ["perm-guid-1", "perm-guid-2"]
}
```

**Assign Permissions Request:**
```json
{ "permissionIds": ["perm-guid-1", "perm-guid-2"] }
```

**Role Response Shape:**
```json
{
  "id": "guid",
  "name": "TenderingManager",
  "description": "Team lead...",
  "isSystemRole": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "permissions": ["Projects.View", "Projects.Approve", ...]
}
```

---

### 6.4 Permissions Controller
`/api/permissions` — Policy: `SuperAdmin`

| Method | Route | Description |
|---|---|---|
| GET | `/` | Get all permissions ✅ |
| GET | `/{id}` | Get permission by GUID ⚠️ |
| GET | `/categories` | Get distinct category names ✅ |
| GET | `/category/{category}` | Get permissions in a category ✅ |
| POST | `/` | Create new permission ⚠️ |
| PUT | `/{id}` | Update permission ⚠️ |
| DELETE | `/{id}` | Delete permission ⚠️ |

**Permission Response Shape:**
```json
{
  "id": "guid",
  "name": "Projects.Create",
  "description": "Create projects",
  "category": "Projects",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

### 6.5 Projects Controller
`/api/projects` — Policy: `TenderingEngineer` (minimum)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | TenderingEngineer | Get accessible projects (role-filtered) ✅ |
| GET | `/{id}` | TenderingEngineer | Get project with panels, collaborators, summary ✅ |
| GET | `/{id}/summary` | TenderingEngineer | Get pricing summary only ⚠️ |
| GET | `/customer/{customer}` | TenderingEngineer | Filter projects by customer ⚠️ |
| GET | `/status/{status}` | TenderingEngineer | Filter projects by status ⚠️ |
| POST | `/` | TenderingEngineer | Create project ✅ |
| PUT | `/{id}` | TenderingEngineer | Update project details ✅ |
| DELETE | `/{id}` | TenderingEngineer | Soft delete project ✅ |
| PUT | `/{id}/status` | TenderingManager | Change project status ⚠️ |
| POST | `/{id}/collaborators` | TenderingManager | Add collaborator ⚠️ |
| DELETE | `/{id}/collaborators/{userId}` | TenderingManager | Remove collaborator ⚠️ |
| GET | `/{id}/export` | TenderingEngineer | Export full project to Excel ⚠️ |
| GET | `/{id}/export-summary` | TenderingEngineer | Export project summary to Excel ⚠️ |

**Project Visibility Rules (critical for frontend):**
- `SuperAdmin` / `TenderingManager` → see ALL non-deleted projects
- `TenderingEngineer` → see only projects where `CreatedByUserId == userId` OR the user is a `ProjectCollaborator`

**Create Project Request:**
```json
{
  "projectName": "Cairo Hospital MV Panel",
  "customer": "Cairo Medical Group",
  "currency": "EGP",
  "defaultMargin": 15.0,
  "notes": "Phase 1 of the hospital expansion"
}
```

**Update Project Request:** (same fields, all required)

**Add Collaborator Request:**
```json
{
  "userId": "user-guid",
  "roleInProject": "Lead Engineer"
}
```

**Change Status Request:**
```json
{ "newStatus": 3 }
```
*(use integer value from EntityStatus enum)*

**Project List Response (ProjectDto):**
```json
{
  "projectId": 1,
  "projectName": "Cairo Hospital MV Panel",
  "customer": "Cairo Medical Group",
  "currency": "EGP",
  "defaultMargin": 15.0,
  "createdDate": "2026-02-01T00:00:00Z",
  "status": 1,
  "notes": "...",
  "panelCount": 3,
  "createdByUserId": "guid"
}
```

**Project Detail Response (ProjectDetailDto):**
```json
{
  "projectId": 1,
  "projectName": "...",
  "customer": "...",
  "currency": "EGP",
  "defaultMargin": 15.0,
  "createdDate": "...",
  "status": 2,
  "notes": "...",
  "createdByUserId": "guid",
  "panels": [ /* PanelDto[] */ ],
  "collaborators": [
    { "id": 1, "userId": "guid", "userName": "Ahmed Ali", "roleInProject": "Lead Engineer", "addedAt": "..." }
  ],
  "summary": {
    "totalPanels": 3,
    "totalItems": 42,
    "totalCost": 125000.00,
    "totalPrice": 143750.00,
    "totalMarginAmount": 18750.00
  }
}
```

---

### 6.6 Panels Controller
`/api/panels` — Policy: `TenderingEngineer` (minimum)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/project/{projectId}` | TenderingEngineer | Get all panels for a project ✅ |
| GET | `/{id}` | TenderingEngineer | Get panel detail with items, collaborators, summary ✅ |
| GET | `/{id}/summary` | TenderingEngineer | Get panel pricing summary only ⚠️ |
| POST | `/` | TenderingEngineer | Create panel ✅ |
| PUT | `/{id}` | TenderingEngineer | Update panel ✅ |
| DELETE | `/{id}` | TenderingEngineer | Soft delete panel ✅ |
| POST | `/{id}/duplicate` | TenderingEngineer | Duplicate panel (deep copy with all items) ✅ |
| PUT | `/{id}/status` | TenderingManager | Change panel status ⚠️ |
| POST | `/{id}/collaborators` | TenderingManager | Add collaborator ⚠️ |
| DELETE | `/{id}/collaborators/{userId}` | TenderingManager | Remove collaborator ⚠️ |
| GET | `/{id}/export` | TenderingEngineer | Export panel to Excel ⚠️ |

**Panel Access Control:**
- `SuperAdmin` / `TenderingManager` → access any panel
- `TenderingEngineer` → access panels whose project they can access OR panels where they are a `PanelCollaborator`

**Create Panel Request:**
```json
{
  "panelName": "MDB Panel",
  "description": "Main Distribution Board",
  "projectId": 1,
  "overrideMargin": 20.0
}
```
> If `overrideMargin` is `null`, the panel inherits `Project.DefaultMargin`.

**Update Panel Request:**
```json
{
  "panelName": "MDB Panel Updated",
  "description": "...",
  "overrideMargin": null
}
```

**Add Panel Collaborator Request:**
```json
{ "userId": "user-guid" }
```
> ⚠️ Panel collaborators do NOT have a `roleInProject` field. Only `userId` is sent.

**Panel List Response (PanelDto):**
```json
{
  "panelId": 1,
  "panelName": "MDB Panel",
  "description": "Main Distribution Board",
  "projectId": 1,
  "overrideMargin": 20.0,
  "status": 1,
  "itemCount": 12,
  "createdByUserId": "guid",
  "ownerId": "guid"
}
```

**Panel Detail Response (PanelDetailDto):**
```json
{
  "panelId": 1,
  "panelName": "MDB Panel",
  "description": "...",
  "projectId": 1,
  "overrideMargin": 20.0,
  "status": 2,
  "createdByUserId": "guid",
  "ownerId": "guid",
  "items": [ /* PanelItemDto[] */ ],
  "collaborators": [
    { "id": 1, "userId": "guid", "userName": "Ahmed Ali", "roleInProject": null, "addedAt": "..." }
  ],
  "summary": {
    "totalItems": 12,
    "totalCost": 45000.00,
    "totalPrice": 54000.00,
    "marginAmount": 9000.00
  }
}
```

**Panel Summary Response (PanelSummaryDto):**
```json
{
  "totalItems": 12,
  "totalCost": 45000.00,
  "totalPrice": 54000.00,
  "marginAmount": 9000.00
}
```

---

### 6.7 Panel Items Controller
`/api/panelitems` — ⚠️ NO AUTHENTICATION (see §15)

| Method | Route | Description |
|---|---|---|
| GET | `/panel/{panelId}` | Get all items for a panel with full pricing ✅ |
| GET | `/panel/{panelId}/type/{itemType}` | Get items filtered by type (int) ⚠️ |
| GET | `/types` | Get all PanelItemType enum values with descriptions ⚠️ |
| GET | `/{id}` | Get single item with pricing ✅ |
| POST | `/` | Add item to panel ✅ |
| PUT | `/{id}` | Update item qty/type/discounts ✅ |
| DELETE | `/{id}` | Remove item from panel ✅ |

**Create Panel Item Request:**
```json
{
  "panelId": 1,
  "materialId": 42,
  "quantity": 3,
  "itemType": 2,
  "overrideDiscount": null,
  "overrideMargin": null,
  "extraDiscount": 5.0,
  "notes": "Customer requested 5% extra"
}
```

**Update Panel Item Request:**
```json
{
  "quantity": 4,
  "itemType": 2,
  "overrideDiscount": 10.0,
  "overrideMargin": null,
  "extraDiscount": 0,
  "notes": "Updated"
}
```

**Panel Item Response (PanelItemDto) — includes computed pricing:**
```json
{
  "panelItemId": 1,
  "panelId": 1,
  "materialId": 42,
  "itemCode": "A9F74316",
  "description": "iC60N 16A 3P 6kA Curve C",
  "brand": "Schneider",
  "quantity": 3,
  "itemType": 2,
  "basePrice": 450.00,
  "discount": 25.0,
  "extraDiscount": 5.0,
  "unitCost": 320.625,
  "totalCost": 961.875,
  "margin": 15.0,
  "totalPrice": 1106.16,
  "notes": "Customer requested..."
}
```

**Item Types Response (`GET /types`):**
```json
[
  { "value": 1, "name": "Incoming", "description": "Incoming electrical components..." },
  { "value": 2, "name": "Outgoing", "description": "Outgoing electrical components..." },
  { "value": 3, "name": "Enclosure", "description": "Panel enclosure and mounting..." },
  { "value": 4, "name": "BusbarAndCables", "description": "Busbars, electrical connections..." }
]
```

---

### 6.8 Materials Controller
`/api/materials` — ⚠️ NO AUTHENTICATION (see §15)

| Method | Route | Description |
|---|---|---|
| GET | `/` | Get all active materials ✅ |
| GET | `/{id}` | Get material by ID ✅ |
| GET | `/search?term={term}` | Full-text search by code/description/brand ✅ |
| GET | `/categories` | Get distinct category names ✅ |
| GET | `/brands` | Get distinct brand names ⚠️ |
| GET | `/category/{category}` | Get materials in category ✅ |
| POST | `/` | Create material ⚠️ |
| PUT | `/{id}` | Update material ⚠️ |
| DELETE | `/{id}` | Soft delete material ⚠️ |

**Material Response (MaterialDto):**
```json
{
  "materialId": 42,
  "itemCode": "A9F74316",
  "description": "iC60N 16A 3P 6kA Curve C",
  "ratedCurrent": "16A",
  "isc": "6kA",
  "noOfPoles": 3,
  "brand": "Schneider",
  "reference": "A9F74316",
  "basePrice": 450.00,
  "defaultDiscount": 25.0,
  "category": "MCB",
  "isActive": true
}
```

---

### 6.9 Import Controller
`/api/import` — ⚠️ NO AUTHENTICATION (see §15)

| Method | Route | Description |
|---|---|---|
| POST | `/materials` | Upload Excel to import materials in bulk ⚠️ |
| POST | `/project` | Upload Excel to import a complete project ⚠️ |
| GET | `/materials/template` | Download blank materials Excel template ⚠️ |
| GET | `/project/template` | Download blank project Excel template ⚠️ |

**Materials Import Request:** `multipart/form-data` with field `file` (`.xlsx` or `.xls`)

**Import Result Response:**
```json
{
  "totalRows": 150,
  "successfulImports": 148,
  "failedImports": 2,
  "errors": ["Row 5: ItemCode is required", "Row 23: BasePrice must be positive"],
  "message": "Import completed with 2 errors"
}
```

**Excel Columns for Materials Import:**
| Column | Required |
|---|---|
| ItemCode | ✅ |
| Description | ✅ |
| RatedCurrent | ❌ |
| Isc | ❌ |
| NoOfPoles | ❌ |
| Brand | ❌ |
| Reference | ❌ |
| BasePrice | ✅ |
| DefaultDiscount | ✅ |
| Category | ✅ |

---

### 6.10 Audit Logs Controller
`/api/auditlogs` — Policy: `SuperAdmin`

| Method | Route | Description |
|---|---|---|
| GET | `/` | Get logs with optional query filters ✅ |
| GET | `/user/{userId}` | Get all logs for a specific user ⚠️ |

**Audit Log Filter (query string parameters):**
```
GET /api/auditlogs?userId=guid&action=Create&entityType=Project&startDate=2026-01-01&endDate=2026-02-01&pageNumber=1&pageSize=50
```
> ⚠️ **Known limitation:** Filters are applied one at a time (first matching branch wins). Combined multi-filter is not implemented server-side. The frontend should filter by one criterion at a time, or the backend needs to be enhanced.

**Audit Log Response (AuditLogDto):**
```json
{
  "id": "guid",
  "userId": "guid",
  "userName": "Ahmed Ali",
  "action": "Create",
  "entityType": "Project",
  "entityId": "1",
  "oldValues": null,
  "newValues": "ProjectName: Cairo Hospital, Customer: Cairo Medical Group",
  "ipAddress": "192.168.1.1",
  "timestamp": "2026-02-04T10:15:30Z"
}
```

**Known Logged Actions:**
| Action | EntityType | Trigger |
|---|---|---|
| `Create` | `Project` | Project created |
| `Update` | `Project` | Project updated |
| `StatusChange` | `Project` | Status changed |
| `SoftDelete` | `Project` | Project deleted |
| `CollaboratorAdded` | `Project` | Collaborator added |
| `Create` | `Panel` | Panel created |
| `Update` | `Panel` | Panel updated |
| `StatusChange` | `Panel` | Status changed |
| `SoftDelete` | `Panel` | Panel deleted |
| `Duplicate` | `Panel` | Panel duplicated |
| `CollaboratorAdded` | `Panel` | Collaborator added |
| `Login` | `User` | Successful login |
| `FailedLogin` | `User` | Failed login attempt |
| `Logout` | `User` | Logout |
| `PasswordChanged` | `User` | Password changed |
| `Create` | `User` | User created |

---

## 7. Pricing Formula

The pricing engine is **server-side only**. Every `PanelItemDto` returned by the API already has computed values. The frontend should **display** these values, not recalculate them.

### Margin Inheritance (Priority Order)
```
PanelItem.OverrideMargin  ← highest priority
  → Panel.OverrideMargin  ← if item has no override
    → Project.DefaultMargin ← fallback
```

### Calculation Steps
```
discount    = OverrideDiscount ?? Material.DefaultDiscount  (percentage, e.g. 25 = 25%)
extra       = ExtraDiscount ?? 0

unitCost    = BasePrice × (1 - discount/100)
unitCost    = unitCost  × (1 - extra/100)        ← stacked

totalCost   = unitCost × quantity

margin%     = OverrideMargin ?? Panel.OverrideMargin ?? Project.DefaultMargin
marginAmt   = totalCost × (margin%/100)

totalPrice  = totalCost + marginAmt
```

### Panel Summary (PanelSummaryDto)
```
totalItems   = SUM(item.quantity)       ← total quantity, not distinct items
totalCost    = SUM(item.totalCost)
totalPrice   = SUM(item.totalPrice)
marginAmount = SUM(item.marginAmount)
```

### Project Summary (ProjectSummaryDto)
```
totalPanels      = count of panels
totalItems       = SUM(panel.totalItems)
totalCost        = SUM(panel.totalCost)
totalPrice       = SUM(panel.totalPrice)
totalMarginAmount = SUM(panel.marginAmount)
```

---

## 8. Collaboration System

### Two-Level Collaboration
The system supports collaboration at **both** the Project and the Panel level independently.

#### Project Collaborators
- Added by: `TenderingManager` policy
- Endpoint: `POST /api/projects/{id}/collaborators`
- Body: `{ "userId": "guid", "roleInProject": "Lead Engineer" }` — `roleInProject` is a free-text string
- Remove: `DELETE /api/projects/{id}/collaborators/{collaboratorUserId}`
- Effect: The user gains visibility to the project in `GET /api/projects`

#### Panel Collaborators
- Added by: `TenderingManager` policy
- Endpoint: `POST /api/panels/{id}/collaborators`
- Body: `{ "userId": "guid" }` — no `roleInProject` for panels
- Remove: `DELETE /api/panels/{id}/collaborators/{collaboratorUserId}`
- Effect: The user can access the panel via `GET /api/panels/{id}`

### Visibility Matrix
| User Role | Project List | Panel Access |
|---|---|---|
| SuperAdmin | All projects | All panels |
| TenderingManager | All projects | All panels |
| TenderingEngineer | Own + collaborator projects | Panels in accessible projects + direct panel collaborator |

---

## 9. Status Lifecycle

Both Projects and Panels follow the same `EntityStatus` enum.

### Allowed Transitions (managed by `TenderingManager`)
```
Draft (1) → InProgress (2) → UnderReview (3) → Approved (4)
                                              ↘ Rejected (5) → InProgress (2)
Approved (4) → Completed (6) → Archived (7)
Any state → Archived (7)
```
> ⚠️ **The backend does not enforce transition rules.** Any status value can be set directly. The frontend should enforce the logical flow above through UI state.

### Status Change Request
```
PUT /api/projects/{id}/status
PUT /api/panels/{id}/status
Body: { "newStatus": 3 }
```

---

## 10. Soft Delete System

Projects and Panels are **never hard-deleted**. The `DELETE` endpoints set:
```
IsDeleted = true
DeletedAt = DateTime.UtcNow
DeletedByUserId = currentUserId
```
All `GET` queries automatically filter out `IsDeleted = true` records at the repository level. The frontend should treat a `204 No Content` response from `DELETE` as permanent removal from the UI.

---

## 11. Audit Log System

Audit entries are written automatically by the services after every state-changing operation. The frontend does not send audit data — it only reads it.

### Filtering via `GET /api/auditlogs`
Supported query parameters:
- `userId` — filter by user
- `action` — filter by action name (e.g. `"Create"`, `"Login"`)
- `entityType` — filter by entity (e.g. `"Project"`, `"Panel"`)
- `startDate` + `endDate` — date range (both required for range filter)
- `pageNumber` — default 1
- `pageSize` — default 50

> ⚠️ Only one filter criterion is applied at a time (first matching wins). Frontend should offer separate filter modes.

---

## 12. Import / Export System

### Export (Backend → Frontend Download)
| Endpoint | Output |
|---|---|
| `GET /api/projects/{id}/export` | Full project Excel (all panels, all items, pricing) |
| `GET /api/projects/{id}/export-summary` | Summary Excel (one row per panel with totals) |
| `GET /api/panels/{id}/export` | Single panel Excel (items grouped by type) |

**Response:** Binary `.xlsx` file. Use `window.open(url)` or `fetch` + `Blob` + `URL.createObjectURL`.  
MIME type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Import (Frontend → Backend Upload)
| Endpoint | Template Download |
|---|---|
| `POST /api/import/materials` | `GET /api/import/materials/template` |
| `POST /api/import/project` | `GET /api/import/project/template` |

**Upload as:** `multipart/form-data` with field name `file`.

---

## 13. DTO Reference (Request & Response Shapes)

### PricingResultDto (internal — embedded in PanelItemDto)
```typescript
{
  basePrice: number;
  discount: number;
  extraDiscount: number;
  unitCost: number;
  quantity: number;
  totalCost: number;
  marginPercentage: number;
  marginAmount: number;
  totalPrice: number;
}
```

### TypeScript Interfaces (recommended frontend types)
```typescript
// Enums
enum EntityStatus { Draft=1, InProgress=2, UnderReview=3, Approved=4, Rejected=5, Completed=6, Archived=7 }
enum PanelItemType { Incoming=1, Outgoing=2, Enclosure=3, BusbarAndCables=4 }

// Auth
interface LoginRequest { emailOrUsername: string; password: string; }
interface LoginResponse { token: string; refreshToken: string; expiresAt: string; user: UserDto; }
interface RefreshTokenRequest { refreshToken: string; }

// User
interface UserDto {
  id: string; fullName: string; email: string; username: string;
  isActive: boolean; createdAt: string; lastLoginAt?: string;
  roles: string[]; permissions: string[];
}
interface CreateUserDto { fullName: string; email: string; username: string; password: string; isActive: boolean; roleIds: string[]; }
interface UpdateUserDto { fullName: string; email: string; username: string; isActive: boolean; }

// Role & Permission
interface RoleDto { id: string; name: string; description?: string; isSystemRole: boolean; createdAt: string; permissions: string[]; }
interface PermissionDto { id: string; name: string; description?: string; category: string; createdAt: string; }

// Project
interface ProjectDto {
  projectId: number; projectName: string; customer: string; currency: string;
  defaultMargin: number; createdDate: string; status: EntityStatus; notes?: string;
  panelCount: number; createdByUserId?: string;
}
interface ProjectDetailDto extends Omit<ProjectDto, 'panelCount'> {
  panels: PanelDto[]; collaborators: CollaboratorDto[]; summary: ProjectSummaryDto;
}
interface ProjectSummaryDto { totalPanels: number; totalItems: number; totalCost: number; totalPrice: number; totalMarginAmount: number; }
interface CollaboratorDto { id: number; userId: string; userName?: string; roleInProject?: string; addedAt: string; }

// Panel
interface PanelDto {
  panelId: number; panelName: string; description?: string; projectId: number;
  overrideMargin?: number; status: EntityStatus; itemCount: number;
  createdByUserId?: string; ownerId?: string;
}
interface PanelDetailDto extends Omit<PanelDto, 'itemCount'> {
  items: PanelItemDto[]; collaborators: CollaboratorDto[]; summary: PanelSummaryDto;
}
interface PanelSummaryDto { totalItems: number; totalCost: number; totalPrice: number; marginAmount: number; }

// Panel Item
interface PanelItemDto {
  panelItemId: number; panelId: number; materialId: number;
  itemCode: string; description: string; brand?: string; quantity: number;
  itemType: PanelItemType; basePrice: number; discount: number;
  extraDiscount?: number; unitCost: number; totalCost: number;
  margin: number; totalPrice: number; notes?: string;
}

// Material
interface MaterialDto {
  materialId: number; itemCode: string; description: string;
  ratedCurrent?: string; isc?: string; noOfPoles?: number; brand?: string;
  reference?: string; basePrice: number; defaultDiscount: number;
  category: string; isActive: boolean;
}

// Audit
interface AuditLogDto {
  id: string; userId?: string; userName?: string; action: string;
  entityType: string; entityId?: string; oldValues?: string;
  newValues?: string; ipAddress?: string; timestamp: string;
}
interface AuditLogFilter {
  userId?: string; action?: string; entityType?: string;
  startDate?: string; endDate?: string; pageNumber?: number; pageSize?: number;
}
```

---

## 14. Seeded Data (Default State)

On first startup, the database is populated with:

### Default Users
| Username | Email | Password | Role |
|---|---|---|---|
| `admin` | `admin@smartoffer.com` | `Admin@1234` | `SuperAdmin` |

### System Roles (IsSystemRole = true)
| Role | Key Permissions |
|---|---|
| `SuperAdmin` | All 39 permissions |
| `TenderingManager` | Projects (all), Panels (all), Materials (all), Pricing (all), Offers (all) |
| `TenderingEngineer` | Projects (View/Create/Edit), Panels (View/Create/Edit), Materials.View, Offers (View/Generate/Export), Pricing.View |

> Additional permissions added later (`ManageCollaborators`, `ChangeStatus`, `Duplicate`) are automatically assigned to `SuperAdmin` and `TenderingManager` on startup.

---

## 15. ⚠️ Known Gaps & Unimplemented Frontend Features

### 🔴 Critical Security Gaps (Backend)
These require backend fixes — frontend cannot work around them:

| Issue | Controllers | Impact |
|---|---|---|
| **No `[Authorize]` on PanelItemsController** | `PanelItemsController` | All panel item endpoints are publicly accessible without a token |
| **No `[Authorize]` on MaterialsController** | `MaterialsController` | Create/Update/Delete materials is open to unauthenticated users |
| **No `[Authorize]` on ImportController** | `ImportController` | Mass import of materials/projects is open to unauthenticated users |

### 🟡 Logic Gaps (Backend)
| Issue | Endpoint | Impact |
|---|---|---|
| `GET /projects/customer/{customer}` bypasses role visibility | `ProjectsController` | TenderingEngineer sees ALL projects filtered by customer, not just their own |
| `GET /projects/status/{status}` bypasses role visibility | `ProjectsController` | Same as above |
| `GET /projects/{id}/summary` has no access check | `ProjectsController` | Any authenticated user can read any project's financials |
| `GET /panels/{id}/summary` has no access check | `PanelsController` | Same for panel financials |
| `AuditLogFilterDto` multi-criteria not combined | `AuditLogsController` | Only first matching filter branch is applied |
| Status transitions not enforced | Both controllers | Any status value can be set directly |

### 🟠 Frontend Features Not Yet Wired

These endpoints **exist and work** but are likely not being called by the frontend yet:

| Feature | Endpoint(s) |
|---|---|
| Token auto-refresh | `POST /api/auth/refresh` |
| Logout | `POST /api/auth/logout` |
| Reset password (admin) | `POST /api/auth/reset-password` |
| Change project status | `PUT /api/projects/{id}/status` |
| Change panel status | `PUT /api/panels/{id}/status` |
| Add project collaborator | `POST /api/projects/{id}/collaborators` |
| Remove project collaborator | `DELETE /api/projects/{id}/collaborators/{userId}` |
| Add panel collaborator | `POST /api/panels/{id}/collaborators` |
| Remove panel collaborator | `DELETE /api/panels/{id}/collaborators/{userId}` |
| Duplicate panel | `POST /api/panels/{id}/duplicate` |
| Filter projects by customer | `GET /api/projects/customer/{customer}` |
| Filter projects by status | `GET /api/projects/status/{status}` |
| Panel/Project summary-only view | `GET /api/panels/{id}/summary`, `GET /api/projects/{id}/summary` |
| Filter panel items by type | `GET /api/panelitems/panel/{panelId}/type/{itemType}` |
| Get item type metadata | `GET /api/panelitems/types` |
| Export project to Excel | `GET /api/projects/{id}/export` |
| Export project summary | `GET /api/projects/{id}/export-summary` |
| Export panel to Excel | `GET /api/panels/{id}/export` |
| Bulk import materials | `POST /api/import/materials` |
| Import full project | `POST /api/import/project` |
| Download import templates | `GET /api/import/materials/template`, `GET /api/import/project/template` |
| View audit logs (admin panel) | `GET /api/auditlogs`, `GET /api/auditlogs/user/{userId}` |
| Activate/Deactivate user | `POST /api/users/{id}/activate`, `POST /api/users/{id}/deactivate` |
| Assign roles to user | `POST /api/users/{id}/roles` |
| Assign permissions to role | `POST /api/roles/{id}/permissions` |
| Filter permissions by category | `GET /api/permissions/categories`, `GET /api/permissions/category/{cat}` |
| Filter materials by brand | `GET /api/materials/brands` |
| Filter materials by category | `GET /api/materials/category/{category}` |

---

## 16. Frontend Integration Checklist

Use this checklist to build/verify the frontend against the backend:

### Authentication Layer
- [ ] Store `token` and `refreshToken` in `localStorage` or `sessionStorage`
- [ ] Attach `Authorization: Bearer <token>` to every API request (axios interceptor / fetch wrapper)
- [ ] On `401` response: auto-call `POST /auth/refresh` → retry original request → if refresh fails, redirect to login
- [ ] On login: decode JWT (or use `user` from response) to store `roles` and `permissions` in state
- [ ] Implement logout: call `POST /auth/logout` then clear storage
- [ ] Show `GET /api/users/me` profile in header/navbar

### Authorization in UI
- [ ] Gate entire admin panel behind `roles.includes("SuperAdmin")`
- [ ] Hide "Change Status" buttons from `TenderingEngineer`
- [ ] Hide "Add Collaborator" buttons from `TenderingEngineer`
- [ ] Show only accessible projects (the API already filters — but show correct empty states)
- [ ] Hide "Delete" material/project from `TenderingEngineer`

### Project Flow
- [ ] Project list page — calls `GET /api/projects`
- [ ] Project filter by customer — `GET /api/projects/customer/{customer}`
- [ ] Project filter by status — `GET /api/projects/status/{status}` (use EntityStatus integer)
- [ ] Project detail page — calls `GET /api/projects/{id}` (full detail with panels + summary)
- [ ] Create project form — `POST /api/projects`
- [ ] Edit project form — `PUT /api/projects/{id}`
- [ ] Delete project — `DELETE /api/projects/{id}` → remove from list
- [ ] **Status change workflow** (manager only) — `PUT /api/projects/{id}/status` with `{ newStatus: int }`
- [ ] **Collaborators tab** — list from `ProjectDetailDto.collaborators`
- [ ] **Add collaborator** (manager only) — `POST /api/projects/{id}/collaborators`
- [ ] **Remove collaborator** (manager only) — `DELETE /api/projects/{id}/collaborators/{userId}`
- [ ] Export project button — `GET /api/projects/{id}/export` (download file)
- [ ] Export summary button — `GET /api/projects/{id}/export-summary`

### Panel Flow
- [ ] Panel list within project — calls `GET /api/panels/project/{projectId}`
- [ ] Panel detail — calls `GET /api/panels/{id}` (items + summary + collaborators)
- [ ] Create panel form — `POST /api/panels` with `projectId`
- [ ] Edit panel form — `PUT /api/panels/{id}`
- [ ] Delete panel — `DELETE /api/panels/{id}`
- [ ] **Duplicate panel button** — `POST /api/panels/{id}/duplicate` → add new panel to list
- [ ] **Status change** (manager only) — `PUT /api/panels/{id}/status`
- [ ] **Panel collaborators** — show list, add/remove (manager only)
- [ ] Export panel button — `GET /api/panels/{id}/export`

### Panel Items (Material Selection)
- [ ] Load items via panel detail — already in `PanelDetailDto.items`
- [ ] Items grouped/tabbed by `itemType`: Incoming | Outgoing | Enclosure | Busbar & Cables
- [ ] Search materials — `GET /api/materials/search?term=...`
- [ ] Filter materials by category — `GET /api/materials/category/{category}`
- [ ] Fetch categories dropdown — `GET /api/materials/categories`
- [ ] Add material to panel — `POST /api/panelitems`
- [ ] Update quantity/discounts — `PUT /api/panelitems/{id}`
- [ ] Remove item — `DELETE /api/panelitems/{id}`
- [ ] Display computed: `unitCost`, `totalCost`, `margin`, `totalPrice` from the DTO
- [ ] Display panel `summary` totals (cost / price / margin)
- [ ] Get item types for filter tabs — `GET /api/panelitems/types`

### Materials Management (Admin)
- [ ] Materials list — `GET /api/materials`
- [ ] Search bar — `GET /api/materials/search?term=...`
- [ ] Filter by category — `GET /api/materials/category/{category}`
- [ ] Filter by brand — `GET /api/materials/brands` + `GET /api/materials/category/{brand}` *(note: no brand filter endpoint exists — filter client-side)*
- [ ] Create/Edit/Delete material forms
- [ ] **Import materials** — file upload to `POST /api/import/materials`
- [ ] **Download import template** — `GET /api/import/materials/template`

### User Management (SuperAdmin)
- [ ] User list — `GET /api/users`
- [ ] Create user — `POST /api/users`
- [ ] Edit user — `PUT /api/users/{id}`
- [ ] Delete user — `DELETE /api/users/{id}`
- [ ] Activate/Deactivate — `POST /api/users/{id}/activate` / `/deactivate`
- [ ] **Assign roles to user** — `POST /api/users/{id}/roles` with `{ roleIds: [...] }`

### RBAC Management (SuperAdmin)
- [ ] Roles list — `GET /api/roles`
- [ ] Create/Edit role
- [ ] **Assign permissions to role** — `POST /api/roles/{id}/permissions`
- [ ] Permissions list grouped by category — `GET /api/permissions/categories` + `GET /api/permissions/category/{cat}`

### Audit Logs (SuperAdmin)
- [ ] Audit log table — `GET /api/auditlogs` (paginated)
- [ ] Filter by user — pass `userId` query param
- [ ] Filter by action — pass `action` query param
- [ ] Filter by entity — pass `entityType` query param
- [ ] Date range filter — pass `startDate` + `endDate`
- [ ] Per-user audit trail — `GET /api/auditlogs/user/{userId}` (from user management page)

---

*Last updated: auto-generated from backend source code analysis.*
*Branch: `feature/project-panel-collaboration-audit`*
