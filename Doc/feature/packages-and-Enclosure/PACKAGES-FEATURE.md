# Packages Feature Documentation

## Overview

The Packages feature allows users to create reusable groups of materials with predefined quantities. This is useful for managing standard configurations, bulk items, or recurring material combinations.

**Key Concept**: A package is a template that bundles multiple materials (items) together with specific quantities. When you use a package in a panel or project, the quantities multiply with the quantities you specify for the package.

## Example

**Package Definition: "Panel Enclosure 1"**

| Item | Material | Quantity |
|------|----------|----------|
| 1    | DIN Rail 35mm | 2 |
| 2    | Busbar Connector | 1 |
| 3    | Cable Gland M20 | 3 |
| 4    | Mounting Plate | 1 |

**Usage Example**: If you add 3 quantities of "Panel Enclosure 1" package to a panel:

| Item | Material | Calculation | Final Quantity |
|------|----------|-------------|-----------------|
| 1    | DIN Rail 35mm | 2 × 3 | 6 |
| 2    | Busbar Connector | 1 × 3 | 3 |
| 3    | Cable Gland M20 | 3 × 3 | 9 |
| 4    | Mounting Plate | 1 × 3 | 3 |

---

## Data Model

### Package Entity

Represents a reusable group of materials with quantities.

**Properties:**
- `PackageId` (int): Unique identifier
- `PackageName` (string, required, max 200): Name of the package
- `Description` (string, optional, max 500): Description of the package
- `IsActive` (bool): Indicates if the package is available for use
- `CreatedAt` (DateTime): Creation timestamp
- `UpdatedAt` (DateTime, nullable): Last update timestamp
- `CreatedByUserId` (Guid, nullable): User who created the package
- `UpdatedByUserId` (Guid, nullable): User who last updated the package
- `Items` (ICollection<PackageItem>): The materials within this package

### PackageItem Entity

Represents a material within a package along with its quantity.

**Properties:**
- `PackageItemId` (int): Unique identifier
- `PackageId` (int, FK): Reference to the parent package
- `MaterialId` (int, FK): Reference to a material
- `Quantity` (int): Quantity of the material in this package
- `Package` (Navigation): Reference to the parent package
- `Material` (Navigation): Reference to the material entity

---

## API Endpoints

### Create a Package

**Endpoint:** `POST /api/packages`

**Request:**
```json
{
  "packageName": "Panel Enclosure 1",
  "description": "Standard panel enclosure with DIN rail and connectors",
  "items": [
    {
      "materialId": 5,
      "quantity": 2
    },
    {
      "materialId": 12,
      "quantity": 1
    },
    {
      "materialId": 18,
      "quantity": 3
    },
    {
      "materialId": 25,
      "quantity": 1
    }
  ]
}
```

**Response:** (201 Created)
```json
{
  "packageId": 1,
  "packageName": "Panel Enclosure 1",
  "description": "Standard panel enclosure with DIN rail and connectors",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": null,
  "createdByUserId": "user-guid",
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
    // ... more items
  ]
}
```

### Get Package by ID

**Endpoint:** `GET /api/packages/{packageId}`

**Response:** (200 OK)
```json
{
  "packageId": 1,
  "packageName": "Panel Enclosure 1",
  "description": "Standard panel enclosure with DIN rail and connectors",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": null,
  "createdByUserId": "user-guid",
  "updatedByUserId": null,
  "items": [ /* ... */ ]
}
```

### Get All Active Packages

**Endpoint:** `GET /api/packages`

**Query Parameters:**
- None (returns all active packages by default)

**Response:** (200 OK)
```json
[
  {
    "packageId": 1,
    "packageName": "Panel Enclosure 1",
    // ...
  },
  {
    "packageId": 2,
    "packageName": "Cable Assembly Kit",
    // ...
  }
]
```

### Search Packages

**Endpoint:** `GET /api/packages/search?term=enclosure`

**Query Parameters:**
- `term` (string): Search term to match against package names and descriptions

**Response:** (200 OK) - Array of matching packages

### Update Package

**Endpoint:** `PUT /api/packages/{packageId}`

**Request:**
```json
{
  "packageName": "Panel Enclosure 1 - Updated",
  "description": "Updated description",
  "items": [
    {
      "materialId": 5,
      "quantity": 2
    },
    {
      "materialId": 12,
      "quantity": 2
    }
  ]
}
```

**Response:** (200 OK) - Updated package object

### Deactivate Package

**Endpoint:** `DELETE /api/packages/{packageId}/deactivate`

**Response:** (204 No Content)

**Note:** Deactivation marks the package as inactive without deleting it from the database.

### Delete Package

**Endpoint:** `DELETE /api/packages/{packageId}`

**Response:** (204 No Content)

**Note:** This permanently deletes the package. Use with caution.

---

## Service Interface

### IPackageService

```csharp
public interface IPackageService
{
    Task<PackageDto?> GetPackageByIdAsync(int packageId);
    Task<IEnumerable<PackageDto>> GetAllActivePackagesAsync();
    Task<IEnumerable<PackageDto>> SearchPackagesAsync(string searchTerm);
    Task<PackageDto> CreatePackageAsync(CreatePackageRequest request, Guid userId);
    Task<PackageDto> UpdatePackageAsync(int packageId, UpdatePackageRequest request, Guid userId);
    Task<bool> DeactivatePackageAsync(int packageId, Guid userId);
    Task<bool> DeletePackageAsync(int packageId);
}
```

---

## Repository Interfaces

### IPackageRepository

```csharp
public interface IPackageRepository : IRepository<Package>
{
    Task<Package?> GetByNameAsync(string packageName);
    Task<IEnumerable<Package>> GetActivePackagesAsync();
    Task<Package?> GetWithItemsAsync(int packageId);
    Task<IEnumerable<Package>> SearchAsync(string searchTerm);
}
```

### IPackageItemRepository

```csharp
public interface IPackageItemRepository : IRepository<PackageItem>
{
    Task<IEnumerable<PackageItem>> GetByPackageIdAsync(int packageId);
    Task<PackageItem?> GetByPackageAndMaterialAsync(int packageId, int materialId);
}
```

---

## Business Rules

1. **Unique Package Names**: Package names must be unique within the system.
2. **Material Validation**: All materials referenced in a package must exist in the system.
3. **Quantity Validation**: Package item quantities must be positive integers.
4. **Active Only**: Only active packages are returned in list/search operations.
5. **Audit Trail**: All package operations log the user and timestamp.
6. **Cascade Delete**: When a package is deleted, all its items are automatically deleted.

---

## Integration with Panels

When adding packages to a panel, the system multiplies the package quantity with each item's quantity:

```
Final Item Quantity = Package Item Quantity × Package Quantity Used
```

Example Implementation (pseudocode):
```csharp
// When adding a package to a panel
var package = await packageService.GetPackageByIdAsync(packageId);
int packageQuantity = 3; // User specifies 3x

foreach (var packageItem in package.Items)
{
    var panelItem = new PanelItem
    {
        MaterialId = packageItem.MaterialId,
        Quantity = packageItem.Quantity * packageQuantity,
        ItemType = PanelItemType.PackageItem,
        // ... other properties
    };
    panel.Items.Add(panelItem);
}
```

---

## Future Enhancements

- **Package Templates**: Pre-built packages for common configurations
- **Package Discounts**: Apply bulk discounts when using packages
- **Package Variants**: Create variations of a package for different use cases
- **Package Dependencies**: Define which packages can be combined
- **Package History**: Track changes to package contents over time
- **Nested Packages**: Allow packages to contain other packages

---

## Error Handling

### Common Errors

| Code | Message | Resolution |
|------|---------|------------|
| 400 | Package name already exists | Choose a unique name |
| 404 | Package not found | Verify the package ID |
| 400 | Material not found | Ensure all materials exist in the system |
| 400 | Invalid quantity | Use positive integers only |
| 403 | Unauthorized to create package | Check user permissions |

---

## Audit and Compliance

All package operations are logged with:
- User ID who performed the action
- Timestamp of the action
- Package ID and name
- Old and new values (for updates)

This ensures full traceability and compliance with governance requirements.
