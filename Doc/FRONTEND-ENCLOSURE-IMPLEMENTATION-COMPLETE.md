# Enclosure Feature Implementation Guide

## Overview

The Enclosure feature has been fully implemented with a complete workflow for handling both Ready and Custom enclosures. The feature follows strict state management principles to prevent data inconsistency.

## Architecture

### Core Components

1. **EnclosureManager** - Main orchestrator component
   - Manages the complete workflow
   - Handles navigation between Ready and Custom modes
   - Coordinates API calls

2. **EnclosureChoice** - Initial decision modal
   - Allows users to choose between Ready or Custom enclosure
   - Step 1 of the workflow

3. **ReadyEnclosurePicker** - Ready enclosure selection
   - Searches and filters materials by category
   - Displays material list with pricing
   - Directly adds selected material as panel item

4. **CustomEnclosureBuilder** - Custom enclosure composer
   - Shows component catalog (left side)
   - Shows selected components table (right side)
   - Live price calculation
   - Supports editing quantities and notes
   - Full snapshot persistence

5. **EnclosureProvider** - Context provider
   - Wraps the application
   - Provides global EnclosureManager access
   - Manages modal state

### Services

**enclosureService** (`src/services/enclosureService.ts`)
- Enclosure component catalog operations
- Custom enclosure CRUD operations
- Price calculations
- Validation logic

### Hooks

**useEnclosure** (`src/hooks/useEnclosure.ts`)
- Manages enclosure state per panel
- Handles component operations
- Calculates totals
- Validates enclosure data
- Handles save/load operations

## Integration Steps

### Step 1: Wrap your app with EnclosureProvider

Update your main App.tsx or layout component:

```tsx
import { EnclosureProvider } from './components/enclosures';

function App() {
  return (
    <EnclosureProvider onEnclosureAdded={() => {
      // Refresh panel data if needed
      // This callback is triggered after enclosure is saved
    }}>
      {/* Your app content */}
    </EnclosureProvider>
  );
}
```

### Step 2: Use in panel designer

In your Panel Designer or wherever you want to add the "Add Enclosure" button:

```tsx
import { useEnclosureManager } from '../components/enclosures';
import { Button } from '@mui/material';

function PanelDesigner() {
  const { openEnclosureManager } = useEnclosureManager();
  const panelId = 123; // Your panel ID

  // To add a new enclosure
  const handleAddEnclosure = () => {
    openEnclosureManager(panelId);
  };

  // To edit an existing enclosure
  const handleEditEnclosure = (panelItemId: number) => {
    openEnclosureManager(panelId, panelItemId);
  };

  return (
    <>
      <Button onClick={handleAddEnclosure}>Add Enclosure</Button>
      {/* Your panel designer UI */}
    </>
  );
}
```

## Feature Workflow

### Ready Enclosure Flow

1. User clicks "Add Enclosure"
2. Modal shows choice: Ready or Custom
3. User selects "Ready Enclosure"
4. Material list dialog opens (filtered by "Enclosure" category)
5. User searches and selects an enclosure material
6. Material is added directly as a panel item
7. Dialog closes, panel refreshes

**Data Storage:**
- Regular panel item created with selected material
- No enclosure snapshot stored
- Pricing handled by standard material flow

### Custom Enclosure Flow

1. User clicks "Add Enclosure"
2. Modal shows choice: Ready or Custom
3. User selects "Custom Enclosure"
4. Component catalog loads on left side
5. User clicks "+" button to add components
6. User edits quantities and notes for each component
7. Total price calculates live
8. User clicks "Save Enclosure"
9. Backend creates:
   - One panel item with `SYS-CUSTOM-ENCLOSURE`
   - `PanelEnclosure` snapshot
   - `PanelEnclosureComponent` records (one per component)
10. Panel refreshes

**Data Storage:**
- One panel item created (linked to `SYS-CUSTOM-ENCLOSURE`)
- Full component snapshot persisted per panel
- Pricing stored with panel item
- Snapshot preserves component selections, quantities, notes

## API Endpoints Used

### Enclosure Components Catalog
```
GET    /api/enclosurecomponents           - List all components
GET    /api/enclosurecomponents/{id}      - Get one component
POST   /api/enclosurecomponents           - Create component (admin)
PUT    /api/enclosurecomponents/{id}      - Update component (admin)
DELETE /api/enclosurecomponents/{id}      - Delete component (admin)
```

### Custom Enclosure Management
```
GET    /api/enclosures/{panelItemId}      - Get enclosure snapshot
POST   /api/enclosures                    - Create custom enclosure
POST   /api/enclosures/{panelItemId}      - Update enclosure
DELETE /api/enclosures/{panelItemId}      - Delete enclosure
```

### Materials (For Ready Enclosure)
```
GET    /api/materials/category/{category} - List by category
GET    /api/materials/search?term=...     - Search materials
GET    /api/materials/{id}                - Get one material
```

### Panel Items
```
POST   /api/panelitems                    - Create panel item
```

## State Management

### CustomEnclosureState

```typescript
interface CustomEnclosureState {
  panelId: number;                           // Which panel this belongs to
  panelItemId?: number;                      // ID if updating existing
  components: EnclosureComponentSnapshot[];  // Selected components
  totalPrice: number;                        // Calculated total
  isDirty: boolean;                          // Has unsaved changes
}
```

### Key Principles

1. **Per-Panel State** - State is strictly per panel, never global
2. **Snapshot-Based** - Component selections stored as full snapshot
3. **Live Calculation** - Total price recalculated on every change
4. **Immutable Updates** - State updates create new objects
5. **Backend Sync** - State saved only when user clicks Save

## Component Usage Examples

### Example 1: Simple integration in panel items list

```tsx
import { PanelItem } from '../types';
import { useEnclosureManager } from '../components/enclosures';

function PanelItemsList({ panelId, items }: { panelId: number; items: PanelItem[] }) {
  const { openEnclosureManager } = useEnclosureManager();

  const enclosureItem = items.find(i => i.itemType === 3); // PanelItemType.Enclosure

  return (
    <div>
      {enclosureItem ? (
        <div>
          <span>Enclosure: {enclosureItem.description}</span>
          <button onClick={() => openEnclosureManager(panelId, enclosureItem.panelItemId)}>
            Edit
          </button>
        </div>
      ) : (
        <button onClick={() => openEnclosureManager(panelId)}>
          Add Enclosure
        </button>
      )}
    </div>
  );
}
```

### Example 2: Using the hook directly

```tsx
import { useEnclosure } from '../hooks';
import { EnclosureComponent } from '../types';

function CustomBuilder() {
  const { state, components, addComponent, removeComponent, updateComponentQty } = useEnclosure({
    panelId: 123
  });

  return (
    <div>
      <div>
        {components.map(comp => (
          <button key={comp.enclosureComponentId} onClick={() => addComponent(comp)}>
            Add {comp.description}
          </button>
        ))}
      </div>

      <table>
        <tbody>
          {state.components.map((selected, idx) => (
            <tr key={idx}>
              <td>{selected.description}</td>
              <td>
                <input 
                  type="number" 
                  value={selected.qty}
                  onChange={(e) => updateComponentQty(idx, parseInt(e.target.value))}
                />
              </td>
              <td>{selected.totalPriceList}</td>
              <td>
                <button onClick={() => removeComponent(idx)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>Total: {state.totalPrice}</div>
    </div>
  );
}
```

## Critical Implementation Notes

### ❌ Mistakes to Avoid

1. **Do NOT** save only the total price without components
2. **Do NOT** treat components as individual panel items
3. **Do NOT** modify the shared `SYS-CUSTOM-ENCLOSURE` material price
4. **Do NOT** reuse state across different panels
5. **Do NOT** cache component selections in localStorage without panel context

### ✅ Best Practices

1. **Always** load full snapshot when editing
2. **Recalculate** totals on every component change
3. **Preserve** component snapshot even if catalog changes
4. **Validate** before saving (use validateEnclosure())
5. **Handle** loading and error states properly
6. **Show** confirmation before discarding unsaved changes

## Validation Rules

The feature includes built-in validation:

```typescript
validateEnclosure(): { valid: boolean; errors: string[] }
```

Checks:
- At least 1 component required
- All descriptions must be filled
- Quantities > 0
- No negative prices
- Components not duplicated

## Error Handling

All components handle errors gracefully:

```tsx
// ReadyEnclosurePicker
- Loads enclosures and filters active materials
- Shows error alert if load fails
- Retry available by reopening dialog

// CustomEnclosureBuilder
- Validates before save
- Shows validation errors
- Prevents save if errors exist
- Shows API errors in alert

// EnclosureManager
- Catches errors from both paths
- Shows user-friendly messages
- Returns to choice screen on error
```

## Styling

Components use Material-UI (MUI) and follow your app's theme:
- Consistent spacing and colors
- Color-coded by section (Ready: Blue, Custom: Orange)
- Responsive design (mobile-friendly)
- Sticky table headers
- Loading states with spinners
- Live total display

## Testing Checklist

- [ ] Add new custom enclosure (verify snapshot saved)
- [ ] Add ready enclosure (verify as normal panel item)
- [ ] Edit existing custom enclosure (verify components load)
- [ ] Delete enclosure (verify data removed)
- [ ] Change quantities (verify total recalculates)
- [ ] Add/remove components (verify totals update)
- [ ] Validation: Try saving without components
- [ ] Validation: Try with negative prices
- [ ] Search ready enclosures (verify filtering)
- [ ] Cancel without saving (verify discard)
- [ ] Duplicate panel (verify enclosure duplicates)

## Performance Considerations

- Component catalog cached in component state
- Lazy-loaded when dialog opens (not on app init)
- Pagination for material lists (10 items per page default)
- Efficient re-renders via proper React hooks
- No unnecessary API calls

## Future Enhancements

1. **Bulk Import** - Import custom enclosure from CSV
2. **Templates** - Save custom enclosure as template
3. **History** - Track enclosure changes
4. **Favorites** - Mark frequently used components
5. **Print** - Generate enclosure specification sheet
6. **ECN** - Create Engineering Change Notification for updates

## Support & Debugging

### Check the browser console for:
- API call logs with `enclosureService:`
- Hook state updates with `useEnclosure:`
- Component render logs

### Common Issues

**"No enclosures available"**
- Verify materials exist in database with category "Enclosure"

**"At least one component must be selected"**
- User clicked Save with empty component list
- Add at least one component from catalog

**Custom enclosure price not saving**
- Check `isDirty` flag is true before save
- Verify total calculation occurs

**Snapshot not loading on edit**
- Verify panelItemId passed to hook
- Check API returns PanelEnclosure data

---

For more details on implementation, see the attached documentation files.
