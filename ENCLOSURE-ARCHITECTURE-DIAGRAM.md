# Enclosure Feature - Architecture & Visual Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Your App.tsx                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │           <EnclosureProvider>                                 ││
│  │  (Manages modal state + global context)                       ││
│  │                                                                ││
│  │  ┌──────────────────────────────────────────────────────────┐││
│  │  │  Your existing components                                │││
│  │  │  - PanelDesigner                                         │││
│  │  │  - Dashboard                                             │││
│  │  │  - etc.                                                  │││
│  │  │                                                          │││
│  │  │  [Add Enclosure Button]                                 │││
│  │  │         ↓                                                │││
│  │  │  useEnclosureManager.openEnclosureManager(panelId)      │││
│  │  │                                                          │││
│  │  └──────────────────────────────────────────────────────────┘││
│  │                                                                ││
│  │  ♦ EnclosureManager (invisible, shows when needed)            ││
│  │     ├─ Step 1: EnclosureChoice Modal                          ││
│  │     │  [Ready Enclosure] [Custom Enclosure]                   ││
│  │     │                                                          ││
│  │     ├─ Step 2A: ReadyEnclosurePicker                          ││
│  │     │  (Material selection dialog)                            ││
│  │     │                                                          ││
│  │     └─ Step 2B: CustomEnclosureBuilder                        ││
│  │        (Component composition + save)                         ││
│  │                                                                ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
READY ENCLOSURE PATH
═══════════════════════════════════════════

User clicks "Add Enclosure"
         ↓
EnclosureChoice modal appears
         ↓
User selects "Ready Enclosure"
         ↓
ReadyEnclosurePicker opens
    ┌────────────────────────────┐
    │ - Fetch /api/materials/... │
    │ - Filter by category       │
    │ - Show list (paginated)    │
    └────────────────────────────┘
         ↓
User searches & selects material
         ↓
    ┌────────────────────────────┐
    │ POST /api/panelitems       │
    │ {                          │
    │   panelId: 123,            │
    │   materialId: 456,         │
    │   quantity: 1,             │
    │   itemType: 3              │
    │ }                          │
    └────────────────────────────┘
         ↓
Panel item created ✓
Enclosure visible in panel


CUSTOM ENCLOSURE PATH
═══════════════════════════════════════════

User clicks "Add Enclosure"
         ↓
EnclosureChoice modal appears
         ↓
User selects "Custom Enclosure"
         ↓
CustomEnclosureBuilder opens
    ┌────────────────────────────────────┐
    │ useEnclosure hook initializes       │
    │ - Fetch /api/enclosurecomponents   │
    │ - Initialize empty state            │
    │ - Ready for user input              │
    └────────────────────────────────────┘
         ↓
Left Catalog | Right Selected Components
Component added: [+] button clicked
         ↓
State updates: isDirty = true, totalPrice recalculated
         ↓
User edits qty & notes in table
         ↓
Each change: isDirty = true, total recalculated
         ↓
User clicks "Save Enclosure"
         ↓
    ┌──────────────────────────────────────┐
    │ Validation checks                    │
    │ ✓ At least 1 component              │
    │ ✓ All qty > 0                       │
    │ ✓ All prices ≥ 0                    │
    │ ✓ All descriptions filled           │
    └──────────────────────────────────────┘
         ↓
    ┌──────────────────────────────────────┐
    │ POST /api/enclosures                 │
    │ {                                    │
    │   panelId: 123,                      │
    │   panelItemId: null,                 │
    │   components: [                      │
    │     {                                │
    │       enclosureComponentId: 1,       │
    │       description: "...",            │
    │       qty: 2,                        │
    │       totalPriceList: 100,           │
    │       notesName: "..."               │
    │     },                               │
    │     {...more components...}          │
    │   ]                                  │
    │ }                                    │
    └──────────────────────────────────────┘
         ↓
Backend creates:
  ✓ PanelItem (SYS-CUSTOM-ENCLOSURE)
  ✓ PanelEnclosure (snapshot header)
  ✓ PanelEnclosureComponent rows (1 per component)
         ↓
Modal closes, panel refreshes ✓
Enclosure visible with total price
```

---

## Component Hierarchy Tree

```
EnclosureProvider
│
├─ useEnclosureManager() [Custom Hook]
│  │
│  ├─ openEnclosureManager(panelId, panelItemId?)
│  │  └─ Sets modal open state
│  │
│  └─ Returns context functions
│
└─ EnclosureManager [Orchestrator]
   │
   ├─ EnclosureChoice [Step 1 - Decision]
   │  ├─ Props: open, onClose, onSelectMode
   │  │
   │  ├─ Ready Card
   │  │ └─ onClick: setMode('ready')
   │  │
   │  └─ Custom Card
   │     └─ onClick: setMode('custom')
   │
   ├─ ReadyEnclosurePicker [Step 2A - Material Selection]
   │  ├─ Props: open, onClose, onSelectEnclosure
   │  │
   │  ├─ useEffect: loadEnclosures()
   │  │  └─ enclosureService.getMaterialsByCategory()
   │  │
   │  ├─ Search / Filter
   │  │ └─ Updates filteredMaterials
   │  │
   │  ├─ Material Table
   │  │ ├─ Pagination
   │  │ └─ Radio selection
   │  │
   │  └─ Add Button
   │     └─ onClick: panelItemService.createPanelItem()
   │
   └─ CustomEnclosureBuilder [Step 2B - Component Composition]
      ├─ Props: open, onClose, onSaveEnclosure, panelId, panelItemId
      │
      ├─ useEnclosure(panelId, panelItemId) [State Hook]
      │  │
      │  ├─ useEffect: loadComponents()
      │  │  └─ enclosureService.getComponents()
      │  │
      │  ├─ useEffect: if panelItemId, loadExistingEnclosure()
      │  │  └─ enclosureService.getEnclosureSnapshot()
      │  │
      │  ├─ State:
      │  │  ├─ state (CustomEnclosureState)
      │  │  ├─ components (catalog)
      │  │  ├─ isLoading, error
      │  │
      │  └─ Functions:
      │     ├─ loadComponents()
      │     ├─ addComponent()
      │     ├─ removeComponent()
      │     ├─ updateComponentQty()
      │     ├─ updateComponentNotes()
      │     ├─ validateEnclosure()
      │     ├─ saveEnclosure()
      │     │  └─ POST /api/enclosures
      │     │  └─ POST /api/enclosures/{panelItemId}
      │     └─ discardChanges()
      │
      ├─ Left Panel: Catalog
      │  └─ component.map() -> [+] Add button
      │
      ├─ Right Panel: Selected Components
      │  ├─ Table (component.map())
      │  │ ├─ Description
      │  │ ├─ Qty (editable TextField)
      │  │ ├─ Notes (editable TextField)
      │  │ ├─ Unit Price
      │  │ ├─ Total Price
      │  │ └─ Delete button
      │  │
      │  └─ Total Summary Box
      │     └─ Sticky footer with running total
      │
      └─ Buttons
         ├─ Cancel
         └─ Save/Update
```

---

## State Management Flow

```
COMPONENT INITIALIZATION
════════════════════════
App renders
  ↓
EnclosureProvider renders
  ↓
managerOpen = false
managerPanelId = null
managerExistingEnclosureId = undefined
  ↓
useEnclosureManager hook available
  ↓


USER ACTION: Click "Add Enclosure"
═══════════════════════════════════
openEnclosureManager(panelId, panelItemId?)
  ↓
setManagerOpen(true)
setManagerPanelId(panelId)
setManagerExistingEnclosureId(panelItemId)
  ↓
EnclosureManager renders
  ↓
EnclosureChoice modal shows (Step 1)
  ↓


USER ACTION: Select "Custom"
════════════════════════════
onSelectMode('custom')
  ↓
CustomEnclosureBuilder opens
  ↓
useEnclosure hook initializes:
  state = {
    panelId: 123,
    panelItemId: undefined or 456,
    components: [],
    totalPrice: 0,
    isDirty: false
  }
  ↓
useEffect triggers:
  loadComponents()
    ↓
    GET /api/enclosurecomponents
      ↓
    setComponents([...catalog])
  ↓
If panelItemId exists:
  loadExistingEnclosure(panelItemId)
    ↓
    GET /api/enclosures/{panelItemId}
      ↓
    setState({...snapshot data, isDirty: false})
  ↓


USER ACTION: Add Component
═════════════════════════════
addComponent(catalogComponent)
  ↓
setState(prev => ({
  ...prev,
  components: [
    ...prev.components,
    {
      ...catalogComponent,
      panelEnclosureComponentId: 0,
      qty: 1,
      notesName: ''
    }
  ],
  isDirty: true
}))
  ↓
useEffect dependency on state.components:
  calculateTotal()
    ↓
    sum all component.totalPriceList
      ↓
    setState({...prev, totalPrice: sum})
  ↓


USER ACTION: Edit Quantity
═════════════════════════════
updateComponentQty(index, 5)
  ↓
setState(prev => ({
  components: [
    ...prev.components.slice(0, index),
    {...prev.components[index], qty: 5},
    ...prev.components.slice(index + 1)
  ],
  isDirty: true
}))
  ↓
useEffect triggers:
  calculateTotal()
    ↓
    setState({...prev, totalPrice: newTotal})
  ↓


USER ACTION: Save Enclosure
═══════════════════════════════
validateEnclosure()
  ↓
Check:
  ✓ state.components.length > 0
  ✓ All descriptions filled
  ✓ All qty > 0
  ✓ All prices ≥ 0
  ↓
If panelItemId exists:
  POST /api/enclosures/{panelItemId}
    {isCustom: true, components: [...]}
Else:
  POST /api/enclosures
    {panelId, components: [...]}
  ↓
setState({
  panelItemId: newId (if new),
  isDirty: false,
  totalPrice: calculated
})
  ↓
onEnclosureAdded() callback
  ↓
handleClose()
  ↓
<EnclosureManager> hidden
userAction = null
panels refresh (optional)
```

---

## API Endpoint Usage Map

```
SERVICE METHOD              API ENDPOINT
═════════════════════════════════════════════════════════════
getComponents()             GET /api/enclosurecomponents

getComponent(id)            GET /api/enclosurecomponents/{id}

createComponent(data)       POST /api/enclosurecomponents

updateComponent(id, data)   PUT /api/enclosurecomponents/{id}

deleteComponent(id)         DELETE /api/enclosurecomponents/{id}

getEnclosureSnapshot(id)    GET /api/enclosures/{panelItemId}

createCustomEnclosure(req)  POST /api/enclosures
                            Request:
                            {
                              panelId: number,
                              components: [...]
                            }

updateCustomEnclosure(id)   POST /api/enclosures/{panelItemId}
                            Request:
                            {
                              isCustom: true,
                              components: [...]
                            }

deleteCustomEnclosure(id)   DELETE /api/enclosures/{panelItemId}

                            (via materialService)
getByCategory(cat)          GET /api/materials/category/{category}

                            (via panelItemService)
createPanelItem(req)        POST /api/panelitems
                            Request: {panelId, materialId, qty...}
```

---

## File Import Dependencies

```
main.tsx
  └─ App.tsx
      └─ <EnclosureProvider> from ./components/enclosures
          └─ ./EnclosureProvider.tsx
              ├─ ./EnclosureManager.tsx
              │   ├─ ./EnclosureChoice.tsx
              │   ├─ ./ReadyEnclosurePicker.tsx
              │   │   └─ materialService from ./services
              │   └─ ./CustomEnclosureBuilder.tsx
              │       ├─ useEnclosure from ./hooks
              │       │   └─ enclosureService from ./services
              │       └─ Types from ./types
              └─ Types from ./types


Your Component (Panel Designer)
  ├─ useEnclosureManager from ./components/enclosures
  │   └─ calls openEnclosureManager(panelId)
  │
  └─ When modal shows:
      └─ EnclosureManager orchestrates the workflow
          └─ Uses enclosureService + useEnclosure hook
              └─ API calls via apiClient (axios)
```

---

## Data Model Diagram

```
READY ENCLOSURE
═══════════════════════════════════════════

Panel
  └─ PanelItem (itemType = 3)
     {
       panelItemId: 123,
       panelId: 1,
       materialId: 456,           ← Standard material
       description: "Enclosure A",
       basePrice: 1000,
       totalPrice: 1000,
       notes: null
     }


CUSTOM ENCLOSURE
═══════════════════════════════════════════

Panel
  └─ PanelItem (itemType = 3)
     {
       panelItemId: 456,
       panelId: 1,
       materialId: null,          ← Could be SYS-CUSTOM-ENCLOSURE
       description: "Custom Enclosure",
       quantity: 1,
       totalPrice: 550,           ← Calculated from components
       notes: null
     }
     
     └─ PanelEnclosure (in separate table)
        {
          panelEnclosureId: 789,
          panelItemId: 456,
          isCustom: true,
          totalPrice: 550,
          
          └─ PanelEnclosureComponent[] (multiple rows)
             [
               {
                 panelEnclosureComponentId: 1,
                 panelEnclosureId: 789,
                 reference: "ENC-001",
                 description: "Plate",
                 qty: 1,
                 totalPriceList: 100,
                 notesName: "Side"
               },
               {
                 panelEnclosureComponentId: 2,
                 panelEnclosureId: 789,
                 reference: "ENC-002",
                 description: "Wire",
                 qty: 2,
                 totalPriceList: 225,
                 notesName: "Connections"
               },
               // more components...
             ]
        }
```

---

## Error Handling Flow

```
User Action (e.g., Save)
  ↓
Try {
  ├─ Validate data
  │  └─ If invalid: throw validation error
  │
  ├─ API call (async)
  │  └─ If network error: catch in catch block
  │
  ├─ If 404: "Resource not found"
  ├─ If 400: "Invalid request data"
  ├─ If 500: "Server error"
  │
  └─ Success: update state, close modal
}
Catch {
  ├─ setError(message)
  ├─ Log to console
  ├─ Show alert/toast to user
  ├─ Allow retry (modal stays open)
  └─ Disable buttons during retry
}
```

---

## Workflow Decision Tree

```
                    User clicks button
                            ↓
                  ┌─────────────────────┐
                  │ EnclosureChoice     │
                  │ [Ready] [Custom]    │
                  └─────────┬───────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
            ┌──────────────┐  ┌──────────────┐
            │Ready Mode    │  │Custom Mode   │
            └──────┬───────┘  └──────┬───────┘
                   ↓                 ↓
            ┌──────────────┐  ┌──────────────────┐
            │Search        │  │Load components   │
            │Material lib  │  │Show catalog      │
            └──────┬───────┘  └──────┬───────────┘
                   ↓                 ↓
            ┌──────────────┐  ┌──────────────────┐
            │Select        │  │Select + Edit     │
            │Material      │  │Components        │
            └──────┬───────┘  └──────┬───────────┘
                   ↓                 ↓
            ┌──────────────┐  ┌──────────────────┐
            │Add to panel  │  │Validate & Save   │
            │(direct)      │  │(with snapshot)   │
            └──────┬───────┘  └──────┬───────────┘
                   ↓                 ↓
                   └─────────┬───────┘
                            ↓
                  Panel Item Created
                            ↓
                  Panel Refreshes
                            ↓
                  Done ✓
```

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ One-way data flow
- ✅ No global state pollution
- ✅ Easy to test
- ✅ Easy to extend

