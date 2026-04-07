# SmartOffer Frontend - Drag & Drop Implementation

## ?? Overview

This document provides detailed specifications for implementing the drag and drop functionality in the Panel Designer. Users can organize panel items into categories (Incoming, Outgoing, Enclosure, Busbar & Cables) using intuitive drag and drop interactions.

---

## ?? Recommended Libraries

### Primary Recommendation: @dnd-kit
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Alternative: react-beautiful-dnd
```bash
npm install react-beautiful-dnd
npm install --save-dev @types/react-beautiful-dnd
```

---

## ??? Architecture

### State Structure
```typescript
// src/store/panelDesigner.ts

interface DragDropState {
  // Current panel being edited
  activePanelId: number | null;
  
  // Items organized by zone
  zones: {
    unassigned: PanelItem[];
    incoming: PanelItem[];
    outgoing: PanelItem[];
    enclosure: PanelItem[];
    busbarAndCables: PanelItem[];
  };
  
  // Drag state
  activeItem: PanelItem | null;
  overZone: ZoneType | null;
  
  // UI state
  isProcessing: boolean;
}

type ZoneType = 'unassigned' | 'incoming' | 'outgoing' | 'enclosure' | 'busbarAndCables';

// Map zone types to API enum values
const zoneToItemType: Record<ZoneType, PanelItemType | null> = {
  unassigned: null,
  incoming: PanelItemType.Incoming,
  outgoing: PanelItemType.Outgoing,
  enclosure: PanelItemType.Enclosure,
  busbarAndCables: PanelItemType.BusbarAndCables
};
```

---

## ?? Zone Component Implementation

### Zone Container
```typescript
// src/components/panels/ItemTypeZone/ItemTypeZone.tsx

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ItemTypeZoneProps {
  id: ZoneType;
  type: PanelItemType | null;
  title: string;
  description: string;
  color: string;
  items: PanelItem[];
  onItemRemove: (itemId: number) => void;
  onQuantityChange: (itemId: number, quantity: number) => void;
}

export function ItemTypeZone({
  id,
  type,
  title,
  description,
  color,
  items,
  onItemRemove,
  onQuantityChange
}: ItemTypeZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div
      ref={setNodeRef}
      className={`
        zone-container
        ${isOver ? 'zone-over' : ''}
      `}
      style={{ '--zone-color': color } as React.CSSProperties}
    >
      {/* Zone Header */}
      <div className="zone-header">
        <div className="zone-title">
          <ZoneIcon type={type} />
          <span>{title}</span>
        </div>
        <span className="zone-count">{items.length} items</span>
      </div>
      
      {/* Zone Description */}
      <p className="zone-description">{description}</p>
      
      {/* Sortable Items */}
      <SortableContext
        items={items.map(item => item.panelItemId.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="zone-items">
          {items.length === 0 ? (
            <EmptyZone isOver={isOver} />
          ) : (
            items.map(item => (
              <SortableItem
                key={item.panelItemId}
                item={item}
                onRemove={() => onItemRemove(item.panelItemId)}
                onQuantityChange={(qty) => onQuantityChange(item.panelItemId, qty)}
              />
            ))
          )}
        </div>
      </SortableContext>
      
      {/* Drop Indicator */}
      {isOver && <DropIndicator />}
    </div>
  );
}
```

### Zone Styles
```css
/* src/components/panels/ItemTypeZone/ItemTypeZone.css */

.zone-container {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  min-height: 120px;
  transition: all 0.2s ease;
}

.zone-container.zone-over {
  border-color: var(--zone-color);
  background: color-mix(in srgb, var(--zone-color) 5%, white);
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--zone-color);
}

.zone-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--zone-color);
}

.zone-count {
  background: var(--zone-color);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.zone-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.zone-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 60px;
}
```

---

## ?? Draggable Item Component

### Sortable Item
```typescript
// src/components/panels/DraggableItem/SortableItem.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  item: PanelItem;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

export function SortableItem({ item, onRemove, onQuantityChange }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.panelItemId.toString() });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? 'is-dragging' : ''}`}
    >
      {/* Drag Handle */}
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripVerticalIcon />
      </div>
      
      {/* Item Content */}
      <div className="item-content">
        <div className="item-main">
          <span className="item-code">{item.itemCode}</span>
          <span className="item-description">{item.description}</span>
        </div>
        <div className="item-details">
          <span className="item-brand">{item.brand}</span>
        </div>
      </div>
      
      {/* Quantity Control */}
      <div className="quantity-control">
        <button 
          onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
          disabled={item.quantity <= 1}
        >
          <MinusIcon />
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          min="1"
        />
        <button onClick={() => onQuantityChange(item.quantity + 1)}>
          <PlusIcon />
        </button>
      </div>
      
      {/* Price */}
      <div className="item-price">
        ${(item.totalPrice).toFixed(2)}
      </div>
      
      {/* Remove Button */}
      <button className="remove-btn" onClick={onRemove}>
        <XIcon />
      </button>
    </div>
  );
}
```

### Draggable Item Styles
```css
/* src/components/panels/DraggableItem/DraggableItem.css */

.draggable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.draggable-item:hover {
  border-color: #bdbdbd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.draggable-item.is-dragging {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.drag-handle {
  cursor: grab;
  color: #9e9e9e;
  padding: 4px;
  display: flex;
  align-items: center;
}

.drag-handle:active {
  cursor: grabbing;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-code {
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-color);
  white-space: nowrap;
}

.item-description {
  font-size: 13px;
  color: #424242;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-details {
  font-size: 11px;
  color: #757575;
  margin-top: 2px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 2px;
}

.quantity-control button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #616161;
  border-radius: 2px;
}

.quantity-control button:hover:not(:disabled) {
  background: #e0e0e0;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control input {
  width: 40px;
  text-align: center;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
}

.item-price {
  font-weight: 600;
  font-size: 13px;
  color: #424242;
  min-width: 70px;
  text-align: right;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #9e9e9e;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #ffebee;
  color: #f44336;
}
```

---

## ?? Main DnD Context

### Panel Designer DnD Setup
```typescript
// src/pages/PanelDesigner/PanelDesignerDnD.tsx

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function PanelDesignerDnD({ panelId }: { panelId: number }) {
  const [zones, setZones] = useState<DragDropState['zones']>({
    unassigned: [],
    incoming: [],
    outgoing: [],
    enclosure: [],
    busbarAndCables: []
  });
  const [activeItem, setActiveItem] = useState<PanelItem | null>(null);
  
  const { mutate: updateItemType } = useUpdatePanelItemType();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Load panel items and organize by type
  useEffect(() => {
    async function loadItems() {
      const items = await panelItemService.getByPanel(panelId);
      
      const organized: DragDropState['zones'] = {
        unassigned: [],
        incoming: [],
        outgoing: [],
        enclosure: [],
        busbarAndCables: []
      };
      
      items.forEach(item => {
        switch (item.itemType) {
          case PanelItemType.Incoming:
            organized.incoming.push(item);
            break;
          case PanelItemType.Outgoing:
            organized.outgoing.push(item);
            break;
          case PanelItemType.Enclosure:
            organized.enclosure.push(item);
            break;
          case PanelItemType.BusbarAndCables:
            organized.busbarAndCables.push(item);
            break;
          default:
            organized.unassigned.push(item);
        }
      });
      
      setZones(organized);
    }
    
    loadItems();
  }, [panelId]);
  
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const itemId = parseInt(active.id as string);
    
    // Find the item in any zone
    for (const zone of Object.values(zones)) {
      const item = zone.find(i => i.panelItemId === itemId);
      if (item) {
        setActiveItem(item);
        break;
      }
    }
  }
  
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find source and destination zones
    const sourceZone = findZoneContainingItem(activeId);
    const destZone = isZoneId(overId) ? overId : findZoneContainingItem(overId);
    
    if (!sourceZone || !destZone || sourceZone === destZone) return;
    
    // Move item between zones optimistically
    setZones(prev => {
      const item = prev[sourceZone].find(
        i => i.panelItemId.toString() === activeId
      );
      
      if (!item) return prev;
      
      return {
        ...prev,
        [sourceZone]: prev[sourceZone].filter(
          i => i.panelItemId.toString() !== activeId
        ),
        [destZone]: [...prev[destZone], item]
      };
    });
  }
  
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    setActiveItem(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const destZone = isZoneId(overId) ? overId : findZoneContainingItem(overId);
    
    if (!destZone) return;
    
    // Update item type in the backend
    const newType = zoneToItemType[destZone as ZoneType];
    
    if (newType !== null) {
      try {
        await updateItemType({
          id: parseInt(activeId),
          type: newType
        });
      } catch (error) {
        // Revert on error
        console.error('Failed to update item type:', error);
        // TODO: Show error toast and revert state
      }
    }
  }
  
  function findZoneContainingItem(itemId: string): ZoneType | null {
    for (const [zoneName, items] of Object.entries(zones)) {
      if (items.some(i => i.panelItemId.toString() === itemId)) {
        return zoneName as ZoneType;
      }
    }
    return null;
  }
  
  function isZoneId(id: string): boolean {
    return ['unassigned', 'incoming', 'outgoing', 'enclosure', 'busbarAndCables'].includes(id);
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="panel-items-container">
        <ItemTypeZone
          id="incoming"
          type={PanelItemType.Incoming}
          title="Incoming"
          description="Main supply, switches, incoming components"
          color="#4CAF50"
          items={zones.incoming}
          onItemRemove={handleItemRemove}
          onQuantityChange={handleQuantityChange}
        />
        
        <ItemTypeZone
          id="outgoing"
          type={PanelItemType.Outgoing}
          title="Outgoing"
          description="Circuit breakers, contactors, outgoing components"
          color="#2196F3"
          items={zones.outgoing}
          onItemRemove={handleItemRemove}
          onQuantityChange={handleQuantityChange}
        />
        
        <ItemTypeZone
          id="enclosure"
          type={PanelItemType.Enclosure}
          title="Enclosure"
          description="Panel enclosure and mounting components"
          color="#FF9800"
          items={zones.enclosure}
          onItemRemove={handleItemRemove}
          onQuantityChange={handleQuantityChange}
        />
        
        <ItemTypeZone
          id="busbarAndCables"
          type={PanelItemType.BusbarAndCables}
          title="Busbar & Cables"
          description="Busbars, connections, cables and wiring"
          color="#9C27B0"
          items={zones.busbarAndCables}
          onItemRemove={handleItemRemove}
          onQuantityChange={handleQuantityChange}
        />
        
        <ItemTypeZone
          id="unassigned"
          type={null}
          title="Unassigned"
          description="Drag items to appropriate categories above"
          color="#9E9E9E"
          items={zones.unassigned}
          onItemRemove={handleItemRemove}
          onQuantityChange={handleQuantityChange}
        />
      </div>
      
      {/* Drag Overlay - Shows item being dragged */}
      <DragOverlay>
        {activeItem && (
          <DragOverlayItem item={activeItem} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
```

---

## ?? Drag Overlay Component

```typescript
// src/components/panels/DragOverlayItem/DragOverlayItem.tsx

interface DragOverlayItemProps {
  item: PanelItem;
}

export function DragOverlayItem({ item }: DragOverlayItemProps) {
  return (
    <div className="drag-overlay-item">
      <div className="overlay-content">
        <span className="item-code">{item.itemCode}</span>
        <span className="item-description">{item.description}</span>
      </div>
      <div className="overlay-quantity">
        Qty: {item.quantity}
      </div>
    </div>
  );
}
```

```css
/* src/components/panels/DragOverlayItem/DragOverlayItem.css */

.drag-overlay-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  transform: rotate(3deg);
  cursor: grabbing;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overlay-content .item-code {
  font-weight: 600;
  color: var(--primary-color);
}

.overlay-content .item-description {
  font-size: 13px;
  color: #616161;
}

.overlay-quantity {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}
```

---

## ?? Adding Items from Material Catalog

### Add to Panel Flow
```typescript
// When user clicks "+" on a material card
async function handleAddMaterialToPanel(material: Material) {
  // 1. Create panel item in backend (defaults to Outgoing)
  const newItem = await panelItemService.create({
    panelId: activePanelId,
    materialId: material.materialId,
    quantity: 1,
    itemType: PanelItemType.Outgoing // Default to Outgoing
  });
  
  // 2. Add to unassigned zone for user to categorize
  // OR add directly to outgoing zone
  setZones(prev => ({
    ...prev,
    unassigned: [...prev.unassigned, newItem]
    // OR: outgoing: [...prev.outgoing, newItem]
  }));
  
  // 3. Show success toast
  toast.success(`Added ${material.itemCode} to panel`);
}
```

### Quick Add with Type Selection
```typescript
// Alternative: Modal to select type immediately
function AddMaterialModal({ material, onAdd, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [itemType, setItemType] = useState<PanelItemType>(PanelItemType.Outgoing);
  
  return (
    <Modal title="Add Material" onClose={onClose}>
      <div className="material-info">
        <strong>{material.itemCode}</strong>
        <span>{material.description}</span>
      </div>
      
      <div className="form-group">
        <label>Quantity</label>
        <QuantityInput value={quantity} onChange={setQuantity} />
      </div>
      
      <div className="form-group">
        <label>Category</label>
        <div className="type-buttons">
          {Object.values(PanelItemType).map(type => (
            <button
              key={type}
              className={itemType === type ? 'active' : ''}
              onClick={() => setItemType(type)}
              style={{ borderColor: PanelItemTypeColors[type] }}
            >
              {PanelItemTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="modal-actions">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onAdd(quantity, itemType)}>
          Add to Panel
        </Button>
      </div>
    </Modal>
  );
}
```

---

## ?? Keyboard Accessibility

```typescript
// Keyboard navigation support
const keyboardConfig = {
  // Arrow keys to navigate between items
  ArrowUp: 'moveFocusPrevious',
  ArrowDown: 'moveFocusNext',
  
  // Enter/Space to pick up item
  Enter: 'pickUp',
  Space: 'pickUp',
  
  // Arrow keys while dragging to move between zones
  ArrowLeft: 'moveToZoneLeft',
  ArrowRight: 'moveToZoneRight',
  
  // Escape to cancel drag
  Escape: 'cancel',
  
  // Delete to remove item
  Delete: 'removeItem',
  Backspace: 'removeItem'
};
```

---

## ?? Touch Support

```typescript
// Touch-specific sensor configuration
const touchSensor = useSensor(TouchSensor, {
  activationConstraint: {
    delay: 200, // 200ms hold before drag
    tolerance: 5 // 5px movement tolerance
  }
});

const sensors = useSensors(
  useSensor(PointerSensor),
  touchSensor,
  useSensor(KeyboardSensor)
);
```

---

## ? Testing Checklist

- [ ] Items can be dragged between all zones
- [ ] Items can be reordered within a zone
- [ ] Drag overlay shows correct item info
- [ ] Drop zones highlight on hover
- [ ] API updates are persisted
- [ ] Error states are handled gracefully
- [ ] Keyboard navigation works
- [ ] Touch devices work correctly
- [ ] Empty state shows when zone has no items
- [ ] Quantity can be adjusted without affecting drag
- [ ] Remove button works correctly

---

**Next**: See `07-OFFER-GENERATION.md` for commercial and technical offer generation.
