# Packages Feature - Permissions & Security Guide

## Permission Model

The Packages feature uses a granular permission model to control access to package operations. Permissions can be assigned at two levels:

1. **Role-Based Permissions** (RolePermission)
2. **User-Level Permissions** (UserPermission) - for exceptions and overrides

---

## Permission Definitions

### Package Permissions

The following permissions should be created in the system:

#### 1. **ViewPackages**
- **Category**: `Package`
- **Name**: `packages:view`
- **Description**: View packages and their details
- **Assigned To**: All roles (Admin, Manager, User)

#### 2. **CreatePackages**
- **Category**: `Package`
- **Name**: `packages:create`
- **Description**: Create new packages
- **Assigned To**: Admin, Manager

#### 3. **EditPackages**
- **Category**: `Package`
- **Name**: `packages:edit`
- **Description**: Edit/update existing packages
- **Assigned To**: Admin, Manager, Package Owner

#### 4. **DeletePackages**
- **Category**: `Package`
- **Name**: `packages:delete`
- **Description**: Delete packages permanently
- **Assigned To**: Admin only

#### 5. **DeactivatePackages**
- **Category**: `Package`
- **Name**: `packages:deactivate`
- **Description**: Deactivate packages (soft delete)
- **Assigned To**: Admin, Manager

#### 6. **UsePackagesInPanels**
- **Category**: `Package`
- **Name**: `packages:use`
- **Description**: Use packages when creating panel items
- **Assigned To**: All roles

---

## Database Seeding

The following SQL/migrations should be executed to create the permissions:

```sql
-- Insert Package Permissions
INSERT INTO Permissions (Id, Name, Description, Category, CreatedAt, CreatedBy)
VALUES
    (NEWID(), 'packages:view', 'View packages and their details', 'Package', GETUTCDATE(), NULL),
    (NEWID(), 'packages:create', 'Create new packages', 'Package', GETUTCDATE(), NULL),
    (NEWID(), 'packages:edit', 'Edit/update existing packages', 'Package', GETUTCDATE(), NULL),
    (NEWID(), 'packages:delete', 'Delete packages permanently', 'Package', GETUTCDATE(), NULL),
    (NEWID(), 'packages:deactivate', 'Deactivate packages (soft delete)', 'Package', GETUTCDATE(), NULL),
    (NEWID(), 'packages:use', 'Use packages when creating panel items', 'Package', GETUTCDATE(), NULL);

-- Assign to Admin Role (assuming Admin role exists)
DECLARE @AdminRoleId UNIQUEIDENTIFIER;
SELECT @AdminRoleId = Id FROM Roles WHERE Name = 'Admin';

INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT @AdminRoleId, Id FROM Permissions WHERE Category = 'Package';

-- Assign View and Use permissions to all roles
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.Id, p.Id 
FROM Roles r, Permissions p 
WHERE p.Name IN ('packages:view', 'packages:use')
AND r.Name IN ('Admin', 'Manager', 'User');

-- Assign Create, Edit, Deactivate to Admin and Manager
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.Id, p.Id 
FROM Roles r, Permissions p 
WHERE p.Name IN ('packages:create', 'packages:edit', 'packages:deactivate')
AND r.Name IN ('Admin', 'Manager');
```

---

## Authorization Checks

### API Endpoint Authorization

#### View Packages
```csharp
[HttpGet("{packageId}")]
[Authorize]
public async Task<IActionResult> GetPackage(int packageId)
{
    var user = GetCurrentUser();
    
    // Check permission: packages:view
    if (!await _permissionService.HasPermissionAsync(user.Id, "packages:view"))
        return Forbid();
    
    var package = await _packageService.GetPackageByIdAsync(packageId);
    return Ok(package);
}
```

#### Create Package
```csharp
[HttpPost]
[Authorize]
public async Task<IActionResult> CreatePackage(CreatePackageRequest request)
{
    var user = GetCurrentUser();
    
    // Check permission: packages:create
    if (!await _permissionService.HasPermissionAsync(user.Id, "packages:create"))
        return Forbid();
    
    var package = await _packageService.CreatePackageAsync(request, user.Id);
    return CreatedAtAction(nameof(GetPackage), new { packageId = package.PackageId }, package);
}
```

#### Edit Package
```csharp
[HttpPut("{packageId}")]
[Authorize]
public async Task<IActionResult> UpdatePackage(int packageId, UpdatePackageRequest request)
{
    var user = GetCurrentUser();
    
    // Check permission: packages:edit
    if (!await _permissionService.HasPermissionAsync(user.Id, "packages:edit"))
        return Forbid();
    
    var package = await _packageService.UpdatePackageAsync(packageId, request, user.Id);
    return Ok(package);
}
```

#### Delete Package
```csharp
[HttpDelete("{packageId}")]
[Authorize]
public async Task<IActionResult> DeletePackage(int packageId)
{
    var user = GetCurrentUser();
    
    // Check permission: packages:delete (Admin only)
    if (!await _permissionService.HasPermissionAsync(user.Id, "packages:delete"))
        return Forbid();
    
    await _packageService.DeletePackageAsync(packageId);
    return NoContent();
}
```

#### Deactivate Package
```csharp
[HttpDelete("{packageId}/deactivate")]
[Authorize]
public async Task<IActionResult> DeactivatePackage(int packageId)
{
    var user = GetCurrentUser();
    
    // Check permission: packages:deactivate
    if (!await _permissionService.HasPermissionAsync(user.Id, "packages:deactivate"))
        return Forbid();
    
    await _packageService.DeactivatePackageAsync(packageId, user.Id);
    return NoContent();
}
```

---

## Role-Based Access Control (RBAC)

### Permission Matrix

| Action | Admin | Manager | User |
|--------|-------|---------|------|
| View Packages | ✅ | ✅ | ✅ |
| Create Packages | ✅ | ✅ | ❌ |
| Edit Packages | ✅ | ✅ (own) | ❌ |
| Deactivate Packages | ✅ | ✅ | ❌ |
| Delete Packages | ✅ | ❌ | ❌ |
| Use in Panels | ✅ | ✅ | ✅ |

### Role Descriptions

- **Admin**: Full access to all package operations
- **Manager**: Can create, edit, and deactivate packages; cannot delete
- **User**: Read-only access; can use packages in panels

---

## User-Level Permission Overrides

Individual users can be granted or denied specific permissions regardless of their role:

```csharp
// Grant a user permission to delete packages (override)
await _permissionService.GrantUserPermissionAsync(userId, "packages:delete");

// Deny a user permission to create packages (override)
await _permissionService.DenyUserPermissionAsync(userId, "packages:create");

// Check effective permission (role + user overrides)
bool hasPermission = await _permissionService.HasPermissionAsync(userId, "packages:create");
```

---

## Audit Trail for Permissions

All permission-related operations are logged:

```csharp
public class PermissionAuditLog
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }              // User being granted/denied permission
    public string PermissionName { get; set; }     // packages:create, etc.
    public string Action { get; set; }              // Grant, Deny, Revoke
    public Guid? GrantedByUserId { get; set; }     // Admin who made the change
    public DateTime Timestamp { get; set; }        // When the change occurred
    public string? Reason { get; set; }             // Reason for the override
}
```

---

## Implementation in DatabaseSeeder

Add this to `DatabaseSeeder.cs` to automatically seed permissions on first run:

```csharp
private async Task SeedPackagePermissionsAsync()
{
    var existingPermissions = await _context.Permissions
        .Where(p => p.Category == "Package")
        .ToListAsync();

    if (existingPermissions.Count > 0)
        return; // Already seeded

    var permissions = new[]
    {
        new Permission { 
            Id = Guid.NewGuid(),
            Name = "packages:view",
            Description = "View packages and their details",
            Category = "Package",
            CreatedAt = DateTime.UtcNow
        },
        new Permission { 
            Id = Guid.NewGuid(),
            Name = "packages:create",
            Description = "Create new packages",
            Category = "Package",
            CreatedAt = DateTime.UtcNow
        },
        new Permission { 
            Id = Guid.NewGuid(),
            Name = "packages:edit",
            Description = "Edit/update existing packages",
            Category = "Package",
            CreatedAt = DateTime.UtcNow
        },
        new Permission { 
            Id = Guid.NewGuid(),
            Name = "packages:delete",
            Description = "Delete packages permanently",
            Category = "Package",
            CreatedAt = DateTime.UtcNow
        },
        new Permission { 
            Id = Guid.NewGuid(),
            Name = "packages:deactivate",
            Description = "Deactivate packages (soft delete)",
            Category = "Package",
            CreatedAt = DateTime.UtcNow
        },
        new Permission { 
            Id = Guid.NewGuid(),
            Name = "packages:use",
            Description = "Use packages when creating panel items",
            Category = "Package",
            CreatedAt = DateTime.UtcNow
        }
    };

    await _context.Permissions.AddRangeAsync(permissions);
    await _context.SaveChangesAsync();

    // Assign to roles
    await AssignPermissionsToRolesAsync(permissions);
}

private async Task AssignPermissionsToRolesAsync(Permission[] permissions)
{
    var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
    var managerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Manager");
    var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");

    if (adminRole != null)
    {
        foreach (var permission in permissions)
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = adminRole.Id,
                PermissionId = permission.Id
            });
        }
    }

    if (managerRole != null)
    {
        foreach (var permission in permissions.Where(p => p.Name != "packages:delete"))
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = managerRole.Id,
                PermissionId = permission.Id
            });
        }
    }

    if (userRole != null)
    {
        foreach (var permission in permissions.Where(p => p.Name is "packages:view" or "packages:use"))
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = userRole.Id,
                PermissionId = permission.Id
            });
        }
    }

    await _context.SaveChangesAsync();
}
```

---

## Security Best Practices

1. **Always Check Permissions**: Never skip permission checks even for seemingly safe operations
2. **Log All Changes**: Use AuditLog to track who made what changes and when
3. **Validate Input**: Validate all package data before processing
4. **Rate Limiting**: Consider rate limiting on package creation/deletion endpoints
5. **Principle of Least Privilege**: Assign minimum required permissions to users
6. **Regular Audits**: Review audit logs regularly for unusual activity
7. **User Feedback**: Provide clear error messages when permissions are denied

---

## Testing Permissions

### Unit Test Example

```csharp
[TestClass]
public class PackagePermissionTests
{
    [TestMethod]
    public async Task CreatePackage_WithoutPermission_ReturnsForbidden()
    {
        // Arrange
        var userWithoutPermission = CreateTestUser("User");
        var request = new CreatePackageRequest { /* ... */ };

        // Act
        var result = await _packageController.CreatePackage(request);

        // Assert
        Assert.AreEqual(403, result.StatusCode); // Forbidden
    }

    [TestMethod]
    public async Task CreatePackage_WithPermission_CreatesPackage()
    {
        // Arrange
        var managerUser = CreateTestUser("Manager");
        await _permissionService.GrantUserPermissionAsync(managerUser.Id, "packages:create");
        var request = new CreatePackageRequest { /* ... */ };

        // Act
        var result = await _packageController.CreatePackage(request);

        // Assert
        Assert.AreEqual(201, result.StatusCode); // Created
    }
}
```

---

## Migration and Deployment

1. **Create Database Migration**: Run migration to add Package and PackageItem tables
2. **Seed Permissions**: Execute permission seeding during application startup
3. **Update Documentation**: Ensure API documentation reflects the new endpoints
4. **User Communication**: Notify users about the new feature and their assigned permissions
5. **Monitor Usage**: Track permission denials to identify permission misconfigurations

---

## Troubleshooting

### Issue: Users Can't Create Packages
- **Solution**: Verify the user has the `packages:create` permission
- **Check**: `SELECT * FROM RolePermissions WHERE PermissionId = (SELECT Id FROM Permissions WHERE Name = 'packages:create')`

### Issue: Permission Denied Errors
- **Solution**: Review user's roles and check for permission overrides
- **Check**: `SELECT * FROM UserPermissions WHERE UserId = @userId`

### Issue: Audit Logs Not Recording
- **Solution**: Ensure `AuditService` is injected and called in all endpoints
- **Check**: Verify AuditLog table has records for package operations

