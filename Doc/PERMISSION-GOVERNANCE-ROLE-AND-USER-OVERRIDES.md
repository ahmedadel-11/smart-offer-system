# Permission Governance: Role Permissions + User Overrides

## Objective
Make authorization professional and flexible so features can be opened/closed for:
- specific **roles**
- specific **users**

---

## Authorization Model

### 1) Role-based permissions (existing)
Permissions are assigned to roles via `RolePermissions`.

### 2) User-specific overrides (new)
Added table `UserPermissions` with fields:
- `UserId`
- `PermissionId`
- `IsGranted` (`true`=allow, `false`=deny)
- `AssignedAt`
- `AssignedBy`

This allows overriding role defaults per user.

---

## Effective Permission Resolution
Effective permissions are calculated as:

1. Start with permissions inherited from user roles.
2. Apply user overrides:
   - `IsGranted=false` => remove permission (deny)
   - `IsGranted=true` => add permission (allow)

This is now used by permission checks, so changes are enforced in real time.

---

## New User Permission Override Endpoints
Controller: `UsersController`

- `GET /api/users/{id}/permission-overrides`
  - Permission: `Users.View`

- `PUT /api/users/{id}/permission-overrides`
  - Permission: `Users.ManagePermissionOverrides`
  - Body:
    ```json
    {
      "permissionId": "GUID",
      "isGranted": true
    }
    ```

- `DELETE /api/users/{id}/permission-overrides/{permissionId}`
  - Permission: `Users.ManagePermissionOverrides`

Notes:
- Permission changes revoke user refresh tokens so updated access is enforced on next login.
- Changes are audit-logged.

---

## New Permissions Added
- `Users.ManagePermissionOverrides`
- `CurrencyRates.View`
- `CurrencyRates.Manage`

`CurrencyRatesController` now uses:
- `CurrencyRates.View` for GET endpoints
- `CurrencyRates.Manage` for PUT endpoint

---

## Database Changes
Added entity/table:
- `UserPermissions`

Run migrations update:
```bash
dotnet ef database update --project src/SmartOffer.Infrastructure --startup-project src/SmartOffer.API
```

---

## Operational Guidance
- Use role permissions for baseline access.
- Use user overrides only for exceptions.
- Prefer deny overrides (`IsGranted=false`) for temporary restrictions.
- Keep overrides auditable and reviewed regularly.
