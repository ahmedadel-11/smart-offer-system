# SmartOffer Permissions Catalog

This file lists all permissions currently used in the system.

---

## User Management
- `Users.View` — View users
- `Users.Create` — Create users
- `Users.Edit` — Edit users
- `Users.Delete` — Delete users
- `Users.ResetPassword` — Reset user passwords
- `Users.ManagePermissionOverrides` — Allow/deny permissions for specific users

## Role Management
- `Roles.View` — View roles
- `Roles.Create` — Create roles
- `Roles.Edit` — Edit roles
- `Roles.Delete` — Delete roles
- `Roles.AssignPermissions` — Assign permissions to roles

## Permission Management
- `Permissions.View` — View permissions
- `Permissions.Create` — Create permissions
- `Permissions.Edit` — Edit permissions
- `Permissions.Delete` — Delete permissions

## Projects
- `Projects.View` — View projects
- `Projects.ViewAll` — View all projects
- `Projects.Create` — Create projects
- `Projects.Edit` — Edit projects
- `Projects.Delete` — Delete projects
- `Projects.Approve` — Approve projects
- `Projects.ChangeStatus` — Change project status
- `Projects.ManageCollaborators` — Add/remove project collaborators
- `Projects.Lock` — Lock and unlock projects

## Panels
- `Panels.View` — View panels
- `Panels.Create` — Create panels
- `Panels.Edit` — Edit panels
- `Panels.Delete` — Delete panels
- `Panels.ChangeStatus` — Change panel status
- `Panels.ManageCollaborators` — Add/remove panel collaborators
- `Panels.Duplicate` — Duplicate panels

## Pricing & Discounts
- `Pricing.View` — View pricing
- `Pricing.Modify` — Modify product prices
- `Discounts.Apply` — Apply additional discounts
- `Discounts.ApplyGlobal` — Apply global discounts

## Materials
- `Materials.View` — View materials
- `Materials.Create` — Create materials
- `Materials.Edit` — Edit materials
- `Materials.Delete` — Delete materials
- `Materials.Import` — Import materials

## Offers
- `Offers.View` — View offers
- `Offers.Generate` — Generate quotations
- `Offers.Export` — Export offers to PDF/Excel

## System
- `AuditLogs.View` — View audit logs
- `System.Configure` — System configuration access
- `CurrencyRates.View` — View currency rates
- `CurrencyRates.Manage` — Manage currency rates

---

## Notes
- These permissions are seeded from `DatabaseSeeder` and synced into the database at startup.
- `SuperAdmin` receives all seeded permissions automatically.
