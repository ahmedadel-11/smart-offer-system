# Backend Feature Specification — Enclosure

## Purpose
Define a backend design for **Enclosure** as a special type of material that supports both:
- **Ready Enclosure**: a predefined material selected from a category-filtered catalog.
- **Custom Enclosure**: a dynamic enclosure composed from a snapshot of selected components.

This specification is intended to guide implementation in the domain, application, infrastructure, and API layers.

---

## Business Rules

### 1) Enclosure is a special material type
- Enclosure must behave like a material item from the panel perspective.
- A custom enclosure must be represented as a **single panel material line item**.
- The total price of a custom enclosure is calculated from its selected components.

### 2) Two enclosure modes

#### Ready Enclosure
- Stored as a normal material.
- Selected from a category-filtered list of materials.
- Uses fixed master data and fixed pricing.
- No component snapshot is required.

#### Custom Enclosure
- Built from a selectable list of enclosure components.
- Each panel can have its own unique configuration.
- Must store the selected component snapshot for future retrieval and editing.
- The enclosure price is dynamic and must be stored per panel instance, not in the shared material master data.

### 3) Reusability constraint
- A fixed shared material such as `SYS-CUSTOM-ENCLOSURE` may be reused across many panels and projects.
- The shared material must **not** contain panel-specific price data.
- Panel-specific totals and component snapshots must be stored in a dedicated panel-owned structure.

### 4) Snapshot requirement
For each custom enclosure instance, the system must store:
- selected components
- component quantities
- component unit prices at selection time
- component total prices at selection time
- notes or names attached by the user

### 5) Editing behavior
The system must allow:
- loading a saved custom enclosure configuration
- modifying selected components
- changing quantities and notes
- recalculating the total price
- persisting the updated snapshot per panel instance

---

## Domain Model

The current codebase already contains the core entities needed for this feature.

### Existing Entities

#### `EnclosureComponent`
Represents a reusable component catalog item.
Fields:
- `EnclosureComponentId`
- `Reference`
- `Description`
- `Brand`
- `Quantity`
- `UnitPriceList`
- `TotalPriceList`
- `Qty`
- `NotesName`

This entity is the master list used to build a custom enclosure.

#### `PanelEnclosure`
Represents the enclosure instance attached to a panel item.
Fields:
- `PanelEnclosureId`
- `PanelItemId`
- `IsCustom`
- `TotalPrice`
- `Components`

This is the aggregate root for the stored enclosure snapshot.

#### `PanelEnclosureComponent`
Represents one selected component within a panel enclosure snapshot.
Fields:
- `PanelEnclosureComponentId`
- `PanelEnclosureId`
- `Reference`
- `Description`
- `Brand`
- `Quantity`
- `UnitPriceList`
- `TotalPriceList`
- `Qty`
- `NotesName`

This entity stores the selected component data as it existed at save time.

---

## Recommended Persistence Design

### Materials
Use existing material storage for:
- standard materials
- ready enclosures
- shared system material `SYS-CUSTOM-ENCLOSURE`

### PanelItems
Store the enclosure as a single panel item:
- `PanelItemId`
- `PanelId`
- `MaterialId`
- `FinalPrice`
- `ItemType = Enclosure`

For custom enclosures, `FinalPrice` is the calculated panel-specific amount.

### PanelEnclosures
Use `PanelEnclosure` as the panel-owned enclosure instance:
- one `PanelEnclosure` per custom enclosure panel item
- links to the corresponding `PanelItem`
- stores `IsCustom` to distinguish ready vs custom behavior
- stores `TotalPrice` for the current panel instance

### PanelEnclosureComponents
Store component snapshots in `PanelEnclosureComponent`:
- one row per selected component
- stores the exact selected values and pricing at the time of save

---

## Calculation Rules

### Component price calculation
For each selected component:
- `ComponentTotal = UnitPriceList * Qty` or the stored total field used by the current pricing rules

### Enclosure total calculation
For a custom enclosure:
- `EnclosureTotal = sum(all selected component totals)`

### Material price rule
- The shared material `SYS-CUSTOM-ENCLOSURE` must not be updated with the panel total.
- The price must be stored on the panel enclosure instance or panel item.

---

## Data Ownership

### Shared data
Shared catalog data:
- `EnclosureComponent`
- ready enclosure materials
- `SYS-CUSTOM-ENCLOSURE` material

### Panel-owned data
Panel-specific data:
- `PanelEnclosure`
- `PanelEnclosureComponent`
- the custom enclosure `FinalPrice` or `TotalPrice`

This separation ensures reuse without cross-panel pricing conflicts.

---

## Lifecycle

### Create custom enclosure
1. User selects enclosure type = Custom.
2. System loads available enclosure components.
3. User selects components and enters quantities / notes.
4. System calculates the total price.
5. System creates a shared panel material item for `SYS-CUSTOM-ENCLOSURE`.
6. System stores a `PanelEnclosure` instance linked to the panel item.
7. System stores the selected components as child snapshot rows.

### Create ready enclosure
1. User selects enclosure type = Ready.
2. System filters materials by enclosure category.
3. User chooses a ready enclosure material.
4. System adds it as a normal material item to the panel.
5. No custom snapshot is required.

### Edit custom enclosure
1. System loads the stored `PanelEnclosure` and child components.
2. User updates selected components, quantities, or notes.
3. System recalculates the total.
4. System updates the snapshot and the panel-specific price.

---

## Retrieval Requirements
The backend must support returning:
- the panel enclosure header
- all selected components
- the stored component prices at selection time
- the current total price
- the linked panel item and material reference

This enables full reconstruction of the custom enclosure configuration.

---

## Validation Requirements
- Prevent saving a custom enclosure without at least one component.
- Validate quantities and prices as non-negative values.
- Preserve selection snapshots even if catalog data changes later.
- Keep panel-specific pricing isolated from shared master data.

---

## Implementation Notes
- The current repository already contains enclosure-related entities and an enclosure components controller.
- A future implementation can extend the panel item service and enclosure persistence flow to create and manage custom enclosure panel items.
- The document intentionally keeps the shared material and panel-specific snapshot responsibilities separate.

---

## Acceptance Criteria
- Ready enclosure flows use normal material selection.
- Custom enclosure flows store a single panel material item plus snapshot data.
- The full selected component set is persisted per panel.
- The total is computed dynamically per panel instance.
- Component editing and reloading are supported.
