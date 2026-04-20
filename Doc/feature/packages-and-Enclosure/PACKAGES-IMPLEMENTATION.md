# Packages Feature - Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the Packages feature in the SmartOffer application.

---

## Phase 1: Database Setup

### 1.1 Create Database Migration

The application uses Entity Framework Core migrations. A migration has been created that adds the Package and PackageItem tables.

**Files Created:**
- `src/SmartOffer.Infrastructure/Data/Migrations/[timestamp]_AddPackagesFeature.cs`

**To Apply Migration:**
```powershell
# In Package Manager Console
Update-Database

# Or using .NET CLI
dotnet ef database update
```

### 1.2 Database Schema

**Package Table:**
```sql
CREATE TABLE [Packages] (
    [PackageId] INT NOT NULL IDENTITY(1,1),
    [PackageName] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedByUserId] UNIQUEIDENTIFIER NULL,
    [UpdatedByUserId] UNIQUEIDENTIFIER NULL,
    PRIMARY KEY ([PackageId]),
    FOREIGN KEY ([CreatedByUserId]) REFERENCES [Users]([Id]),
    FOREIGN KEY ([UpdatedByUserId]) REFERENCES [Users]([Id])
);

CREATE UNIQUE INDEX [IX_Packages_PackageName] ON [Packages]([PackageName]);
```

**PackageItem Table:**
```sql
CREATE TABLE [PackageItems] (
    [PackageItemId] INT NOT NULL IDENTITY(1,1),
    [PackageId] INT NOT NULL,
    [MaterialId] INT NOT NULL,
    [Quantity] INT NOT NULL,
    PRIMARY KEY ([PackageItemId]),
    FOREIGN KEY ([PackageId]) REFERENCES [Packages]([PackageId]) ON DELETE CASCADE,
    FOREIGN KEY ([MaterialId]) REFERENCES [Materials]([MaterialId]) ON DELETE RESTRICT
);
```

---

## Phase 2: Domain Layer Implementation

### 2.1 Entities Created

Located in: `src/SmartOffer.Domain/Entities/`

**Files:**
- ✅ `Package.cs` - Main package entity
- ✅ `PackageItem.cs` - Package item entity

### 2.2 Interfaces Created

Located in: `src/SmartOffer.Domain/Interfaces/`

**Files:**
- ✅ `IPackageRepository.cs` - Repository contract for Package
- ✅ `IPackageItemRepository.cs` - Repository contract for PackageItem

**Update to:**
- ✅ `IUnitOfWork.cs` - Added PackageRepository and PackageItemRepository properties

---

## Phase 3: Application Layer Implementation

### 3.1 DTOs Created

Located in: `src/SmartOffer.Application/DTOs/`

**Files:**
- ✅ `PackageDto.cs` - Data transfer objects for packages
- ✅ `PackageItemDto.cs` - Data transfer objects for package items

**Includes:**
- `PackageDto` - Response DTO
- `PackageItemDto` - Response DTO
- `CreatePackageRequest` - Request model
- `CreatePackageItemRequest` - Request model for items
- `UpdatePackageRequest` - Request model for updates

### 3.2 Service Implementation

Located in: `src/SmartOffer.Application/Services/`

**Files:**
- ✅ `PackageService.cs` - Business logic implementation

**Interface:**
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

## Phase 4: Infrastructure Layer Implementation

### 4.1 Repositories Created

Located in: `src/SmartOffer.Infrastructure/Repositories/`

**Files:**
- ✅ `PackageRepository.cs` - Package data access
- ✅ `PackageItemRepository.cs` - PackageItem data access

**Update to:**
- ✅ `UnitOfWork.cs` - Added lazy-loaded properties for the repositories

### 4.2 DbContext Updates

**File:** `src/SmartOffer.Infrastructure/Data/SmartOfferDbContext.cs`

**Changes:**
- ✅ Added `DbSet<Package> Packages` property
- ✅ Added `DbSet<PackageItem> PackageItems` property
- ✅ Added entity configuration for Package in `OnModelCreating`
- ✅ Added entity configuration for PackageItem in `OnModelCreating`

---

## Phase 5: API Layer Implementation (Next Step)

### 5.1 Create API Controller

Create: `src/SmartOffer.API/Controllers/PackagesController.cs`

**Template:**
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOffer.Application.DTOs;
using SmartOffer.Application.Services;
using System.Security.Claims;

namespace SmartOffer.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PackagesController : ControllerBase
{
    private readonly IPackageService _packageService;
    private readonly IPermissionService _permissionService;

    public PackagesController(IPackageService packageService, IPermissionService permissionService)
    {
        _packageService = packageService;
        _permissionService = permissionService;
    }

    [HttpGet("{packageId}")]
    public async Task<IActionResult> GetPackage(int packageId)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.HasPermissionAsync(userId, "packages:view"))
            return Forbid();

        var package = await _packageService.GetPackageByIdAsync(packageId);
        if (package == null)
            return NotFound();

        return Ok(package);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPackages()
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.HasPermissionAsync(userId, "packages:view"))
            return Forbid();

        var packages = await _packageService.GetAllActivePackagesAsync();
        return Ok(packages);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchPackages([FromQuery] string term)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.HasPermissionAsync(userId, "packages:view"))
            return Forbid();

        var packages = await _packageService.SearchPackagesAsync(term);
        return Ok(packages);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePackage([FromBody] CreatePackageRequest request)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.HasPermissionAsync(userId, "packages:create"))
            return Forbid();

        try
        {
            var package = await _packageService.CreatePackageAsync(request, userId);
            return CreatedAtAction(nameof(GetPackage), new { packageId = package.PackageId }, package);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{packageId}")]
    public async Task<IActionResult> UpdatePackage(int packageId, [FromBody] UpdatePackageRequest request)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.HasPermissionAsync(userId, "packages:edit"))
            return Forbid();

        try
        {
            var package = await _packageService.UpdatePackageAsync(packageId, request, userId);
            return Ok(package);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{packageId}/deactivate")]
    public async Task<IActionResult> DeactivatePackage(int packageId)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.HasPermissionAsync(userId, "packages:deactivate"))
            return Forbid();

        var result = await _packageService.DeactivatePackageAsync(packageId, userId);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{packageId}")]
    public async Task<IActionResult> DeletePackage(int packageId)
    {
        var userId = GetCurrentUserId();
        if (!await _permissionService.HasPermissionAsync(userId, "packages:delete"))
            return Forbid();

        var result = await _packageService.DeletePackageAsync(packageId);
        if (!result)
            return NotFound();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
    }
}
```

### 5.2 Register Service in Dependency Injection

Update: `src/SmartOffer.API/Program.cs` or `src/SmartOffer.Infrastructure/DependencyInjection.cs`

```csharp
// Add Package service registration
services.AddScoped<IPackageService, PackageService>();
```

---

## Phase 6: Permission Setup

### 6.1 Create Migration for Permissions

Create a new migration to seed package permissions:

```bash
dotnet ef migrations add AddPackagePermissions
```

### 6.2 Seed Permissions in Migration

Add to the migration's `Up()` method:

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.InsertData(
        table: "Permissions",
        columns: new[] { "Id", "Name", "Description", "Category", "CreatedAt", "CreatedBy" },
        values: new object[,]
        {
            { Guid.NewGuid(), "packages:view", "View packages and their details", "Package", DateTime.UtcNow, null },
            { Guid.NewGuid(), "packages:create", "Create new packages", "Package", DateTime.UtcNow, null },
            { Guid.NewGuid(), "packages:edit", "Edit/update existing packages", "Package", DateTime.UtcNow, null },
            { Guid.NewGuid(), "packages:delete", "Delete packages permanently", "Package", DateTime.UtcNow, null },
            { Guid.NewGuid(), "packages:deactivate", "Deactivate packages (soft delete)", "Package", DateTime.UtcNow, null },
            { Guid.NewGuid(), "packages:use", "Use packages when creating panel items", "Package", DateTime.UtcNow, null }
        });
}
```

### 6.3 Assign Permissions to Roles

See `docs/PACKAGES-PERMISSIONS.md` for detailed permission setup and seeding.

---

## Phase 7: Integration with Existing Features

### 7.1 Update Panel Item Type Enum

Consider adding a `PackageItem` type to `PanelItemType` enum if you want to track which items came from packages:

```csharp
public enum PanelItemType
{
    Outgoing = 0,
    Incoming = 1,
    CombinedBusbarCables = 2,
    PackageItem = 3  // NEW
}
```

### 7.2 Update PanelItem Entity

Add optional reference to track package usage:

```csharp
public class PanelItem
{
    // ... existing properties ...
    public int? SourcePackageId { get; set; }  // Track source package
    public Package? SourcePackage { get; set; }
}
```

### 7.3 Update Panel Service

Add method to add packages to panels:

```csharp
public async Task<IEnumerable<PanelItem>> AddPackageToPanelAsync(
    int panelId, int packageId, int quantity, Guid userId)
{
    var panel = await _panelRepository.GetByIdAsync(panelId);
    var package = await _packageService.GetPackageByIdAsync(packageId);
    
    if (panel == null || package == null)
        throw new InvalidOperationException("Panel or Package not found");
    
    var addedItems = new List<PanelItem>();
    
    foreach (var packageItem in package.Items)
    {
        var panelItem = new PanelItem
        {
            MaterialId = packageItem.MaterialId,
            Quantity = packageItem.Quantity * quantity,
            ItemType = PanelItemType.PackageItem,
            SourcePackageId = packageId,
            PanelId = panelId
        };
        
        panel.Items.Add(panelItem);
        addedItems.Add(panelItem);
    }
    
    await _panelRepository.UpdateAsync(panel);
    await _unitOfWork.SaveChangesAsync();
    
    return addedItems;
}
```

---

## Phase 8: Testing

### 8.1 Unit Tests

Create: `tests/SmartOffer.Tests/Services/PackageServiceTests.cs`

```csharp
[TestClass]
public class PackageServiceTests
{
    private PackageService _service;
    private Mock<IUnitOfWork> _mockUnitOfWork;

    [TestInitialize]
    public void Setup()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _service = new PackageService(_mockUnitOfWork.Object);
    }

    [TestMethod]
    public async Task CreatePackage_WithValidData_CreatesSuccessfully()
    {
        // Arrange
        var request = new CreatePackageRequest
        {
            PackageName = "Test Package",
            Description = "Test Description",
            Items = new List<CreatePackageItemRequest>
            {
                new() { MaterialId = 1, Quantity = 2 }
            }
        };
        var userId = Guid.NewGuid();

        _mockUnitOfWork.Setup(x => x.PackageRepository.GetByNameAsync(It.IsAny<string>()))
            .ReturnsAsync((Package)null);
        _mockUnitOfWork.Setup(x => x.Materials.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new Material { MaterialId = 1 });

        // Act
        var result = await _service.CreatePackageAsync(request, userId);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("Test Package", result.PackageName);
    }
}
```

### 8.2 Integration Tests

Create: `tests/SmartOffer.Tests/Integration/PackageApiTests.cs`

```csharp
[TestClass]
public class PackageApiTests
{
    private HttpClient _client;
    private WebApplicationFactory<Program> _factory;

    [TestInitialize]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    [TestMethod]
    public async Task GetPackages_ReturnsOk()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/packages");

        // Assert
        Assert.AreEqual(System.Net.HttpStatusCode.OK, response.StatusCode);
    }
}
```

---

## Phase 9: Documentation and Deployment

### 9.1 Documentation Files Created

- ✅ `docs/PACKAGES-FEATURE.md` - Feature overview and API documentation
- ✅ `docs/PACKAGES-PERMISSIONS.md` - Permissions and security guide
- ✅ `docs/PACKAGES-IMPLEMENTATION.md` - This file

### 9.2 API Documentation

Update your Swagger/OpenAPI configuration to include the new endpoints:

```csharp
// In Startup or Program.cs
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartOffer API",
        Version = "v1",
        Description = "API with Packages feature support"
    });
});
```

### 9.3 Deployment Checklist

- [ ] Database migrations applied
- [ ] Permissions seeded in database
- [ ] API controller created and registered
- [ ] Services registered in DI container
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] API documentation updated
- [ ] User documentation ready
- [ ] Permission assignments verified
- [ ] Deployment to staging
- [ ] Smoke tests on staging
- [ ] Deployment to production

---

## Troubleshooting

### Issue: Compilation Errors

**Solution:**
```bash
# Clean and rebuild
dotnet clean
dotnet build

# Restore packages
dotnet restore
```

### Issue: Database Migration Fails

**Solution:**
```bash
# Check migration status
dotnet ef migrations list

# Rollback if needed
dotnet ef database update <previous-migration-name>

# Reapply
dotnet ef database update
```

### Issue: Permission Denied on API Calls

**Solution:**
1. Verify permission seeding in database
2. Check user role assignments
3. Review authorization filter in controller
4. Check token contains correct claims

### Issue: Package Items Not Cascading Delete

**Solution:**
Ensure DbContext configuration is correct:
```csharp
entity.HasMany(e => e.Items)
    .WithOne(i => i.Package)
    .HasForeignKey(i => i.PackageId)
    .OnDelete(DeleteBehavior.Cascade);
```

---

## Next Steps

1. **Create API Controller** (Phase 5)
2. **Set Up Permissions** (Phase 6)
3. **Integrate with Panels** (Phase 7)
4. **Write Tests** (Phase 8)
5. **Deploy to Production** (Phase 9)

For detailed information on permissions and security, see `docs/PACKAGES-PERMISSIONS.md`.
