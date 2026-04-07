# Material List & Pricing Endpoints

## Added Endpoints

### 1. Panel Material List

**`GET /api/panels/{id}/material-list`**

Returns the full material list for a specific panel, including per-item pricing calculations.

**Authorization:** `TenderingEngineer` policy + panel access check

**Response:** `200 OK`

```json
{
  "panelId": 1,
  "panelName": "Main Panel",
  "materials": [
    {
      "materialId": 10,
      "itemCode": "MCB-32A",
      "description": "Miniature Circuit Breaker 32A",
      "brand": "Schneider",
      "category": "Circuit Breakers",
      "quantity": 5,
      "basePrice": 120.00,
      "discount": 15.00,
      "unitCost": 102.00,
      "totalCost": 510.00,
      "totalPrice": 561.00
    }
  ],
  "totalQuantity": 5,
  "totalCost": 510.00,
  "totalPrice": 561.00
}
```

---

### 2. Project Material List

**`GET /api/projects/{id}/material-list`**

Returns the material list for the entire project. Includes:
- **Per-panel breakdown** — materials grouped by panel.
- **Consolidated list** — all materials aggregated across panels by `MaterialId` (quantities and costs summed).

**Authorization:** `TenderingEngineer` policy + project access check

**Response:** `200 OK`

```json
{
  "projectId": 1,
  "projectName": "Factory Power Distribution",
  "customer": "ACME Corp",
  "currency": "USD",
  "panels": [
    {
      "panelId": 1,
      "panelName": "Main Panel",
      "materials": [ ... ],
      "totalQuantity": 12,
      "totalCost": 3400.00,
      "totalPrice": 3740.00
    }
  ],
  "consolidatedMaterials": [ ... ],
  "totalQuantity": 20,
  "totalCost": 5200.00,
  "totalPrice": 5720.00
}
```

---

### 3. Project Total Price

**`GET /api/projects/{id}/total-price`**

Returns a focused financial summary for the project: total cost, margin, and final price.

**Authorization:** `TenderingEngineer` policy + project access check

**Response:** `200 OK`

```json
{
  "projectId": 1,
  "projectName": "Factory Power Distribution",
  "currency": "USD",
  "totalPanels": 3,
  "totalItems": 42,
  "totalCost": 15200.00,
  "totalMarginAmount": 2280.00,
  "totalPrice": 17480.00
}
```

---

## Project Workflow Endpoints

### 4. Lock Project

**`POST /api/projects/{id}/lock`**

Locks a project to prevent edits (e.g., after offer submission).

**Authorization:** `TenderingEngineer` policy + `Projects.ChangeStatus` permission

**Response:** `200 OK` — Returns the updated `ProjectDto`.

**Errors:** `400 Bad Request` if project is already locked.

---

### 5. Unlock Project

**`POST /api/projects/{id}/unlock`**

Unlocks a previously locked project.

**Authorization:** `TenderingEngineer` policy + `Projects.ChangeStatus` permission

**Response:** `200 OK` — Returns the updated `ProjectDto`.

**Errors:** `400 Bad Request` if project is not locked.

---

### 6. Clone Project

**`POST /api/projects/{id}/clone`**

Deep-clones an entire project including all panels and their items as a new draft.

**Authorization:** `TenderingEngineer` policy + project access check

**Response:** `201 Created` — Returns the new `ProjectDto` with `" (Copy)"` suffix on the name.

---

### 7. Project Changelog

**`GET /api/projects/{id}/changelog`**

Returns a filtered audit log showing all changes to a project and its panels/items.

**Authorization:** `TenderingEngineer` policy + project access check

**Response:** `200 OK` — Returns `AuditLogDto[]` ordered by timestamp descending.

```json
[
  {
    "id": "...",
    "userId": "...",
    "userName": "Ahmed Adel",
    "action": "Update",
    "entityType": "Project",
    "entityId": "1",
    "oldValues": "...",
    "newValues": "...",
    "timestamp": "2025-02-05T10:00:00Z"
  }
]
```

---

### 8. Project Versions

**`GET /api/projects/{id}/versions`**

Returns version history — audit log entries for milestone events: `Create`, `StatusChange`, `Lock`, `Unlock`, `Clone`.

**Authorization:** `TenderingEngineer` policy + project access check

**Response:** `200 OK` — Returns `AuditLogDto[]` ordered by timestamp descending.

---

## Export & Offer Generation Endpoints

### 9. Export Project Material List

**`GET /api/projects/{id}/export-material-list`**

Exports the consolidated material list to an Excel file with per-panel sheets and a "Consolidated" sheet.

**Authorization:** `TenderingEngineer` policy

**Response:** Excel file (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

---

### 10. Export Panel Material List

**`GET /api/panels/{id}/export-material-list`**

Exports a single panel's material list to an Excel file with headers: Item Code, Description, Brand, Category, Quantity, Base Price, Discount %, Unit Cost, Total Cost, Total Price.

**Authorization:** `TenderingEngineer` policy

**Response:** Excel file

---

### 11. Export Offer / Quotation

**`GET /api/projects/{id}/export-offer`**

Generates a formatted offer/quotation Excel document with:
- **"Offer" cover sheet** — project info, panel summary table with totals
- **Per-panel detail sheets** — full material list with pricing

**Authorization:** `TenderingEngineer` policy

**Response:** Excel file

---

## Dashboard / Statistics Endpoints

### 12. Dashboard Stats

**`GET /api/dashboard/stats`**

Returns overview statistics across all projects.

**Authorization:** Any authenticated user

**Response:** `200 OK`

```json
{
  "totalProjects": 15,
  "draftProjects": 5,
  "inProgressProjects": 4,
  "completedProjects": 3,
  "archivedProjects": 3,
  "totalActiveOffersValue": 125400.00,
  "totalPanels": 42,
  "totalMaterials": 350
}
```

---

### 13. Recent Activity

**`GET /api/dashboard/recent-activity?count=20`**

Returns recent audit log entries for the current user.

**Authorization:** Any authenticated user

**Response:** `200 OK`

```json
[
  {
    "id": "...",
    "userId": "...",
    "userName": "Ahmed Adel",
    "action": "Create",
    "entityType": "Panel",
    "entityId": "5",
    "timestamp": "2025-02-05T10:00:00Z"
  }
]
```

---

### 14. Search Projects

**`GET /api/projects/search?q={term}`**

Full-text search across project name, customer, and notes. Results are filtered by the user's access permissions.

**Authorization:** `TenderingEngineer` policy

**Response:** `200 OK` — Returns `ProjectDto[]`

---

## Database Migration

The `AddProjectLockFields` migration adds the following columns to the `Projects` table:

| Column | Type | Default |
|--------|------|---------|
| `IsLocked` | `bit` | `false` |
| `LockedAt` | `datetime2` | `NULL` |
| `LockedByUserId` | `uniqueidentifier` | `NULL` |
