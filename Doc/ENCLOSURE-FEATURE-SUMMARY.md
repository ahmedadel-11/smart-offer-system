# Enclosure Feature Summary

## What Was Implemented
The enclosure feature was completed end-to-end in the backend and database.

### 1) Feature scope
Enclosure is treated as a special material workflow with two modes:
- **Ready Enclosure**: selected from the normal material catalog by category.
- **Custom Enclosure**: built from enclosure components and stored as one panel item with a full snapshot.

### 2) Backend changes
Implemented support for:
- enclosure component catalog CRUD
- custom enclosure creation
- custom enclosure snapshot storage per panel item
- loading saved custom enclosure data
- updating custom enclosure snapshots
- deleting custom enclosure snapshots
- dedicated enclosure controller endpoints

### 3) Database changes
Applied the enclosure schema to the database:
- `EnclosureComponents`
- `PanelEnclosures`
- `PanelEnclosureComponents`

Also seeded the shared system material:
- `SYS-CUSTOM-ENCLOSURE`

### 4) Data model used
- `EnclosureComponent` = reusable catalog item
- `PanelEnclosure` = enclosure instance attached to a panel item
- `PanelEnclosureComponent` = stored snapshot row for each selected component
- `PanelItem` = single material row representing the enclosure in the panel

### 5) Important behavior
- A custom enclosure is stored as **one panel item**.
- The final price is calculated per panel instance.
- The shared material `SYS-CUSTOM-ENCLOSURE` is reusable and does not store panel-specific pricing.
- The selected component snapshot is preserved for editing and reloading.

---

## Final API Surface

## A) Enclosures Controller
Base route: `/api/enclosures`

| Method | Route | Description |
|---|---|---|
| GET | `/{panelItemId}` | Get enclosure snapshot for a panel item |
| POST | `/` | Create a custom enclosure from panel + component snapshot |
| POST | `/{panelItemId}` | Update an existing enclosure snapshot |
| DELETE | `/{panelItemId}` | Delete the enclosure snapshot |

### Create custom enclosure
`POST /api/enclosures`

#### Request body
```json
{
  "panelId": 123,
  "components": [
    {
      "panelEnclosureComponentId": 0,
      "enclosureComponentId": null,
      "reference": "ENC-001",
      "description": "Metal Sheet 2x2m",
      "brand": "Schneider",
      "quantity": 1,
      "unitPriceList": 500,
      "totalPriceList": 500,
      "qty": 1,
      "notesName": "Side panel"
    }
  ],
  "panelItemId": null
}
```

#### Response
Returns the created `PanelItemDto`.

### Get enclosure snapshot
`GET /api/enclosures/{panelItemId}`

#### Response
Returns the stored enclosure snapshot and all selected components.

### Update enclosure snapshot
`POST /api/enclosures/{panelItemId}`

#### Request body
```json
{
  "isCustom": true,
  "components": [
    {
      "panelEnclosureComponentId": 1,
      "enclosureComponentId": null,
      "reference": "ENC-001",
      "description": "Metal Sheet 2x2m",
      "brand": "Schneider",
      "quantity": 1,
      "unitPriceList": 500,
      "totalPriceList": 500,
      "qty": 1,
      "notesName": "Side panel"
    }
  ]
}
```

### Delete enclosure snapshot
`DELETE /api/enclosures/{panelItemId}`

---

## B) Enclosure Component Catalog
Base route: `/api/enclosurecomponents`

| Method | Route | Description |
|---|---|---|
| GET | `/` | List all enclosure components |
| GET | `/{id}` | Get one enclosure component |
| POST | `/` | Create enclosure component |
| PUT | `/{id}` | Update enclosure component |
| DELETE | `/{id}` | Delete enclosure component |

### Payload for create/update
```json
{
  "reference": "ENC-001",
  "description": "Custom enclosure plate",
  "brand": "PanelCo",
  "quantity": 1,
  "unitPriceList": 250.0,
  "totalPriceList": 250.0,
  "qty": 1,
  "notesName": "Plate"
}
```

---

## C) Material APIs used for Ready Enclosure
Base route: `/api/materials`

| Method | Route | Description |
|---|---|---|
| GET | `/category/{category}` | List ready enclosures by category |
| GET | `/search?term=...` | Search materials |
| GET | `/{id}` | Get a material by id |

Ready enclosures are selected as standard materials and do not create enclosure snapshots.

---

## D) Panel Item APIs still used by the feature
Base route: `/api/panelitems`

| Method | Route | Description |
|---|---|---|
| GET | `/panel/{panelId}` | Get all items for a panel |
| GET | `/panel/{panelId}/type/{itemType}` | Filter items by type |
| GET | `/{id}` | Get a single panel item |
| POST | `/` | Create a panel item |
| PUT | `/{id}` | Update a panel item |
| DELETE | `/{id}` | Delete a panel item |
| POST | `/busbar-cables/calculate` | Calculate busbar/cables sheet |
| POST | `/busbar-cables/panel/{panelId}` | Save busbar/cables sheet |
| POST | `/busbar-cables/panel/{panelId}/save-with-price` | Save busbar/cables sheet with price |
| GET | `/busbar-cables/panel/{panelId}` | Get saved busbar/cables sheet |

---

## Validation Rules
- A custom enclosure must contain at least one component.
- Quantities must be positive.
- Prices must be non-negative.
- Custom enclosure totals are calculated from the selected component snapshot.
- Panel-specific enclosure data is isolated from shared master data.

---

## Files Updated During Implementation

### API
- `src/SmartOffer.API/Controllers/EnclosuresController.cs`
- `src/SmartOffer.API/Controllers/PanelItemsController.cs`

### Application
- `src/SmartOffer.Application/DTOs/EnclosureDtos.cs`
- `src/SmartOffer.Application/Interfaces/IPanelItemService.cs`
- `src/SmartOffer.Application/Services/PanelItemService.cs`

### Domain / Infrastructure
- `src/SmartOffer.Domain/Interfaces/IPanelItemRepository.cs`
- `src/SmartOffer.Infrastructure/Repositories/PanelItemRepository.cs`
- `src/SmartOffer.Infrastructure/Repositories/PanelRepository.cs`
- `src/SmartOffer.Infrastructure/Data/DatabaseSeeder.cs`
- `src/SmartOffer.Infrastructure/Migrations/20260505085142_AddEnclosuresFeature.cs`

### Database
- Migration applied successfully to the development database.

---

## Status
The enclosure feature is implemented and the database schema has been updated.
