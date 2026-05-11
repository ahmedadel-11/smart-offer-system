# Frontend Implementation — Enclosure Components

## Goal
Enable the UI workflows for enclosure handling inside the panel designer.

The frontend must support two paths:
- **Ready Enclosure**: select a predefined enclosure material.
- **Custom Enclosure**: build one enclosure from a selectable component catalog and save it as a single panel item.

---

## Key Concepts
- Enclosure components are stored as a master catalog list.
- A custom enclosure uses a shared system material such as `SYS-CUSTOM-ENCLOSURE`.
- The shared material is added to a panel as a normal `PanelItem`.
- The selected components, quantities, prices, and notes are stored as a panel-owned snapshot linked to that `PanelItem`.
- The final enclosure total is calculated per panel instance and must not be stored in the shared material master data.

---

## User Flow

### Step 1: Open Enclosure
When the user opens the Enclosure section, show two choices:
- Select Ready Enclosure
- Create Custom Enclosure

### Step 2A: Ready Enclosure
- Load enclosure materials filtered by the enclosure category.
- Allow search and selection.
- Save the selected material as a normal panel material line item.
- No component snapshot is created.

### Step 2B: Custom Enclosure
- Load the full enclosure component catalog.
- Show a selectable component list.
- Allow the user to define:
  - selected components
  - quantities
  - notes
- Calculate the total price dynamically as the selection changes.
- Save the result as one panel material item linked to the enclosure snapshot.

---

## UI Requirements

### Enclosure chooser
Use a small decision view with two buttons or cards:
- Ready Enclosure
- Custom Enclosure

### Ready enclosure picker
- Searchable material list
- Category filter preselected or locked to the enclosure category
- Material preview with price
- Confirm button to add to the panel

### Custom enclosure builder
- Master list of enclosure components
- Selected components table
- Editable fields per selected row:
  - Reference
  - Description
  - Brand
  - Quantity
  - Unit Price List
  - Total Price List
  - Selected Quantity (qty)
  - Notes / Name
- Running total at the bottom
- Save / Update button

---

## Data Rules

### Custom enclosure state
The UI should keep a local working model containing:
- selected component identifiers
- snapshot fields for each selected component
- current calculated total
- panel association

### Pricing behavior
- Total price must update immediately when quantities or selected components change.
- The UI must not rely on shared material pricing for custom enclosure totals.
- The display should clearly distinguish component-level pricing from the final enclosure total.

### Editing behavior
When opening an existing custom enclosure:
- preload the saved snapshot
- restore quantities and notes
- recompute totals if the user changes the data
- submit the updated snapshot back to the backend

---

## API Endpoints

### Enclosure components catalog
Base route: `/api/enclosurecomponents`

| Method | Route | Description |
|---|---|---|
| GET | `/` | List all enclosure components |
| GET | `/{id}` | Get a component by id |
| POST | `/` | Create a component |
| PUT | `/{id}` | Update a component |
| DELETE | `/{id}` | Delete a component |

Payload (create/update):
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

### Ready enclosure material lookup
Use material endpoints with category filtering:
- `GET /api/materials/category/{category}`
- `GET /api/materials/search?term=...`

### Panel item integration
The frontend should later integrate with panel item endpoints that store:
- the selected enclosure type
- the final price
- the enclosure snapshot
- the association to the panel item

---

## Material Presentation Rule
The material list should expose a system item such as:
- `SYS-CUSTOM-ENCLOSURE`

This item is a shared placeholder representing the custom enclosure container and should not be edited as a normal priced material.

---

## Validation Rules
- At least one component must be selected for a custom enclosure.
- Quantities must be greater than zero.
- Notes should be optional unless product rules require them.
- The user must be able to review the full snapshot before saving.

---

## Success Criteria
- The user can choose between ready and custom enclosure paths.
- Ready enclosure selection behaves like normal material selection.
- Custom enclosure selection supports component composition and live pricing.
- Saved custom enclosures can be reopened and edited.
- The frontend can display a single panel item while preserving detailed component snapshots.
