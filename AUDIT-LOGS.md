# Audit Logs — SmartOffer Backend Reference

> **Audience:** Frontend developers and AI agents integrating with the SmartOffer API.  
> **Last Updated:** Based on `feature/project-panel-collaboration-audit` branch.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Entity](#database-entity)
3. [API Endpoints](#api-endpoints)
4. [Request & Response Shapes](#request--response-shapes)
5. [Filter Behavior & Known Limitations](#filter-behavior--known-limitations)
6. [Complete Action Reference](#complete-action-reference)
7. [OldValues / NewValues Format](#oldvalues--newvalues-format)
8. [Service Interface](#service-interface)
9. [Architecture & Data Flow](#architecture--data-flow)
10. [TypeScript Interfaces](#typescript-interfaces)
11. [Frontend Integration Guide](#frontend-integration-guide)
12. [Known Limitations & Future Improvements](#known-limitations--future-improvements)

---

## Overview

The **Audit Log** system records every significant state-changing operation performed in SmartOffer. It captures **who** did **what**, **to which entity**, **when**, and optionally **what changed** (old vs. new values) and **from where** (IP address).

- All audit records are **write-only** from the application side — they are never updated or deleted.
- Audit logs are stored in the `AuditLogs` SQL table.
- Reading audit logs is restricted to **SuperAdmin** role only.
- Audit logging is performed **after** the primary database write succeeds.

---

## Database Entity

**Table:** `AuditLogs`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `Id` | `UNIQUEIDENTIFIER` | No | Primary key — generated as `NEWID()` |
| `UserId` | `UNIQUEIDENTIFIER` | Yes | The user who performed the action (`NULL` for system/anonymous) |
| `Action` | `NVARCHAR` | No | The action performed — see [Action Reference](#complete-action-reference) |
| `EntityType` | `NVARCHAR` | No | The entity affected — e.g. `"Project"`, `"Panel"`, `"Role"` |
| `EntityId` | `NVARCHAR` | Yes | The string ID of the affected entity |
| `PropertyName` | `NVARCHAR` | Yes | The specific property changed (used for `StatusChange` actions) |
| `OldValues` | `NVARCHAR` | Yes | Previous state — free-form string or `NULL` for creates |
| `NewValues` | `NVARCHAR` | Yes | New state — free-form string or `NULL` for deletes |
| `IpAddress` | `NVARCHAR` | Yes | Caller's IP address (not always populated) |
| `Timestamp` | `DATETIME2` | No | UTC timestamp of when the action was logged |

**C# Entity:**
```csharp
public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; }
    public string EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? PropertyName { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }

    // Navigation
    public User? User { get; set; }
}
```

---

## API Endpoints

All endpoints require the caller to have the **SuperAdmin** role.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/auditlogs` | Retrieve audit logs with optional filters |
| `GET` | `/api/auditlogs/user/{userId}` | Retrieve all logs for a specific user |

### Authorization

```
Authorization: Bearer <jwt_token>
```

The JWT must belong to a user whose role is `SuperAdmin`. All other roles receive `403 Forbidden`.

---

## Request & Response Shapes

### GET `/api/auditlogs`

**Query Parameters (`AuditLogFilterDto`):**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `userId` | `Guid?` | — | Filter by the user who performed the action |
| `action` | `string?` | — | Filter by action name (case-insensitive, exact match) |
| `entityType` | `string?` | — | Filter by entity type (case-insensitive, exact match) |
| `startDate` | `DateTime?` | — | Filter by date range start (UTC) — **requires** `endDate` |
| `endDate` | `DateTime?` | — | Filter by date range end (UTC) — **requires** `startDate` |
| `pageNumber` | `int` | `1` | Page number for pagination (only applies to the unfiltered query) |
| `pageSize` | `int` | `50` | Page size for pagination (only applies to the unfiltered query) |

**Example requests:**

```http
# Get all logs (paginated)
GET /api/auditlogs?pageNumber=1&pageSize=25

# Filter by action
GET /api/auditlogs?action=StatusChange

# Filter by entity type
GET /api/auditlogs?entityType=Project

# Filter by date range
GET /api/auditlogs?startDate=2026-01-01T00:00:00Z&endDate=2026-02-01T00:00:00Z

# Filter by user
GET /api/auditlogs?userId=3fa85f64-5717-4562-b3fc-2c963f66afa6
```

> ⚠️ **Important:** Only **one** filter is applied at a time. See [Known Limitations](#filter-behavior--known-limitations).

---

### GET `/api/auditlogs/user/{userId}`

**Path Parameter:**

| Parameter | Type | Description |
|---|---|---|
| `userId` | `Guid` | The ID of the user whose logs to retrieve |

**Example:**

```http
GET /api/auditlogs/user/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

Returns all logs for that user, ordered by `Timestamp` descending. No pagination applied.

---

### Response Body (`AuditLogDto`)

Both endpoints return `AuditLogDto[]`.

```json
[
  {
    "id": "a1b2c3d4-...",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userName": "Ahmed Adel",
    "action": "Update",
    "entityType": "Project",
    "entityId": "42",
    "oldValues": "ProjectName: Old Name, Customer: ACME, Currency: USD, DefaultMargin: 0.15",
    "newValues": "ProjectName: New Name, Customer: ACME, Currency: USD, DefaultMargin: 0.20",
    "ipAddress": "192.168.1.1",
    "timestamp": "2026-02-05T10:30:00Z"
  }
]
```

**Field notes:**
- `userName` — resolved from the `User` navigation property (`User.FullName`). Will be `null` if the user has been deleted.
- `ipAddress` — populated only when the caller explicitly passes it (currently not passed by all services).
- `oldValues` / `newValues` — plain text, not JSON. Format varies by entity type. See [OldValues / NewValues Format](#oldvalues--newvalues-format).
- `propertyName` — **not included in the response DTO** even though it exists on the entity. It is stored in the DB but not exposed via the API.

---

## Filter Behavior & Known Limitations

### ⚠️ Single-Filter Limitation

The current `GetLogsAsync` implementation applies filters in a **priority chain** — only the **first matching condition** is applied:

```
Priority: UserId → Action → EntityType → DateRange → All (paginated)
```

This means:
- If `userId` is provided, all other filters are **ignored**.
- If `action` is provided (and `userId` is not), `entityType` and `dateRange` are **ignored**.
- `pageNumber` / `pageSize` only apply when **no other filters** are present.

**Examples of unexpected behavior:**

| Query | What you expect | What actually happens |
|---|---|---|
| `?userId=X&action=Update` | Logs for user X with action Update | All logs for user X (action filter ignored) |
| `?entityType=Project&startDate=...&endDate=...` | Project logs in date range | All Project logs (date filter ignored) |
| `?action=StatusChange&pageSize=10` | First 10 StatusChange logs | All StatusChange logs (pagination ignored) |

> **Frontend recommendation:** Use only **one filter at a time** until this limitation is resolved. The `/user/{userId}` endpoint is the reliable way to filter by user.

---

## Complete Action Reference

Below is the complete list of all action strings currently written to audit logs.

### Project Actions

| Action | EntityType | OldValues | NewValues | PropertyName |
|---|---|---|---|---|
| `Create` | `Project` | `null` | `"ProjectName: X, Customer: Y"` | `null` |
| `Update` | `Project` | `"ProjectName: X, Customer: Y, Currency: Z, DefaultMargin: M"` | Same fields with new values | `null` |
| `Delete` | `Project` | `"ProjectName: X"` | `null` | `null` |
| `StatusChange` | `Project` | `"Draft"` | `"Submitted"` | `"Status"` |
| `CollaboratorAdded` | `Project` | `null` | `"UserId: X, Role: Viewer"` | `null` |

### Panel Actions

| Action | EntityType | OldValues | NewValues | PropertyName |
|---|---|---|---|---|
| `Create` | `Panel` | `null` | `"PanelName: X, ProjectId: Y"` | `null` |
| `Update` | `Panel` | `"PanelName: X, Description: Y, OverrideMargin: Z"` | Same fields with new values | `null` |
| `Delete` | `Panel` | `"PanelName: X"` | `null` | `null` |
| `Duplicate` | `Panel` | `"SourcePanelId: X"` | `"NewPanelId: Y, PanelName: Z (Copy)"` | `null` |
| `StatusChange` | `Panel` | `"Draft"` | `"Submitted"` | `"Status"` |
| `CollaboratorAdded` | `Panel` | `null` | `"UserId: X, Role: Viewer"` | `null` |

### Role Actions

| Action | EntityType | OldValues | NewValues | PropertyName |
|---|---|---|---|---|
| `SystemRoleUpdated` | `Role` | `null` | `"Description: X, Permissions: [id1, id2, ...]"` | `null` |
| `PermissionsAssigned` | `Role` | `null` | `"Permissions: [id1, id2, ...]"` | `null` |
| `SystemRolePermissionsAssigned` | `Role` | `null` | `"Permissions: [id1, id2, ...]"` | `null` |

### Notes on Missing Audit Coverage

The following operations currently do **not** write audit logs:

| Operation | Service |
|---|---|
| Create/Update/Delete Material | `MaterialService` |
| Create/Update/Delete PanelItem | `PanelItemService` |
| User login / logout | `AuthService` |
| User create/update/delete | `UserService` |
| Role create/update/delete (non-system) | `RoleService` |
| Remove collaborator (project/panel) | `ProjectService` / `PanelService` |
| Excel import | `ExcelImportService` |

---

## OldValues / NewValues Format

Values are stored as **plain comma-separated key-value strings**, not JSON.

### Format Examples

**Project Create:**
```
OldValues: null
NewValues: "ProjectName: Electrical Panel Q1, Customer: ACME Corp"
```

**Project Update:**
```
OldValues: "ProjectName: Old Name, Customer: ACME, Currency: USD, DefaultMargin: 0.15"
NewValues: "ProjectName: New Name, Customer: ACME, Currency: USD, DefaultMargin: 0.20"
```

**Project Delete:**
```
OldValues: "ProjectName: New Name"
NewValues: null
```

**StatusChange:**
```
OldValues: "Draft"
NewValues: "Submitted"
PropertyName: "Status"  (stored in DB, not returned in DTO)
```

**CollaboratorAdded:**
```
OldValues: null
NewValues: "UserId: 3fa85f64-..., Role: Viewer"
```

**Panel Create:**
```
OldValues: null
NewValues: "PanelName: Main Panel, ProjectId: 42"
```

**SystemRoleUpdated:**
```
OldValues: null
NewValues: "Description: Updated desc, Permissions: [guid1, guid2]"
```

> **Parsing tip:** Split on `", "` cautiously — description fields may contain commas. Consider treating `OldValues`/`NewValues` as display strings rather than parseable data structures.

---

## Service Interface

```csharp
public interface IAuditService
{
    // Write a new audit log entry
    Task LogAsync(
        Guid? userId,
        string action,
        string entityType,
        string? entityId = null,
        string? oldValues = null,
        string? newValues = null,
        string? ipAddress = null,
        string? propertyName = null
    );

    // Query logs with filters (single-filter limitation applies)
    Task<IEnumerable<AuditLogDto>> GetLogsAsync(AuditLogFilterDto filter);

    // Query all logs for a specific user (no pagination)
    Task<IEnumerable<AuditLogDto>> GetUserLogsAsync(Guid userId);
}
```

### Repository Query Methods

The underlying `IAuditLogRepository` exposes these query methods (all include `User` navigation, ordered by `Timestamp DESC`):

| Method | Description |
|---|---|
| `GetByUserIdAsync(Guid userId)` | All logs for a user — no pagination |
| `GetByActionAsync(string action)` | All logs matching action (case-insensitive) — no pagination |
| `GetByEntityTypeAsync(string entityType)` | All logs for an entity type (case-insensitive) — no pagination |
| `GetByDateRangeAsync(DateTime start, DateTime end)` | All logs in time window — no pagination |
| `GetAllAsync(int pageNumber, int pageSize)` | Paginated — default page 1, size 50 |

---

## Architecture & Data Flow

```
HTTP Request
     │
     ▼
[Controller] — calls service method
     │
     ▼
[Service] — performs business logic + DB write
     │
     ├──► Primary DB write (SaveChangesAsync)
     │
     └──► AuditService.LogAsync(...)
               │
               ▼
         Creates AuditLog entity
               │
               ▼
         AuditLogRepository.AddAsync(...)
               │
               ▼
         UnitOfWork.SaveChangesAsync() — second DB write
               │
               ▼
         Record saved to AuditLogs table
```

**Key characteristics:**
- Audit write is a **separate transaction** from the primary write — the primary operation succeeds even if audit logging fails.
- `Timestamp` is set in the application layer (`DateTime.UtcNow`), not by the database.
- `User` navigation is **eagerly loaded** in all repository query methods via `.Include(a => a.User)`.

---

## TypeScript Interfaces

```typescript
interface AuditLogDto {
  id: string;           // UUID
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  timestamp: string;    // ISO 8601 UTC
}

interface AuditLogFilterDto {
  userId?: string;       // UUID
  action?: string;
  entityType?: string;
  startDate?: string;   // ISO 8601 UTC
  endDate?: string;     // ISO 8601 UTC
  pageNumber?: number;  // default: 1
  pageSize?: number;    // default: 50
}
```

---

## Frontend Integration Guide

### Audit Log Table (SuperAdmin Dashboard)

Recommended columns for an audit log table UI:

| Column | Field | Notes |
|---|---|---|
| Timestamp | `timestamp` | Format as local time |
| User | `userName` | Fallback to `userId` if `userName` is null |
| Action | `action` | Color-coded badge (see below) |
| Entity Type | `entityType` | |
| Entity ID | `entityId` | Link to entity if navigable |
| Old Values | `oldValues` | Truncate to 100 chars with expand |
| New Values | `newValues` | Truncate to 100 chars with expand |
| IP Address | `ipAddress` | |

### Recommended Action Badge Colors

| Action | Color |
|---|---|
| `Create` | Green |
| `Update` | Blue |
| `Delete` | Red |
| `StatusChange` | Orange |
| `CollaboratorAdded` | Purple |
| `Duplicate` | Teal |
| `SystemRoleUpdated` | Yellow |
| `PermissionsAssigned` | Yellow |
| `SystemRolePermissionsAssigned` | Yellow |

### Filter Strategy (Given Single-Filter Limitation)

Use **separate, exclusive** filter controls — do not allow combining:

```
[Filter by User ▼]  OR  [Filter by Action ▼]  OR  [Filter by Entity Type ▼]  OR  [Date Range]
```

When a user picks one filter, clear the others before sending the request.

### Fetching User-Specific Logs

Prefer the dedicated endpoint for user-specific views:

```typescript
// Preferred — dedicated endpoint, always returns all user logs
GET /api/auditlogs/user/{userId}

// Also works — but pagination doesn't apply when userId is set
GET /api/auditlogs?userId={userId}
```

### Pagination

Pagination (`pageNumber` / `pageSize`) **only works** when no other filters are provided:

```typescript
// Paginated browse — works correctly
GET /api/auditlogs?pageNumber=2&pageSize=25

// Paginated + filtered — pageSize is IGNORED, all matching records returned
GET /api/auditlogs?action=Update&pageSize=10  // ← returns ALL Update logs
```

---

## Known Limitations & Future Improvements

| # | Issue | Impact | Recommendation |
|---|---|---|---|
| 1 | **Single-filter-only** — `GetLogsAsync` applies only the first matching filter; combined filters are silently ignored | Frontend cannot combine e.g. user + date range in one query | Refactor `GetLogsAsync` to apply all filters as LINQ `.Where()` chains |
| 2 | **No pagination on filtered queries** — only `GetAllAsync` paginates; all other repo methods return full result sets | Large datasets may cause slow responses | Add `pageNumber`/`pageSize` to all repository query methods |
| 3 | **`propertyName` not returned in DTO** — stored in DB but omitted from `AuditLogDto` | Frontend cannot see which property changed on `StatusChange` | Add `PropertyName` field to `AuditLogDto` |
| 4 | **Incomplete coverage** — Materials, PanelItems, Auth, Users, Roles not audited | Cannot audit material price changes or login events | Call `LogAsync` in `MaterialService`, `PanelItemService`, `AuthService`, `UserService` |
| 5 | **No total count returned** — responses are plain arrays with no `totalCount` or `totalPages` | Frontend cannot build accurate pagination UI | Wrap response in `PagedResult<AuditLogDto>` with `totalCount` |
| 6 | **`OldValues`/`NewValues` are plain strings** — not structured JSON | Difficult to diff fields programmatically | Serialize as JSON objects for structured diffing |
| 7 | **No audit log deletion / retention policy** — logs grow unbounded | DB storage will grow continuously | Add a scheduled cleanup job with configurable retention period |
| 8 | **IP address not consistently populated** — passed as `null` by most callers | IP tracking is unreliable | Extract IP in controller middleware and pass to all service calls |
