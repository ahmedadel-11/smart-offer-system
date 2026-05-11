# Frontend Specification — Enclosure

## Purpose
Define the UI and interaction flow for enclosure handling in the panel workflow.

The frontend must support two enclosure paths:
- **Ready Enclosure**: select a predefined enclosure material.
- **Custom Enclosure**: compose one enclosure from a list of components and save it as a single panel item.

---

## User Experience Flow

### Step 1: Open Enclosure
When the user opens the Enclosure section, present two options:
- Select Ready Enclosure
- Create Custom Enclosure

### Step 2A: Ready Enclosure flow
- Load enclosure materials filtered by the enclosure category.
- Allow the user to search and select one item.
- Save the selected item as a normal panel material line.

### Step 2B: Custom Enclosure flow
- Load the full enclosure component catalog.
- Show a selectable component list.
- Allow the user to define:
  - selected components
  - quantities
  - notes
- Calculate the total price dynamically as the user changes the selection.
- Save the result as one panel material item linked to a snapshot of components.

---

## UI Structure

### Enclosure chooser
A small decision view with two buttons or cards:
- Ready Enclosure
- Custom Enclosure

### Ready enclosure picker
- Searchable material list
- Category filter preselected or locked to enclosure category
- Material preview with price
- Confirm button to add to panel

### Custom enclosure builder
- Master list of enclosure components
- Selected components table
- Editable fields per selected row:
  - Reference
  - Description
  - Brand
  - Quantity
  - Unit Price
  - Total Price
  - Selected Qty
  - Notes / Name
- Running total at the bottom
- Save / Update button

---

## Frontend Data Rules

### Custom enclosure state
The UI must keep a local working model containing:
- selected component identifiers
- component snapshot fields
- current calculated total
- panel association

### Pricing behavior
- The total must update immediately when quantities or selected components change.
- The UI must not rely on the shared material price for custom enclosure pricing.
- The display should clearly distinguish catalog component price from final enclosure total.

### Editing behavior
When opening an existing custom enclosure:
- preload the saved snapshot
- restore quantities and notes
- recompute totals if the user makes changes
- submit the updated snapshot back to the backend

---

## Component Table Columns
The custom enclosure table should show:
- Reference
- Description
- Brand
- Qty.
- U.Price List
- T.Price List
- Selected Quantity (qty)
- Notes / Name

These map directly to the persisted snapshot structure.

---

## API Usage Expectations

### Ready enclosure retrieval
Use material endpoints with category filtering:
- `GET /api/materials/category/{category}`
- `GET /api/materials/search?term=...`

### Custom enclosure component catalog
Use enclosure component endpoints:
- `GET /api/enclosurecomponents`
- `GET /api/enclosurecomponents/{id}`
- `POST /api/enclosurecomponents`
- `PUT /api/enclosurecomponents/{id}`
- `DELETE /api/enclosurecomponents/{id}`

### Panel save/load
Use the dedicated enclosure controller:
- `GET /api/enclosures/{panelItemId}`
- `POST /api/enclosures`
- `POST /api/enclosures/{panelItemId}`
- `DELETE /api/enclosures/{panelItemId}`

---

## Material Presentation Rule
The material list should expose a system item such as:
- `SYS-CUSTOM-ENCLOSURE`

This item is not edited like a normal material price item. It is a shared placeholder representing the custom enclosure container.

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
