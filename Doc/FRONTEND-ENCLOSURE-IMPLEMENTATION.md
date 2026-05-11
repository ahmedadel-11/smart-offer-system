# Frontend Implementation Guide — Enclosure

## Goal
Implement the enclosure workflow in the UI so users can:
- choose a **Ready Enclosure** from the material catalog
- build a **Custom Enclosure** from enclosure components
- save the custom enclosure as a single panel item
- reopen and edit the saved snapshot later

This guide is aligned with the current backend APIs and the dedicated `EnclosuresController`.

---

## Backend APIs to Use

### 1) Enclosures Controller
Base route: `/api/enclosures`

| Method | Route | Description |
|---|---|---|
| GET | `/{panelItemId}` | Load an existing enclosure snapshot |
| POST | `/` | Create a custom enclosure |
| POST | `/{panelItemId}` | Update an existing enclosure snapshot |
| DELETE | `/{panelItemId}` | Delete an enclosure snapshot |

### 2) Enclosure Components Catalog
Base route: `/api/enclosurecomponents`

| Method | Route | Description |
|---|---|---|
| GET | `/` | List all enclosure components |
| GET | `/{id}` | Get one enclosure component |
| POST | `/` | Create enclosure component |
| PUT | `/{id}` | Update enclosure component |
| DELETE | `/{id}` | Delete enclosure component |

### 3) Ready Enclosure Material Lookup
Base route: `/api/materials`

| Method | Route | Description |
|---|---|---|
| GET | `/category/{category}` | List ready enclosures by category |
| GET | `/search?term=...` | Search materials |
| GET | `/{id}` | Get a material by id |

### 4) Panel Items
Base route: `/api/panelitems`

Useful for reading panel items and showing the enclosure item in the panel list.

---

## Frontend User Flow

### A) Open Enclosure
When the user opens enclosure management for a panel, show two choices:
1. **Ready Enclosure**
2. **Custom Enclosure**

### B) Ready Enclosure
- Load materials from `/api/materials/category/{category}`.
- Let the user search by term.
- Let the user select one material.
- Save it as a normal panel item.
- No enclosure snapshot is created.

### C) Custom Enclosure
- Load all enclosure components from `/api/enclosurecomponents`.
- Show a component picker with the catalog list.
- Allow the user to:
  - add components
  - edit quantity
  - edit notes
  - remove components
- Calculate the total price live in the UI.
- Save the result through `/api/enclosures`.

---

## Recommended Screens

### 1) Enclosure Choice Dialog
Simple decision screen with two cards or buttons:
- Ready Enclosure
- Custom Enclosure

### 2) Ready Enclosure Picker
Fields:
- search box
- category selector or locked category
- list of materials
- preview of selected material
- confirm button

### 3) Custom Enclosure Builder
Sections:
- component catalog list
- selected components table
- running total
- save / update / cancel buttons

---

## Custom Enclosure Table Columns
Show these columns in the selected components grid:
- Reference
- Description
- Brand
- Qty.
- U.Price List
- T.Price List
- Selected Quantity (qty)
- Notes / Name

These map directly to the backend snapshot model.

---

## Suggested Frontend State Model

```ts
interface EnclosureComponentSnapshot {
  panelEnclosureComponentId: number;
  enclosureComponentId?: number | null;
  reference?: string | null;
  description: string;
  brand?: string | null;
  quantity: number;
  unitPriceList: number;
  totalPriceList: number;
  qty: number;
  notesName?: string | null;
}

interface CustomEnclosureState {
  panelId: number;
  panelItemId?: number | null;
  isCustom: boolean;
  components: EnclosureComponentSnapshot[];
  totalPrice: number;
}
```

---

## Live Price Calculation
The frontend should calculate the total whenever the user changes any selected component.

Suggested rule:
- `componentTotal = totalPriceList`
- `enclosureTotal = sum(all component totals)`

If your UI lets the user edit quantities dynamically, recalculate the row total and then the enclosure total.

---

## Save Flow

### Create New Custom Enclosure
1. User selects custom enclosure.
2. User chooses components.
3. UI calculates the total.
4. UI posts to `POST /api/enclosures`.
5. Backend creates the enclosure as one panel item.

### Update Existing Custom Enclosure
1. UI loads current data from `GET /api/enclosures/{panelItemId}`.
2. User edits components.
3. UI recalculates the total.
4. UI posts updated snapshot to `POST /api/enclosures/{panelItemId}`.

### Delete Enclosure
1. User confirms delete.
2. UI calls `DELETE /api/enclosures/{panelItemId}`.
3. Backend removes the enclosure snapshot.

---

## Ready Enclosure Save Flow
If the user selects a ready enclosure:
1. Load the material from `/api/materials/category/{category}`.
2. Create or update the panel item using the normal panel item flow.
3. Do not create enclosure snapshot records.

---

## Validation Rules in UI
- At least one component must be selected for a custom enclosure.
- Quantity must be greater than zero.
- Prices must not be negative.
- The user must review the final enclosure before saving.

---

## Important UI Notes
- The shared material `SYS-CUSTOM-ENCLOSURE` should be treated as a system item.
- Do not let the user edit its price like a normal material.
- The custom enclosure is panel-specific, so each panel can have its own snapshot.
- Saved custom enclosures should reopen with the same components and notes.

---

## Implementation Checklist
- [ ] Add enclosure choice dialog
- [ ] Add ready enclosure picker
- [ ] Add custom enclosure builder
- [ ] Load enclosure component catalog
- [ ] Load ready enclosure materials by category
- [ ] Calculate enclosure totals live
- [ ] Save custom enclosure snapshot
- [ ] Load existing enclosure snapshot
- [ ] Delete enclosure snapshot
- [ ] Show custom enclosure as a single panel item

---

## Success Criteria
- Users can choose ready or custom enclosure
- Custom enclosure saves as one panel item
- The full component snapshot is preserved
- The UI can reopen and edit saved enclosures
- The UI matches the dedicated backend `EnclosuresController`
