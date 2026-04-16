# Frontend Guide: Role Permissions + User Permission Overrides

## Goal
Support feature toggling per role and per specific user.

---

## New Backend Contracts

### User override DTOs
```ts
interface SetUserPermissionOverrideDto {
  permissionId: string;
  isGranted: boolean;
}

interface UserPermissionOverrideDto {
  permissionId: string;
  permissionName: string;
  permissionCategory: string;
  isGranted: boolean;
  assignedAt: string;
  assignedBy?: string | null;
}
```

### Endpoints
- `GET /api/users/{id}/permission-overrides`
- `PUT /api/users/{id}/permission-overrides`
- `DELETE /api/users/{id}/permission-overrides/{permissionId}`

### Required permissions
- View overrides: `Users.View`
- Manage overrides: `Users.ManagePermissionOverrides`

---

## UI Recommendations

### 1) User Permission Overrides Section (in User Details)
- Show effective user permissions (already available from `UserDto.permissions`).
- Show overrides table with columns:
  - Permission
  - Category
  - State (`Allowed`/`Denied`)
  - Updated At
- Add action to set override:
  - pick permission
  - choose allow/deny

### 2) Actions
- **Allow override** => `PUT` with `isGranted=true`
- **Deny override** => `PUT` with `isGranted=false`
- **Reset to role default** => `DELETE` override row

### 3) Guarding UI
- Show edit controls only when current user has `Users.ManagePermissionOverrides`.

---

## Prompt for Frontend AI Agent

```text
Implement user permission override management in SmartOffer frontend.

Requirements:
1) Add TS models:
   - SetUserPermissionOverrideDto
   - UserPermissionOverrideDto
2) Add API methods:
   - GET /api/users/{id}/permission-overrides
   - PUT /api/users/{id}/permission-overrides
   - DELETE /api/users/{id}/permission-overrides/{permissionId}
3) Add a User Details section to list and manage overrides:
   - allow/deny specific permission
   - remove override (reset to role default)
4) Permission-gate management actions with Users.ManagePermissionOverrides.
5) Keep UI and types fully synchronized with current backend contracts.
```
