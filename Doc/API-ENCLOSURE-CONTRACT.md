# API Contract — Enclosure

## Purpose
Describe the API surface required to support enclosure management, component catalog operations, and panel-specific custom enclosure snapshots.

This contract is split into:
- enclosure component catalog APIs
- material selection APIs for ready enclosures
- dedicated enclosure snapshot APIs

---

## Final API Surface

## A) Enclosures Controller
Base route: `/api/enclosures`

| Method | Route | Description |
|---|---|---|
| GET | `/{panelItemId}` | Get enclosure snapshot for a panel item |
| POST | `/` | Create a custom enclosure from a panel and component snapshot |
| POST | `/{panelItemId}` | Update an existing enclosure snapshot |
| DELETE | `/{panelItemId}` | Delete the enclosure snapshot |

### GET /api/enclosures/{panelItemId}
Returns the enclosure snapshot for a panel item.

#### Response shape
```json
{
  "panelEnclosureId": 1,
  "panelItemId": 123,
  "isCustom": true,
  "totalPrice": 850.0,
  "components": [
    {
      "panelEnclosureComponentId": 1,
      "enclosureComponentId": null,
      "reference": "ENC-001",
      "description": "Custom enclosure plate",
      "brand": "PanelCo",
      "quantity": 1,
      "unitPriceList": 250.0,
      "totalPriceList": 250.0,
      "qty": 1,
      "notesName": "Plate"
    }
  ]
}
```

### POST /api/enclosures
Creates a custom enclosure as a single panel item.

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

### POST /api/enclosures/{panelItemId}
Updates an existing custom enclosure snapshot and recalculates the total.

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

### DELETE /api/enclosures/{panelItemId}
Deletes the enclosure snapshot from the panel item.

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

## C) Ready Enclosure Material Lookup
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

## Contract Rules

### Custom enclosure
When saving a custom enclosure:
- create one panel item using the shared material `SYS-CUSTOM-ENCLOSURE`
- store the selected snapshot per panel item
- store the final calculated price on the panel-owned record, not in shared material data

### Ready enclosure
When saving a ready enclosure:
- use the selected material directly
- do not store a component snapshot
- keep pricing on the material item flow

### Snapshot persistence
The API must preserve:
- selected component values
- component prices at the time of save
- notes
- panel association

---

## Validation Expectations
- Reject empty custom enclosure component lists.
- Reject negative prices or quantities.
- Reject enclosure updates for missing panel items.
- Recalculate total price on the server before persisting.

---

## Notes for Future Implementation
- The current `EnclosuresController` is the dedicated entry point for enclosure snapshots.
- The current `PanelEnclosure` and `PanelEnclosureComponent` entities provide the right storage model for custom enclosure snapshots.
- Ready enclosure selection remains part of the normal material flow.
