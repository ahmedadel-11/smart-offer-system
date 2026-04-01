# SmartOffer Frontend - Data Models

## ?? TypeScript Interfaces

This document defines all TypeScript interfaces that mirror the backend API responses and request payloads.

---

## ?? Enums

### PanelItemType
```typescript
export enum PanelItemType {
  Incoming = 1,
  Outgoing = 2,
  Enclosure = 3,
  BusbarAndCables = 4
}

export const PanelItemTypeLabels: Record<PanelItemType, string> = {
  [PanelItemType.Incoming]: 'Incoming',
  [PanelItemType.Outgoing]: 'Outgoing',
  [PanelItemType.Enclosure]: 'Enclosure',
  [PanelItemType.BusbarAndCables]: 'Busbar & Cables'
};

export const PanelItemTypeDescriptions: Record<PanelItemType, string> = {
  [PanelItemType.Incoming]: 'Main supply, switches, incoming components',
  [PanelItemType.Outgoing]: 'Circuit breakers, contactors, outgoing components',
  [PanelItemType.Enclosure]: 'Panel enclosure and mounting components',
  [PanelItemType.BusbarAndCables]: 'Busbars, connections, cables and wiring'
};

export const PanelItemTypeColors: Record<PanelItemType, string> = {
  [PanelItemType.Incoming]: '#4CAF50',      // Green
  [PanelItemType.Outgoing]: '#2196F3',      // Blue
  [PanelItemType.Enclosure]: '#FF9800',     // Orange
  [PanelItemType.BusbarAndCables]: '#9C27B0' // Purple
};
```

### ProjectStatus
```typescript
export enum ProjectStatus {
  Draft = 'Draft',
  InProgress = 'InProgress',
  Review = 'Review',
  Approved = 'Approved',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.Draft]: 'Draft',
  [ProjectStatus.InProgress]: 'In Progress',
  [ProjectStatus.Review]: 'Under Review',
  [ProjectStatus.Approved]: 'Approved',
  [ProjectStatus.Completed]: 'Completed',
  [ProjectStatus.Cancelled]: 'Cancelled'
};

export const ProjectStatusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.Draft]: '#9E9E9E',
  [ProjectStatus.InProgress]: '#2196F3',
  [ProjectStatus.Review]: '#FF9800',
  [ProjectStatus.Approved]: '#4CAF50',
  [ProjectStatus.Completed]: '#8BC34A',
  [ProjectStatus.Cancelled]: '#F44336'
};
```

---

## ?? Material Interfaces

### Material (Response)
```typescript
export interface Material {
  materialId: number;
  itemCode: string;
  description: string;
  ratedCurrent: string | null;
  isc: string | null;
  noOfPoles: number | null;
  brand: string | null;
  reference: string | null;
  basePrice: number;
  defaultDiscount: number;
  category: string;
  isActive: boolean;
}
```

### CreateMaterial (Request)
```typescript
export interface CreateMaterial {
  itemCode: string;
  description: string;
  ratedCurrent?: string;
  isc?: string;
  noOfPoles?: number;
  brand?: string;
  reference?: string;
  basePrice: number;
  defaultDiscount: number;
  category: string;
}
```

### UpdateMaterial (Request)
```typescript
export interface UpdateMaterial {
  itemCode: string;
  description: string;
  ratedCurrent?: string;
  isc?: string;
  noOfPoles?: number;
  brand?: string;
  reference?: string;
  basePrice: number;
  defaultDiscount: number;
  category: string;
  isActive: boolean;
}
```

### MaterialSearchFilters
```typescript
export interface MaterialSearchFilters {
  searchTerm?: string;
  category?: string;
  brand?: string;
  description?: string;
  ratedCurrent?: string;
  isc?: string;
  reference?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}
```

---

## ?? Project Interfaces

### Project (Response)
```typescript
export interface Project {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  createdDate: string; // ISO date string
  updatedDate: string | null;
  status: ProjectStatus;
  notes: string | null;
}
```

### ProjectDetail (Response with Panels)
```typescript
export interface ProjectDetail extends Project {
  panels: PanelDetail[];
  totalPanels: number;
  totalItems: number;
  totalCost: number;
  totalPrice: number;
}
```

### ProjectSummary (Response)
```typescript
export interface ProjectSummary {
  projectId: number;
  projectName: string;
  customer: string;
  panelCount: number;
  totalMaterialCost: number;
  totalWithMargin: number;
  averageMargin: number;
  currency: string;
}
```

### CreateProject (Request)
```typescript
export interface CreateProject {
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  status?: ProjectStatus;
  notes?: string;
  numberOfPanels?: number; // For auto-creating panels
  teamMembers?: string[]; // Team member names/IDs
}
```

### UpdateProject (Request)
```typescript
export interface UpdateProject {
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  status: ProjectStatus;
  notes?: string;
}
```

---

## ?? Panel Interfaces

### Panel (Response)
```typescript
export interface Panel {
  panelId: number;
  panelName: string;
  description: string | null;
  projectId: number;
  overrideMargin: number | null;
  createdAt: string;
  updatedAt: string | null;
}
```

### PanelDetail (Response with Items)
```typescript
export interface PanelDetail extends Panel {
  items: PanelItem[];
  itemsByType: {
    incoming: PanelItem[];
    outgoing: PanelItem[];
    enclosure: PanelItem[];
    busbarAndCables: PanelItem[];
  };
  summary: PanelSummary;
}
```

### PanelSummary
```typescript
export interface PanelSummary {
  panelId: number;
  panelName: string;
  totalItems: number;
  totalQuantity: number;
  totalCost: number;
  totalPrice: number;
  margin: number;
}
```

### CreatePanel (Request)
```typescript
export interface CreatePanel {
  panelName: string;
  projectId: number;
  description?: string;
  overrideMargin?: number;
}
```

### UpdatePanel (Request)
```typescript
export interface UpdatePanel {
  panelName: string;
  description?: string;
  overrideMargin?: number;
}
```

---

## ?? Panel Item Interfaces

### PanelItem (Response)
```typescript
export interface PanelItem {
  panelItemId: number;
  panelId: number;
  materialId: number;
  itemCode: string;
  description: string;
  brand: string | null;
  quantity: number;
  itemType: PanelItemType;
  basePrice: number;
  discount: number;
  extraDiscount: number | null;
  unitCost: number;
  totalCost: number;
  margin: number;
  totalPrice: number;
  notes: string | null;
}
```

### CreatePanelItem (Request)
```typescript
export interface CreatePanelItem {
  panelId: number;
  materialId: number;
  quantity: number;
  itemType: PanelItemType;
  overrideDiscount?: number;
  overrideMargin?: number;
  extraDiscount?: number;
  notes?: string;
}
```

### UpdatePanelItem (Request)
```typescript
export interface UpdatePanelItem {
  quantity: number;
  itemType: PanelItemType;
  overrideDiscount?: number;
  overrideMargin?: number;
  extraDiscount?: number;
  notes?: string;
}
```

---

## ?? Import Interfaces

### ImportResult (Response)
```typescript
export interface ImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  message: string;
}
```

---

## ?? Customer & Team Interfaces

### Customer
```typescript
export interface Customer {
  customerId: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  country: string;
}
```

### TeamMember
```typescript
export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'Manager' | 'Engineer' | 'Sales' | 'Viewer';
  avatar?: string;
}
```

---

## ?? Offer Interfaces

### CommercialOffer
```typescript
export interface CommercialOffer {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  createdDate: string;
  validUntil: string;
  panels: CommercialOfferPanel[];
  subtotal: number;
  discount: number;
  total: number;
  terms: string[];
  notes: string;
}

export interface CommercialOfferPanel {
  panelName: string;
  description: string;
  itemCount: number;
  totalPrice: number;
}
```

### TechnicalOffer
```typescript
export interface TechnicalOffer {
  projectId: number;
  projectName: string;
  customer: string;
  createdDate: string;
  panels: TechnicalOfferPanel[];
  specifications: ProjectSpecifications;
}

export interface TechnicalOfferPanel {
  panelName: string;
  description: string;
  incoming: TechnicalOfferItem[];
  outgoing: TechnicalOfferItem[];
  enclosure: TechnicalOfferItem[];
  busbarAndCables: TechnicalOfferItem[];
}

export interface TechnicalOfferItem {
  itemCode: string;
  description: string;
  brand: string;
  reference: string;
  ratedCurrent: string;
  isc: string;
  noOfPoles: number;
  quantity: number;
}

export interface ProjectSpecifications {
  voltage: string;
  frequency: string;
  protection: string;
  enclosureRating: string;
  standards: string[];
}
```

---

## ?? Drag & Drop Interfaces

### DragItem
```typescript
export interface DragItem {
  id: string; // panelItemId as string
  panelItemId: number;
  materialId: number;
  itemCode: string;
  description: string;
  quantity: number;
  currentType: PanelItemType | null; // null = unassigned
}
```

### DropZone
```typescript
export interface DropZone {
  id: string;
  type: PanelItemType;
  label: string;
  description: string;
  color: string;
  items: DragItem[];
}
```

### DragDropState
```typescript
export interface DragDropState {
  unassigned: DragItem[];
  zones: Record<PanelItemType, DragItem[]>;
  isDragging: boolean;
  activeId: string | null;
}
```

---

## ?? UI State Interfaces

### LoadingState
```typescript
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}
```

### ErrorState
```typescript
export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
}
```

### PaginationState
```typescript
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

### TableState<T>
```typescript
export interface TableState<T> {
  data: T[];
  loading: LoadingState;
  error: ErrorState;
  pagination: PaginationState;
  sorting: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
  filters: Partial<T>;
}
```

---

## ??? Utility Types

### ApiResponse
```typescript
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}
```

### SelectOption
```typescript
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
}
```

### TabConfig
```typescript
export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}
```

---

**Next**: See `03-API-INTEGRATION.md` for API service implementations.
