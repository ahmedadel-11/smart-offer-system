# SmartOffer — Changelog
> **Branch:** `feature/project-panel-collaboration-audit`  
> **Scope:** New features and fixes added on top of the base branch — this file covers only what changed, not the full system.

---

## Table of Contents
1. [Feature: System Role Editor](#1-feature-system-role-editor)
2. [Fix: System Role Permissions via Existing Endpoint](#2-fix-system-role-permissions-via-existing-endpoint)
3. [Security Fix: Unprotected Controllers](#3-security-fix-unprotected-controllers)
4. [Logic Fix: Project Visibility Bypass](#4-logic-fix-project-visibility-bypass)
5. [Logic Fix: Missing Access Checks on Summary Endpoints](#5-logic-fix-missing-access-checks-on-summary-endpoints)
6. [Files Changed Summary](#6-files-changed-summary)
7. [Full Auth Matrix After All Fixes](#7-full-auth-matrix-after-all-fixes)

---

## 1. Feature: System Role Editor

### Problem
The three built-in system roles (`SuperAdmin`, `TenderingManager`, `TenderingEngineer`) were completely immutable — name, description, and permissions were all locked. There was no way to adjust their permission sets without modifying and redeploying code.

### Solution
A new dedicated endpoint was added that allows a `SuperAdmin` to update the **description** and **full permission set** of any system role.

> The role **Name** remains permanently locked because it is hardcoded in `[Authorize(Policy = "...")]` on every controller. Changing it would silently break all authorization.

### New Endpoint

```
PUT /api/roles/{id}/system
Authorization: Bearer <SuperAdmin JWT>
```

**Request body:**
```json
{
  "description": "Updated description for this system role",
  "permissionIds": [
    "perm-guid-1",
    "perm-guid-2"
  ]
}
```

**Responses:**
| Code | Meaning |
|---|---|
| `200 OK` | Returns updated `RoleDto` |
| `404 Not Found` | Role ID does not exist |
| `400 Bad Request` | Role is NOT a system role — use `PUT /api/roles/{id}` instead |

> ⚠️ `permissionIds` is a **full replacement**, not a merge. Send the complete desired list every time.

**Audit log entry written on success:**
```
Action:     "SystemRoleUpdated"
EntityType: "Role"
OldValues:  "Description: ..., Permissions: Projects.View, Projects.Create, ..."
NewValues:  "Description: ..., Permissions: Projects.View, Projects.Edit, ..."
```

### Files Changed
| File | Change |
|---|---|
| `Application/DTOs/RoleDto.cs` | Added `UpdateSystemRoleDto` class (`Description?` + `PermissionIds`) |
| `Application/Interfaces/IRoleService.cs` | Added `UpdateSystemRoleAsync(Guid id, UpdateSystemRoleDto dto, Guid updatedBy)` |
| `Application/Services/RoleService.cs` | Implemented `UpdateSystemRoleAsync` with full permission replacement and audit logging |
| `API/Controllers/RolesController.cs` | Added `PUT /api/roles/{id}/system` endpoint |

---

## 2. Fix: System Role Permissions via Existing Endpoint

### Problem
`POST /api/roles/{id}/permissions` was blocked for system roles:
```
400 Bad Request: "Cannot modify system role permissions."
```
This meant even `SuperAdmin` could not use the existing permissions endpoint on system roles.

### Solution
Removed the `IsSystemRole` guard from `AssignPermissionsAsync`. The audit action is now dynamically chosen to distinguish the two cases:

```csharp
var auditAction = role.IsSystemRole ? "SystemRolePermissionsAssigned" : "PermissionsAssigned";
```

### Endpoint Comparison After Fix

| Capability | `POST /{id}/permissions` | `PUT /{id}/system` |
|---|---|---|
| Works on system roles | ✅ Yes | ✅ Yes |
| Works on custom roles | ✅ Yes | ❌ No |
| Updates `Description` | ❌ No | ✅ Yes |
| Updates permissions | ✅ Yes | ✅ Yes |
| Audit action | `SystemRolePermissionsAssigned` or `PermissionsAssigned` | `SystemRoleUpdated` |

**Use `POST /{id}/permissions`** when you only need to replace the permission set.  
**Use `PUT /{id}/system`** when you also want to update the description at the same time.

### Files Changed
| File | Change |
|---|---|
| `Application/Services/RoleService.cs` | Removed `if (role.IsSystemRole) throw` from `AssignPermissionsAsync`; improved audit action name |

---

## 3. Security Fix: Unprotected Controllers

### Problem Discovered
A user **without any `Materials.Edit` permission** was able to successfully call `PUT /api/materials/{id}` and edit a material. Investigation confirmed that three controllers had **no `[Authorize]` attribute at all** — every request, including unauthenticated ones, was accepted by the framework.

### Affected Controllers & Fixes

#### `MaterialsController`
**Before:** No auth on any endpoint.  
**After:**

| Endpoint | Auth Required |
|---|---|
| `GET /` | `TenderingEngineer+` (any authenticated user) |
| `GET /{id}` | `TenderingEngineer+` |
| `GET /search` | `TenderingEngineer+` |
| `GET /categories` | `TenderingEngineer+` |
| `GET /brands` | `TenderingEngineer+` |
| `GET /category/{cat}` | `TenderingEngineer+` |
| `POST /` | `TenderingManager+` |
| `PUT /{id}` | `TenderingManager+` |
| `DELETE /{id}` | `TenderingManager+` |

**Code change:**
```csharp
// Class level — covers all GET endpoints
[Authorize(Policy = "TenderingEngineer")]
public class MaterialsController : ControllerBase

// Individual write endpoints
[HttpPost]
[Authorize(Policy = "TenderingManager")]

[HttpPut("{id}")]
[Authorize(Policy = "TenderingManager")]

[HttpDelete("{id}")]
[Authorize(Policy = "TenderingManager")]
```

---

#### `PanelItemsController`
**Before:** No auth — anyone could add/modify/delete panel items.  
**After:** All endpoints require `TenderingEngineer+`.

```csharp
[Authorize(Policy = "TenderingEngineer")]
public class PanelItemsController : ControllerBase
```

---

#### `ImportController`
**Before:** No auth — anyone could bulk-import hundreds of materials or entire projects.  
**After:**

| Endpoint | Auth Required |
|---|---|
| `GET /materials/template` | Any authenticated user |
| `GET /project/template` | Any authenticated user |
| `POST /materials` | `TenderingManager+` |
| `POST /project` | `TenderingManager+` |

```csharp
// Class level — covers template downloads
[Authorize]
public class ImportController : ControllerBase

// Bulk write operations
[HttpPost("materials")]
[Authorize(Policy = "TenderingManager")]

[HttpPost("project")]
[Authorize(Policy = "TenderingManager")]
```

### Files Changed
| File | Change |
|---|---|
| `API/Controllers/MaterialsController.cs` | Added `using Microsoft.AspNetCore.Authorization`; class-level `[Authorize(Policy = "TenderingEngineer")]`; `[Authorize(Policy = "TenderingManager")]` on POST, PUT, DELETE |
| `API/Controllers/PanelItemsController.cs` | Added `using Microsoft.AspNetCore.Authorization`; class-level `[Authorize(Policy = "TenderingEngineer")]` |
| `API/Controllers/ImportController.cs` | Added `using Microsoft.AspNetCore.Authorization`; class-level `[Authorize]`; `[Authorize(Policy = "TenderingManager")]` on POST endpoints |

---

## 4. Logic Fix: Project Visibility Bypass

### Problem
Two filter endpoints called the repository directly and bypassed the role-based visibility rules that `GET /api/projects` correctly enforces:

```csharp
// BEFORE — called repository directly, returned ALL projects regardless of who's asking
GET /api/projects/customer/{customer}  →  _projectService.GetByCustomerAsync(customer)
GET /api/projects/status/{status}      →  _projectService.GetByStatusAsync(status)
```

A `TenderingEngineer` could call `GET /api/projects/status/1` and see every project in Draft status — including projects created by other engineers they have no access to.

### Solution
Both endpoints now go through `GetAllAsync(userId, roles)` — the same role-aware method used by `GET /api/projects` — and apply the filter in memory:

```csharp
// AFTER — applies role visibility first, then filters
var projects = await _projectService.GetAllAsync(userId, roles);
return Ok(projects.Where(p => p.Customer.Equals(customer, StringComparison.OrdinalIgnoreCase)));

var projects = await _projectService.GetAllAsync(userId, roles);
return Ok(projects.Where(p => p.Status == status));
```

**Visibility rules enforced on all three project list endpoints now:**
| Role | What is returned |
|---|---|
| `SuperAdmin` | All non-deleted projects |
| `TenderingManager` | All non-deleted projects |
| `TenderingEngineer` | Only own projects + collaborator projects |

### Files Changed
| File | Change |
|---|---|
| `API/Controllers/ProjectsController.cs` | `GetByCustomer` and `GetByStatus` now call `GetAllAsync(userId, roles)` + in-memory filter |

---

## 5. Logic Fix: Missing Access Checks on Summary Endpoints

### Problem
Two summary endpoints had no access control — any authenticated user could read the financial summary of any project or panel they don't have access to:

```csharp
// BEFORE — no access check
GET /api/projects/{id}/summary  →  returns TotalCost, TotalPrice, MarginAmount for any project
GET /api/panels/{id}/summary    →  returns TotalCost, TotalPrice, MarginAmount for any panel
```

### Solution
Both endpoints now call the same access guard used by their detail counterparts:

```csharp
// ProjectsController
var userId = GetCurrentUserId();
var roles = GetCurrentUserRoles();
if (!await _projectService.CanUserAccessProjectAsync(id, userId, roles))
    return Forbid(); // 403

// PanelsController
var userId = GetCurrentUserId();
var roles = GetCurrentUserRoles();
if (!await _panelService.CanUserAccessPanelAsync(id, userId, roles))
    return Forbid(); // 403
```

### Files Changed
| File | Change |
|---|---|
| `API/Controllers/ProjectsController.cs` | `GetSummary` now calls `CanUserAccessProjectAsync` → `403` if denied |
| `API/Controllers/PanelsController.cs` | `GetSummary` now calls `CanUserAccessPanelAsync` → `403` if denied |

---

## 6. Files Changed Summary

| File | Type | Reason |
|---|---|---|
| `Application/DTOs/RoleDto.cs` | ✨ New class | `UpdateSystemRoleDto` for system role editor |
| `Application/Interfaces/IRoleService.cs` | ✏️ Updated | Added `UpdateSystemRoleAsync` signature |
| `Application/Services/RoleService.cs` | ✏️ Updated | `UpdateSystemRoleAsync` implementation; removed system role block from `AssignPermissionsAsync` |
| `API/Controllers/RolesController.cs` | ✏️ Updated | Added `PUT /api/roles/{id}/system` endpoint |
| `API/Controllers/MaterialsController.cs` | 🔒 Security fix | Added auth at class + write endpoints |
| `API/Controllers/PanelItemsController.cs` | 🔒 Security fix | Added auth at class level |
| `API/Controllers/ImportController.cs` | 🔒 Security fix | Added auth at class + import endpoints |
| `API/Controllers/ProjectsController.cs` | 🐛 Logic fix | Role-filtered customer/status endpoints + summary access check |
| `API/Controllers/PanelsController.cs` | 🐛 Logic fix | Summary access check |

---

## 7. Full Auth Matrix After All Fixes

### Materials

| Action | No Token | TenderingEngineer | TenderingManager | SuperAdmin |
|---|---|---|---|---|
| View / Search / Browse | `401` | ✅ | ✅ | ✅ |
| Create material | `401` | `403` | ✅ | ✅ |
| Edit material | `401` | `403` | ✅ | ✅ |
| Delete material | `401` | `403` | ✅ | ✅ |

### Panel Items

| Action | No Token | TenderingEngineer | TenderingManager | SuperAdmin |
|---|---|---|---|---|
| All CRUD | `401` | ✅ | ✅ | ✅ |

### Import

| Action | No Token | Any Auth | TenderingManager | SuperAdmin |
|---|---|---|---|---|
| Download templates | `401` | ✅ | ✅ | ✅ |
| Bulk import materials | `401` | `403` | ✅ | ✅ |
| Import project | `401` | `403` | ✅ | ✅ |

### Projects — Filter Endpoints

| Caller | `GET /projects/customer/{x}` | `GET /projects/status/{x}` | `GET /projects/{id}/summary` |
|---|---|---|---|
| `SuperAdmin` | All matching | All matching | ✅ any project |
| `TenderingManager` | All matching | All matching | ✅ any project |
| `TenderingEngineer` | Own + collab only | Own + collab only | ✅ own/collab only — `403` otherwise |

### System Role Editing

| Action | `SuperAdmin` | `TenderingManager` | `TenderingEngineer` |
|---|---|---|---|
| Edit system role description + permissions | ✅ | `403` | `403` |
| Assign permissions to any role | ✅ | `403` | `403` |
| Edit custom role name + description | ✅ | `403` | `403` |
