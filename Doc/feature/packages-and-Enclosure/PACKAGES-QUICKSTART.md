# Packages Feature - Quick Start Guide

## 5-Minute Overview

The **Packages Feature** lets you create reusable groups of materials with predefined quantities.

### Example

**Package: "Panel Enclosure 1"**
- 2x DIN Rail 35mm
- 1x Busbar Connector
- 3x Cable Gland M20
- 1x Mounting Plate

**When you add 3x of this package:**
- 6x DIN Rail (2 × 3)
- 3x Busbar Connector (1 × 3)
- 9x Cable Gland M20 (3 × 3)
- 3x Mounting Plate (1 × 3)

---

## Files Created

### Domain Layer
```
src/SmartOffer.Domain/
├── Entities/
│   ├── Package.cs                    ← Main entity
│   └── PackageItem.cs                ← Items within package
└── Interfaces/
    ├── IPackageRepository.cs         ← Data access contract
    └── IPackageItemRepository.cs     ← Items data access
```

### Application Layer
```
src/SmartOffer.Application/
├── DTOs/
│   ├── PackageDto.cs                 ← Data transfer objects
│   └── PackageItemDto.cs             ← Item DTOs
└── Services/
    └── PackageService.cs             ← Business logic
```

### Infrastructure Layer
```
src/SmartOffer.Infrastructure/
├── Repositories/
│   ├── PackageRepository.cs          ← Package data access
│   └── PackageItemRepository.cs      ← Item data access
└── Data/
    └── SmartOfferDbContext.cs        ← Updated with Package entities
```

---

## Key Features

### ✅ Create Packages
```csharp
POST /api/packages
{
  "packageName": "Panel Enclosure 1",
  "description": "Complete panel enclosure kit",
  "items": [
    { "materialId": 5, "quantity": 2 },
    { "materialId": 12, "quantity": 1 },
    { "materialId": 18, "quantity": 3 },
    { "materialId": 25, "quantity": 1 }
  ]
}
```

### ✅ View Packages
```csharp
GET /api/packages                   // Get all active packages
GET /api/packages/{packageId}       // Get specific package
GET /api/packages/search?term=enclosure  // Search packages
```

### ✅ Update Packages
```csharp
PUT /api/packages/{packageId}
{
  "packageName": "Updated Name",
  "items": [ /* ... */ ]
}
```

### ✅ Deactivate/Delete
```csharp
DELETE /api/packages/{packageId}/deactivate  // Soft delete
DELETE /api/packages/{packageId}             // Hard delete
```

---

## Database Changes

### New Tables
- **Packages**: Stores package definitions
- **PackageItems**: Stores items within packages

### Relationships
```
Packages (1) ─── (N) PackageItems
   ↓                      ↓
 Users              Materials
```

---

## Permission System

### Required Permissions

| Action | Permission | Who Can Do It |
|--------|-----------|---------------|
| View | `packages:view` | All users |
| Create | `packages:create` | Admin, Manager |
| Edit | `packages:edit` | Admin, Manager |
| Delete | `packages:delete` | Admin only |
| Deactivate | `packages:deactivate` | Admin, Manager |
| Use in Panels | `packages:use` | All users |

### Setup Permissions
See `docs/PACKAGES-PERMISSIONS.md` for detailed setup

---

## Service Methods

```csharp
public interface IPackageService
{
    // Retrieval
    Task<PackageDto?> GetPackageByIdAsync(int packageId);
    Task<IEnumerable<PackageDto>> GetAllActivePackagesAsync();
    Task<IEnumerable<PackageDto>> SearchPackagesAsync(string searchTerm);
    
    // CRUD
    Task<PackageDto> CreatePackageAsync(CreatePackageRequest request, Guid userId);
    Task<PackageDto> UpdatePackageAsync(int packageId, UpdatePackageRequest request, Guid userId);
    Task<bool> DeactivatePackageAsync(int packageId, Guid userId);
    Task<bool> DeletePackageAsync(int packageId);
}
```

---

## Repository Methods

```csharp
public interface IPackageRepository : IRepository<Package>
{
    Task<Package?> GetByNameAsync(string packageName);
    Task<IEnumerable<Package>> GetActivePackagesAsync();
    Task<Package?> GetWithItemsAsync(int packageId);
    Task<IEnumerable<Package>> SearchAsync(string searchTerm);
}

public interface IPackageItemRepository : IRepository<PackageItem>
{
    Task<IEnumerable<PackageItem>> GetByPackageIdAsync(int packageId);
    Task<PackageItem?> GetByPackageAndMaterialAsync(int packageId, int materialId);
}
```

---

## Getting Started

### Step 1: Apply Database Migration
```powershell
Update-Database
```

### Step 2: Seed Permissions
See `docs/PACKAGES-PERMISSIONS.md` for SQL or migration code

### Step 3: Create API Controller
Create `src/SmartOffer.API/Controllers/PackagesController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PackagesController : ControllerBase
{
    // Implementation in docs/PACKAGES-IMPLEMENTATION.md
}
```

### Step 4: Register Service
In `Program.cs`:
```csharp
services.AddScoped<IPackageService, PackageService>();
```

### Step 5: Test
```bash
POST /api/packages          // Create
GET /api/packages           // List
GET /api/packages/1         // Get
PUT /api/packages/1         // Update
DELETE /api/packages/1      // Delete
```

---

## Business Rules

1. **Unique Names**: Package names must be unique
2. **Material Validation**: All materials must exist
3. **Positive Quantities**: Quantities must be > 0
4. **Active Only**: Only active packages show in lists
5. **Cascade Delete**: Deleting a package deletes its items
6. **Audit Trail**: All operations logged with user/timestamp

---

## Response Example

```json
{
  "packageId": 1,
  "packageName": "Panel Enclosure 1",
  "description": "Complete panel enclosure kit",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": null,
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
  "updatedByUserId": null,
  "items": [
    {
      "packageItemId": 1,
      "packageId": 1,
      "materialId": 5,
      "quantity": 2,
      "materialCode": "DIN-RAIL-35MM",
      "materialDescription": "DIN Rail 35mm Standard",
      "materialBasePrice": 25.50
    },
    {
      "packageItemId": 2,
      "packageId": 1,
      "materialId": 12,
      "quantity": 1,
      "materialCode": "BUSBAR-CONN",
      "materialDescription": "Busbar Connector",
      "materialBasePrice": 15.00
    }
  ]
}
```

---

## Common Tasks

### Create a New Package
```csharp
var request = new CreatePackageRequest
{
    PackageName = "Cable Bundle",
    Description = "Pre-assembled cable bundle",
    Items = new List<CreatePackageItemRequest>
    {
        new() { MaterialId = 10, Quantity = 5 },
        new() { MaterialId = 20, Quantity = 2 }
    }
};

var package = await packageService.CreatePackageAsync(request, userId);
```

### Get All Active Packages
```csharp
var packages = await packageService.GetAllActivePackagesAsync();

foreach (var pkg in packages)
{
    Console.WriteLine($"{pkg.PackageName}: {pkg.Items.Count} items");
}
```

### Update a Package
```csharp
var updateRequest = new UpdatePackageRequest
{
    PackageName = "Cable Bundle v2",
    Items = new List<CreatePackageItemRequest>
    {
        new() { MaterialId = 10, Quantity = 5 },
        new() { MaterialId = 20, Quantity = 3 }
    }
};

var updated = await packageService.UpdatePackageAsync(packageId, updateRequest, userId);
```

### Search Packages
```csharp
var results = await packageService.SearchPackagesAsync("enclosure");
```

---

## Documentation

For more details:
- **Feature Overview**: See `docs/PACKAGES-FEATURE.md`
- **Permissions & Security**: See `docs/PACKAGES-PERMISSIONS.md`
- **Implementation Steps**: See `docs/PACKAGES-IMPLEMENTATION.md`

---

## FAQ

**Q: Can packages contain other packages?**
A: Not in the current version, but this is planned for future releases.

**Q: What happens to packages when a material is deleted?**
A: Package items will fail validation. You should update or deactivate the package.

**Q: Can I use packages in different projects?**
A: Yes, packages are global and can be used across all projects.

**Q: Are there any limits on package size?**
A: No hard limits, but performance may degrade with very large packages (100+ items).

**Q: How are package quantities calculated?**
A: `Final Quantity = Package Item Quantity × Number of Packages Used`

---

## Support

For issues or questions:
1. Check `docs/PACKAGES-IMPLEMENTATION.md` for troubleshooting
2. Review database schema and migrations
3. Check permission assignments
4. Review audit logs for errors
