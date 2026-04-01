# SmartOffer — Feature Documentation
> **Branch:** `feature/project-panel-collaboration-audit`  
> **Repo:** https://github.com/ahmedadel-11/SmartOffer  
> **Stack:** .NET 8 · ASP.NET Core Web API · Entity Framework Core · MediatR · JWT · BCrypt · ClosedXML

---

## Table of Contents
1. [Feature Overview (All Branches)](#1-feature-overview-all-branches)
2. [Feature 1 — Panel Item Types (Incoming & Outgoing)](#2-feature-1--panel-item-types-incoming--outgoing)
3. [Feature 2 — User Management & RBAC](#3-feature-2--user-management--rbac)
4. [Feature 3 — Project & Panel Collaboration, Status, Soft Delete, Duplication (Current Branch)](#4-feature-3--project--panel-collaboration-status-soft-delete--duplication)
5. [Feature 4 — System Role Editor (Latest Addition)](#5-feature-4--system-role-editor-latest-addition)
6. [Database Migrations Summary](#6-database-migrations-summary)
7. [Complete API Endpoint List](#7-complete-api-endpoint-list)
8. [Architecture Patterns Used](#8-architecture-patterns-used)
9. [Known Issues & Future Work](#9-known-issues--future-work)

---

## 1. Feature Overview (All Branches)

```
master
  └── add-incoming-&-outgoing         Feature 1: PanelItemType enum + item categorization
        └── User-Management-&-RBAC    Feature 2: Users, Roles, Permissions, JWT, Audit Logs
              └── feature/project-panel-collaboration-audit  ← YOU ARE HERE
                    ├── Feature 3: Project/Panel Status, Soft Delete, Collaboration, Duplicate
                    └── Feature 4: System Role Editor (PUT /api/roles/{id}/system)
```

| # | Feature | Branch | Migration |
|---|---|---|---|
| 1 | Panel Item Types | `add-incoming-&-outgoing` | `UpdatePanelItemTypeCombineBusbarCables` |
| 2 | User Management & RBAC | `User-Management-&-Role-Based-Access-Control` | `AddUserManagementAndRBAC` |
| 3 | Collaboration + Status + Soft Delete + Duplicate | `feature/project-panel-collaboration-audit` | `AddCollaborationStatusSoftDelete` |
| 4 | System Role Editor | `feature/project-panel-collaboration-audit` | *(no migration — logic only)* |

---

## 2. Feature 1 — Panel Item Types (Incoming & Outgoing)

### What It Does
Every item added to a panel is categorized into one of four electrical component types. This allows the panel BOM (Bill of Materials) to be organized into sections that match real-world electrical panel layout.

### Enum: `PanelItemType`
| Value | Int | Meaning |
|---|---|---|
| `Incoming` | 1 | Main supply, disconnects, incomer breakers |
| `Outgoing` | 2 | Circuit breakers, contactors, loads *(default)* |
| `Enclosure` | 3 | Panel body, mounting plates, doors |
| `BusbarAndCables` | 4 | Busbars, wiring, connectors |

> **Before this feature:** only `Incoming` and `Outgoing` existed as separate values. `Busbar` and `Cables` were merged into a single `BusbarAndCables` value in the migration.

### API Support
```
GET  /api/panelitems/types                          → list all types with descriptions
GET  /api/panelitems/panel/{panelId}/type/{type}    → filter items by type (int)
POST /api/panelitems                                → itemType field required
PUT  /api/panelitems/{id}                           → itemType can be changed
```

### Files Added / Changed
| File | Change |
|---|---|
| `Domain/Enums/PanelItemType.cs` | Added `Enclosure`, `BusbarAndCables`; removed separate `Busbar`/`Cables` |
| `Domain/Entities/PanelItem.cs` | `ItemType` property with default `Outgoing` |
| `Application/DTOs/PanelItemDto.cs` | `ItemType` in create/update/response DTOs |
| `API/Controllers/PanelItemsController.cs` | `GET /types`, `GET /panel/{id}/type/{type}` endpoints |
| `Infrastructure/Migrations/...UpdatePanelItemTypeCombineBusbarCables.cs` | Data migration: merged old enum values |

---

## 3. Feature 2 — User Management & RBAC

### What It Does
A complete identity and access control system on top of the existing project/panel domain. Introduces Users, Roles, Permissions, JWT-based authentication, refresh tokens, account lockout, and a full audit trail.

### Entities Introduced
| Entity | Purpose |
|---|---|
| `User` | System user with BCrypt password, lockout, last login tracking |
| `Role` | Named permission group (e.g. `TenderingManager`) |
| `Permission` | Granular action right (e.g. `Projects.Create`) |
| `UserRole` | Many-to-many join: User ↔ Role |
| `RolePermission` | Many-to-many join: Role ↔ Permission |
| `AuditLog` | Immutable event record of every state-changing action |

### Authentication Flow
```
POST /api/auth/login
  → validate credentials (BCrypt)
  → check IsActive, LockoutEndTime
  → reset FailedLoginAttempts on success
  → increment + lock on failure (5 attempts → 15 min lockout)
  → return { token (JWT), refreshToken (opaque), expiresAt, user }

JWT Claims: nameidentifier, email, name, FullName, role[], Permission[]

POST /api/auth/refresh   → exchange refreshToken for new JWT pair
POST /api/auth/logout    → invalidate refreshToken
POST /api/auth/change-password  → own account only
POST /api/auth/reset-password   → SuperAdmin resets any user's password
```

### RBAC System
Three seeded system roles (cannot be deleted):

| Role | Key Permissions |
|---|---|
| `SuperAdmin` | All 39 permissions |
| `TenderingManager` | Projects (all), Panels (all), Materials (all), Pricing (all), Offers (all) |
| `TenderingEngineer` | Projects (View/Create/Edit), Panels (View/Create/Edit), Materials.View, Pricing.View, Offers (View/Generate/Export) |

**Project Visibility rule:**
- `SuperAdmin` / `TenderingManager` → see all projects
- `TenderingEngineer` → see only own projects + projects where added as collaborator

### Seeded Default Admin
| Username | Email | Password | Role |
|---|---|---|---|
| `admin` | `admin@smartoffer.com` | `Admin@1234` | `SuperAdmin` |

### Audit Log System
Every create/update/delete/login action is recorded in `AuditLogs` with:
- `UserId`, `Action`, `EntityType`, `EntityId`
- `OldValues` / `NewValues` (human-readable strings)
- `IpAddress`, `Timestamp`

**Logged Actions:** `Create`, `Update`, `SoftDelete`, `StatusChange`, `CollaboratorAdded`, `Duplicate`, `Login`, `FailedLogin`, `Logout`, `PasswordChanged`, `RoleCreated`, `RoleUpdated`, `SystemRoleUpdated`, `PermissionsAssigned`

### Files Added / Changed
| File | Change |
|---|---|
| `Domain/Entities/User.cs` | New entity with lockout fields |
| `Domain/Entities/Role.cs` | New entity with `IsSystemRole` flag |
| `Domain/Entities/Permission.cs` | New entity with `Category` grouping |
| `Domain/Entities/UserRole.cs` | Join table |
| `Domain/Entities/RolePermission.cs` | Join table |
| `Domain/Entities/AuditLog.cs` | Audit record entity |
| `Domain/Interfaces/IUserRepository.cs` | Repository interface |
| `Domain/Interfaces/IRoleRepository.cs` | Repository interface |
| `Domain/Interfaces/IPermissionRepository.cs` | Repository interface |
| `Domain/Interfaces/IAuditLogRepository.cs` | Repository interface |
| `Application/DTOs/AuthDto.cs` | Login/refresh/change-password DTOs |
| `Application/DTOs/UserDto.cs` | User CRUD DTOs |
| `Application/DTOs/RoleDto.cs` | Role CRUD + assign permissions DTOs |
| `Application/DTOs/PermissionDto.cs` | Permission CRUD DTOs |
| `Application/DTOs/AuditLogDto.cs` | Audit log response + filter DTO |
| `Application/Interfaces/IAuthService.cs` | Auth service interface |
| `Application/Interfaces/IUserService.cs` | User service interface |
| `Application/Interfaces/IRoleService.cs` | Role service interface |
| `Application/Interfaces/IPermissionService.cs` | Permission service interface |
| `Application/Interfaces/IAuditService.cs` | Audit service interface |
| `Application/Interfaces/IJwtService.cs` | JWT service interface |
| `Application/Services/AuthService.cs` | Login, refresh, logout, password management |
| `Application/Services/UserService.cs` | User CRUD + activate/deactivate + assign roles |
| `Application/Services/RoleService.cs` | Role CRUD + permission assignment |
| `Application/Services/PermissionService.cs` | Permission CRUD + category queries |
| `Application/Services/AuditService.cs` | Log writer + filtered reader |
| `Infrastructure/Services/JwtService.cs` | JWT access token generation + refresh token store |
| `Infrastructure/Repositories/UserRepository.cs` | EF Core user queries |
| `Infrastructure/Repositories/RoleRepository.cs` | EF Core role queries |
| `Infrastructure/Repositories/PermissionRepository.cs` | EF Core permission queries |
| `Infrastructure/Repositories/AuditLogRepository.cs` | EF Core audit log queries |
| `Infrastructure/Data/DatabaseSeeder.cs` | Seeds 39 permissions, 3 roles, 1 admin user |
| `API/Controllers/AuthController.cs` | Auth endpoints |
| `API/Controllers/UsersController.cs` | User management endpoints |
| `API/Controllers/RolesController.cs` | Role management endpoints |
| `API/Controllers/PermissionsController.cs` | Permission management endpoints |
| `API/Controllers/AuditLogsController.cs` | Audit log query endpoints |
| `API/Authorization/RequirePermissionAttribute.cs` | Custom `[RequirePermission("X.Y")]` attribute |
| `Infrastructure/Migrations/...AddUserManagementAndRBAC.cs` | Creates Users, Roles, Permissions, UserRoles, RolePermissions, AuditLogs tables |

---

## 4. Feature 3 — Project & Panel Collaboration, Status, Soft Delete & Duplication

> **This is the main feature of the current branch.**

### 4.1 — Soft Delete (Projects & Panels)

Projects and Panels are never hard-deleted. `DELETE` endpoints set:
```
IsDeleted        = true
DeletedAt        = DateTime.UtcNow
DeletedByUserId  = currentUserId
```
All repository queries automatically filter `WHERE IsDeleted = false`. The record remains in the database for audit/recovery purposes.

**New columns added to `Projects` and `Panels`:**
- `IsDeleted` (bool, default `false`)
- `DeletedAt` (DateTime?)
- `DeletedByUserId` (Guid?)
- `CreatedByUserId` (Guid?)
- `UpdatedByUserId` (Guid?)

**CQRS Commands:**
```
SoftDeleteProjectCommand(projectId, userId)  → IRequest<bool>
SoftDeletePanelCommand(panelId, userId)      → IRequest<bool>
```

**Endpoints:**
```
DELETE /api/projects/{id}   → 204 No Content  (soft delete)
DELETE /api/panels/{id}     → 204 No Content  (soft delete)
```

---

### 4.2 — Entity Status Lifecycle

Both `Project` and `Panel` share the same `EntityStatus` enum:

```
Draft (1) → InProgress (2) → UnderReview (3) → Approved (4) → Completed (6) → Archived (7)
                                              ↘ Rejected (5) → InProgress (2)
Any state ──────────────────────────────────────────────────────────────────→ Archived (7)
```

> ⚠️ The backend does not enforce transition order — it accepts any integer. Transition logic should be enforced in the frontend UI.

**Column migration:** `Status` column changed from `nvarchar(50)` (string) to `int` (enum value). Existing data was migrated with a `CASE WHEN` SQL statement.

**New ownership columns added:** `CreatedByUserId`, `UpdatedByUserId`.

**CQRS Commands:**
```
ChangeProjectStatusCommand(projectId, newStatus, userId)  → IRequest<ProjectDto?>
ChangePanelStatusCommand(panelId, newStatus, userId)      → IRequest<PanelDto?>
```

**Endpoints (TenderingManager only):**
```
PUT /api/projects/{id}/status    Body: { "newStatus": 3 }
PUT /api/panels/{id}/status      Body: { "newStatus": 3 }
```

**Audit logged:** `Action = "StatusChange"`, `OldValues = "Draft"`, `NewValues = "InProgress"`

---

### 4.3 — Collaboration System

Collaboration is supported independently at **both** the Project and Panel level.

#### Project Collaborators (`ProjectCollaborator` entity)
| Field | Type | Notes |
|---|---|---|
| `Id` | int | PK |
| `ProjectId` | int | FK → Project |
| `UserId` | Guid | FK → User |
| `RoleInProject` | string? | Free-text label (e.g. "Lead Engineer") |
| `AddedByUserId` | Guid? | Who added this collaborator |
| `AddedAt` | DateTime | UTC |

**CQRS Command:**
```
AddProjectCollaboratorCommand(projectId, collaboratorUserId, roleInProject, addedByUserId)
```

**Endpoints (TenderingManager only):**
```
POST   /api/projects/{id}/collaborators
       Body: { "userId": "guid", "roleInProject": "Lead Engineer" }
       Response: CollaboratorDto

DELETE /api/projects/{id}/collaborators/{collaboratorUserId}
       Response: 204 No Content
```

**Effect on visibility:** Once a user is added as a collaborator, `GET /api/projects` will include this project in their results, even if they are a `TenderingEngineer`.

---

#### Panel Collaborators (`PanelCollaborator` entity)
| Field | Type | Notes |
|---|---|---|
| `Id` | int | PK |
| `PanelId` | int | FK → Panel |
| `UserId` | Guid | FK → User |
| `AddedByUserId` | Guid? | |
| `AddedAt` | DateTime | UTC |

> ⚠️ **No `RoleInProject` field on Panel collaborators.** The `CollaboratorDto` returns `null` for `roleInProject` on panel collaborators.

**CQRS Command:**
```
AddPanelCollaboratorCommand(panelId, collaboratorUserId, addedByUserId)
```

**Endpoints (TenderingManager only):**
```
POST   /api/panels/{id}/collaborators
       Body: { "userId": "guid" }
       Response: CollaboratorDto

DELETE /api/panels/{id}/collaborators/{collaboratorUserId}
       Response: 204 No Content
```

**Collaborator Response (`CollaboratorDto`):**
```json
{
  "id": 1,
  "userId": "guid",
  "userName": "Ahmed Ali",
  "roleInProject": "Lead Engineer",
  "addedAt": "2026-02-17T10:00:00Z"
}
```

---

### 4.4 — Panel Duplication

Creates a deep copy of a panel including **all its items** (`PanelItem` records), assigned to the same project.

**What gets copied:**
- `PanelName` → suffixed with `" (Copy)"`
- `Description`
- `ProjectId` (same project)
- `OverrideMargin`
- All `PanelItem` rows (MaterialId, Quantity, ItemType, OverrideDiscount, OverrideMargin, ExtraDiscount, Notes)

**What is reset on the copy:**
- `Status` → `Draft`
- `CreatedByUserId` → current user
- `OwnerId` → current user
- `CreatedAt` → now
- `IsDeleted` → false

**CQRS Command:**
```
DuplicatePanelCommand(panelId, userId)  → IRequest<PanelDto>
```

**Endpoint (TenderingEngineer minimum):**
```
POST /api/panels/{id}/duplicate
Response 201 Created: PanelDto (the new copy)
```

**Audit logged:** `Action = "Duplicate"`, `NewValues = "Duplicated from Panel #{originalId}"`

---

### 4.5 — Project Visibility (Role-Based Filtering)

`GET /api/projects` applies visibility rules based on the caller's role:

| Role | Returns |
|---|---|
| `SuperAdmin` | All non-deleted projects |
| `TenderingManager` | All non-deleted projects |
| `TenderingEngineer` | Only projects where `CreatedByUserId == userId` OR user is in `ProjectCollaborators` |

**Repository method:** `IProjectRepository.GetAccessibleByUserAsync(userId)`

---

### 4.6 — New Repository Methods

**`IProjectRepository` additions:**
```csharp
Task<IEnumerable<Project>> GetAccessibleByUserAsync(Guid userId);
Task<Project?> GetWithFullDetailsAsync(int id);
Task<Project?> GetWithCollaboratorsAsync(int id);
Task<IEnumerable<Project>> GetByCustomerAsync(string customer);
Task<IEnumerable<Project>> GetByStatusAsync(EntityStatus status);
```

**`IPanelRepository` additions:**
```csharp
Task<IEnumerable<Panel>> GetByProjectIdAsync(int projectId);
Task<Panel?> GetWithItemsAsync(int id);
Task<Panel?> GetWithCollaboratorsAsync(int id);
Task<bool> CanUserAccessPanelAsync(int panelId, Guid userId, IEnumerable<string> userRoles);
```

---

### Files Added / Changed in This Branch

| File | Change |
|---|---|
| `Domain/Entities/Project.cs` | Added `IsDeleted`, `DeletedAt`, `DeletedByUserId`, `CreatedByUserId`, `UpdatedByUserId`, `Status` (now enum), `Collaborators` nav |
| `Domain/Entities/Panel.cs` | Same soft-delete + ownership + status + `Collaborators` nav |
| `Domain/Entities/ProjectCollaborator.cs` | **New** join entity |
| `Domain/Entities/PanelCollaborator.cs` | **New** join entity |
| `Domain/Enums/EntityStatus.cs` | **New** enum (7 values) |
| `Domain/Interfaces/IProjectRepository.cs` | Added 5 new query methods |
| `Domain/Interfaces/IPanelRepository.cs` | Added 4 new query methods |
| `Application/Commands/SoftDeleteProjectCommand.cs` | **New** MediatR command |
| `Application/Commands/SoftDeletePanelCommand.cs` | **New** MediatR command |
| `Application/Commands/ChangeProjectStatusCommand.cs` | **New** MediatR command |
| `Application/Commands/ChangePanelStatusCommand.cs` | **New** MediatR command |
| `Application/Commands/AddProjectCollaboratorCommand.cs` | **New** MediatR command |
| `Application/Commands/AddPanelCollaboratorCommand.cs` | **New** MediatR command |
| `Application/Commands/DuplicatePanelCommand.cs` | **New** MediatR command |
| `Application/Handlers/SoftDeleteProjectHandler.cs` | **New** MediatR handler |
| `Application/Handlers/SoftDeletePanelHandler.cs` | **New** MediatR handler |
| `Application/Handlers/ChangeProjectStatusHandler.cs` | **New** MediatR handler |
| `Application/Handlers/ChangePanelStatusHandler.cs` | **New** MediatR handler |
| `Application/Handlers/AddProjectCollaboratorHandler.cs` | **New** MediatR handler |
| `Application/Handlers/AddPanelCollaboratorHandler.cs` | **New** MediatR handler |
| `Application/Handlers/DuplicatePanelHandler.cs` | **New** MediatR handler |
| `Application/DTOs/ProjectDto.cs` | Added `CollaboratorDto`, `AddCollaboratorDto`, `ChangeStatusDto`, `ProjectSummaryDto`, `ProjectDetailDto` |
| `Application/DTOs/PanelDto.cs` | Added `PanelDetailDto`, `PanelSummaryDto` |
| `Application/Interfaces/IProjectService.cs` | Added `ChangeStatusAsync`, `SoftDeleteAsync`, `AddCollaboratorAsync`, `RemoveCollaboratorAsync`, `GetSummaryAsync`, `CanUserAccessProjectAsync` |
| `Application/Interfaces/IPanelService.cs` | Added `ChangeStatusAsync`, `SoftDeleteAsync`, `DuplicateAsync`, `AddCollaboratorAsync`, `RemoveCollaboratorAsync`, `GetSummaryAsync`, `CanUserAccessPanelAsync` |
| `Application/Services/ProjectService.cs` | Implemented all new interface methods + audit logging |
| `Application/Services/PanelService.cs` | Implemented all new interface methods + audit logging |
| `Application/Interfaces/IAuditService.cs` | Extended `LogAsync` signature |
| `Application/Services/AuditService.cs` | Extended filtering logic |
| `Infrastructure/Repositories/ProjectRepository.cs` | Implemented 5 new query methods |
| `Infrastructure/Repositories/PanelRepository.cs` | Implemented 4 new query methods |
| `Infrastructure/Data/SmartOfferDbContext.cs` | Registered `ProjectCollaborator`, `PanelCollaborator` DbSets + global `IsDeleted` filter |
| `Infrastructure/Data/DatabaseSeeder.cs` | Added seeding for new permissions (`ManageCollaborators`, `ChangeStatus`, `Duplicate`) |
| `Infrastructure/Migrations/...AddCollaborationStatusSoftDelete.cs` | Migration for all new columns + new tables |
| `API/Controllers/ProjectsController.cs` | New endpoints: status, collaborators, export-summary |
| `API/Controllers/PanelsController.cs` | New endpoints: status, collaborators, duplicate, summary, export |

---

## 5. Feature 4 — System Role Editor (Latest Addition)

### What It Does
Allows a `SuperAdmin` to edit the **description** and **permission set** of the three locked system roles (`SuperAdmin`, `TenderingManager`, `TenderingEngineer`) which were previously completely immutable.

### Why Name Is Locked
The role names are hardcoded in `[Authorize(Policy = "TenderingManager")]` etc. in the controllers. Changing them would silently break all authorization without a compile error.

### New Endpoint
```
PUT /api/roles/{id}/system
Authorization: Bearer <SuperAdmin token>

Body:
{
  "description": "Updated description",
  "permissionIds": ["guid1", "guid2", ...]
}

Success: 200 OK → RoleDto
Errors:
  404 Not Found         → role ID does not exist
  400 Bad Request       → role is NOT a system role (use PUT /api/roles/{id} for custom roles)
```

> ⚠️ `permissionIds` is a **full replacement**, not a merge. Always send the complete desired permission set.

### Difference from `POST /api/roles/{id}/permissions`
| | `POST /{id}/permissions` | `PUT /{id}/system` |
|---|---|---|
| Works on system roles? | ✅ Yes | ✅ Yes |
| Works on custom roles? | ✅ Yes | ❌ No |
| Updates description? | ❌ No | ✅ Yes |
| Updates permissions? | ✅ Yes | ✅ Yes |
| Audit action | `SystemRolePermissionsAssigned` / `PermissionsAssigned` | `SystemRoleUpdated` |

### Audit Logged
```
Action:    "SystemRoleUpdated"
EntityType: "Role"
OldValues:  "Description: ..., Permissions: Projects.View, Projects.Create, ..."
NewValues:  "Description: ..., Permissions: Projects.View, Projects.Create, ..."
```

### Files Changed
| File | Change |
|---|---|
| `Application/DTOs/RoleDto.cs` | Added `UpdateSystemRoleDto` class |
| `Application/Interfaces/IRoleService.cs` | Added `UpdateSystemRoleAsync` method |
| `Application/Services/RoleService.cs` | Implemented `UpdateSystemRoleAsync` with audit logging |
| `API/Controllers/RolesController.cs` | Added `PUT /api/roles/{id}/system` endpoint |

---

## 6. Database Migrations Summary

| Migration | Date | What It Creates / Alters |
|---|---|---|
| `InitialCreate` | 2026-02-04 | `Projects`, `Panels`, `PanelItems`, `Materials` tables |
| `AddPanelItemType` | 2026-02-05 | Adds `ItemType` column to `PanelItems` |
| `UpdatePanelItemTypeCombineBusbarCables` | 2026-02-05 | Merges old Busbar+Cables enum values into `BusbarAndCables` |
| `AddUserManagementAndRBAC` | 2026-02-17 | Creates `Users`, `Roles`, `Permissions`, `UserRoles`, `RolePermissions`, `AuditLogs` |
| `AddCollaborationStatusSoftDelete` | 2026-02-17 | Adds soft-delete + ownership columns to Projects & Panels; creates `ProjectCollaborators`, `PanelCollaborators`; converts Status from string to int |

---

## 7. Complete API Endpoint List

### Auth — `/api/auth`
| Method | Route | Auth | Feature |
|---|---|---|---|
| POST | `/login` | Anonymous | F2 |
| POST | `/refresh` | Anonymous | F2 |
| POST | `/logout` | Any | F2 |
| POST | `/change-password` | Any | F2 |
| POST | `/reset-password` | SuperAdmin | F2 |

### Users — `/api/users` (SuperAdmin)
| Method | Route | Feature |
|---|---|---|
| GET | `/` | F2 |
| GET | `/{id}` | F2 |
| GET | `/me` | F2 |
| POST | `/` | F2 |
| PUT | `/{id}` | F2 |
| DELETE | `/{id}` | F2 |
| POST | `/{id}/activate` | F2 |
| POST | `/{id}/deactivate` | F2 |
| POST | `/{id}/roles` | F2 |

### Roles — `/api/roles` (SuperAdmin)
| Method | Route | Feature |
|---|---|---|
| GET | `/` | F2 |
| GET | `/{id}` | F2 |
| POST | `/` | F2 |
| PUT | `/{id}` | F2 — custom roles only |
| PUT | `/{id}/system` | **F4 — system roles only** |
| DELETE | `/{id}` | F2 |
| POST | `/{id}/permissions` | F2 — custom roles only |

### Permissions — `/api/permissions` (SuperAdmin)
| Method | Route | Feature |
|---|---|---|
| GET | `/` | F2 |
| GET | `/{id}` | F2 |
| GET | `/categories` | F2 |
| GET | `/category/{category}` | F2 |
| POST | `/` | F2 |
| PUT | `/{id}` | F2 |
| DELETE | `/{id}` | F2 |

### Projects — `/api/projects` (TenderingEngineer+)
| Method | Route | Auth | Feature |
|---|---|---|---|
| GET | `/` | Engineer | F3 (role-filtered) |
| GET | `/{id}` | Engineer | F3 (access check) |
| GET | `/{id}/summary` | Engineer | F3 |
| GET | `/customer/{customer}` | Engineer | F3 |
| GET | `/status/{status}` | Engineer | F3 |
| POST | `/` | Engineer | F3 |
| PUT | `/{id}` | Engineer | F3 |
| DELETE | `/{id}` | Engineer | F3 (soft delete) |
| PUT | `/{id}/status` | **Manager** | F3 |
| POST | `/{id}/collaborators` | **Manager** | F3 |
| DELETE | `/{id}/collaborators/{userId}` | **Manager** | F3 |
| GET | `/{id}/export` | Engineer | F3 |
| GET | `/{id}/export-summary` | Engineer | F3 |

### Panels — `/api/panels` (TenderingEngineer+)
| Method | Route | Auth | Feature |
|---|---|---|---|
| GET | `/project/{projectId}` | Engineer | F3 |
| GET | `/{id}` | Engineer | F3 (access check) |
| GET | `/{id}/summary` | Engineer | F3 |
| POST | `/` | Engineer | F3 |
| PUT | `/{id}` | Engineer | F3 |
| DELETE | `/{id}` | Engineer | F3 (soft delete) |
| POST | `/{id}/duplicate` | Engineer | F3 |
| PUT | `/{id}/status` | **Manager** | F3 |
| POST | `/{id}/collaborators` | **Manager** | F3 |
| DELETE | `/{id}/collaborators/{userId}` | **Manager** | F3 |
| GET | `/{id}/export` | Engineer | F3 |

### Panel Items — `/api/panelitems` (⚠️ No Auth)
| Method | Route | Feature |
|---|---|---|
| GET | `/panel/{panelId}` | F1 |
| GET | `/panel/{panelId}/type/{type}` | F1 |
| GET | `/types` | F1 |
| GET | `/{id}` | F1 |
| POST | `/` | F1 |
| PUT | `/{id}` | F1 |
| DELETE | `/{id}` | F1 |

### Materials — `/api/materials` (⚠️ No Auth)
| Method | Route |
|---|---|
| GET | `/` |
| GET | `/{id}` |
| GET | `/search?term=` |
| GET | `/categories` |
| GET | `/brands` |
| GET | `/category/{category}` |
| POST | `/` |
| PUT | `/{id}` |
| DELETE | `/{id}` |

### Import — `/api/import` (⚠️ No Auth)
| Method | Route |
|---|---|
| POST | `/materials` |
| POST | `/project` |
| GET | `/materials/template` |
| GET | `/project/template` |

### Audit Logs — `/api/auditlogs` (SuperAdmin)
| Method | Route |
|---|---|
| GET | `/` |
| GET | `/user/{userId}` |

---

## 8. Architecture Patterns Used

### Clean Architecture (4 Layers)
```
API → Application → Domain ← Infrastructure
```
- **Domain** has zero dependencies (pure entities, interfaces, enums)
- **Application** depends only on Domain (services, DTOs, commands, handlers, interfaces)
- **Infrastructure** implements Domain interfaces (EF Core, JWT, Excel)
- **API** composes everything (controllers, DI, middleware)

### CQRS with MediatR
All state-changing operations that require cross-service orchestration use MediatR:

| Command | Handler | Routes to |
|---|---|---|
| `SoftDeleteProjectCommand` | `SoftDeleteProjectHandler` | `IProjectService.SoftDeleteAsync` |
| `SoftDeletePanelCommand` | `SoftDeletePanelHandler` | `IPanelService.SoftDeleteAsync` |
| `ChangeProjectStatusCommand` | `ChangeProjectStatusHandler` | `IProjectService.ChangeStatusAsync` |
| `ChangePanelStatusCommand` | `ChangePanelStatusHandler` | `IPanelService.ChangeStatusAsync` |
| `AddProjectCollaboratorCommand` | `AddProjectCollaboratorHandler` | `IProjectService.AddCollaboratorAsync` |
| `AddPanelCollaboratorCommand` | `AddPanelCollaboratorHandler` | `IPanelService.AddCollaboratorAsync` |
| `DuplicatePanelCommand` | `DuplicatePanelHandler` | `IPanelService.DuplicateAsync` |

### Repository + Unit of Work
- All data access goes through `IUnitOfWork` → `IRepository<T>` or specialized repository interfaces
- Single `SaveChangesAsync()` call per operation

### Server-Side Pricing
All pricing calculations (`UnitCost`, `TotalCost`, `Margin`, `TotalPrice`) are computed server-side in `PricingService` and returned with every `PanelItemDto`. The frontend displays computed values only.

---

## 9. Known Issues & Future Work

### 🔴 Security (Must Fix)
| Issue | Files |
|---|---|
| `PanelItemsController` has no `[Authorize]` | `PanelItemsController.cs` |
| `MaterialsController` has no `[Authorize]` | `MaterialsController.cs` |
| `ImportController` has no `[Authorize]` | `ImportController.cs` |

### 🟡 Logic Issues (Should Fix)
| Issue | Impact |
|---|---|
| `GET /projects/customer/` and `/status/` bypass role visibility | Engineers see all projects |
| `GET /projects/{id}/summary` has no access check | Any user can read financials |
| `GET /panels/{id}/summary` has no access check | Same as above |
| `AuditLogFilterDto` applies only one filter at a time | Combined filters silently ignored |
| Status transitions not enforced server-side | Any status value can be set directly |

### 🟠 Frontend Not Yet Wired
- Token auto-refresh (`POST /auth/refresh`)
- Status change workflow UI
- Collaborator management UI
- Panel duplicate button
- Excel export/download buttons
- Bulk import UI with template download
- Audit logs page
- User activate/deactivate
- Assign roles to user UI
- System role editor UI (`PUT /api/roles/{id}/system`)
