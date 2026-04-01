# SmartOffer Frontend - AI Agent Prompts

This document contains ready-to-use prompts for the frontend AI agent to build the SmartOffer application step by step.

---

## ?? Project Setup Prompts

### Prompt 1: Initialize Project
```
Create a new React TypeScript project for SmartOffer - an electrical panel quotation management system.

Requirements:
- Use Vite as the build tool
- Set up TypeScript with strict mode
- Install and configure:
  - React Router v6 for routing
  - TanStack Query (React Query) for server state
  - Zustand for global UI state
  - Axios for HTTP requests
  - @dnd-kit/core and @dnd-kit/sortable for drag and drop
  - Material-UI (MUI) v5 for UI components
  - React Hook Form with Zod for forms
  - jsPDF and jspdf-autotable for PDF generation
  - xlsx (SheetJS) for Excel export

Create the folder structure:
src/
??? components/
??? pages/
??? hooks/
??? services/
??? store/
??? types/
??? utils/
??? assets/

Set up environment variables for API base URL.
```

### Prompt 2: Configure API Client
```
Create an Axios API client configuration for SmartOffer.

Requirements:
- Base URL from environment variable: VITE_API_BASE_URL
- Default timeout: 30 seconds
- JSON content type header
- Request interceptor to add auth token from localStorage
- Response interceptor to handle 401 errors (redirect to login)
- Export the configured axios instance as 'apiClient'

Create in: src/services/api.ts
```

---

## ?? Type Definitions Prompts

### Prompt 3: Create TypeScript Types
```
Create TypeScript interfaces for SmartOffer based on these backend entities:

1. Material:
   - materialId: number
   - itemCode: string
   - description: string
   - ratedCurrent: string | null
   - isc: string | null
   - noOfPoles: number | null
   - brand: string | null
   - reference: string | null
   - basePrice: number
   - defaultDiscount: number
   - category: string
   - isActive: boolean

2. Project:
   - projectId: number
   - projectName: string
   - customer: string
   - currency: string
   - defaultMargin: number
   - createdDate: string
   - updatedDate: string | null
   - status: 'Draft' | 'InProgress' | 'Review' | 'Approved' | 'Completed' | 'Cancelled'
   - notes: string | null

3. Panel:
   - panelId: number
   - panelName: string
   - description: string | null
   - projectId: number
   - overrideMargin: number | null
   - createdAt: string
   - updatedAt: string | null

4. PanelItem:
   - panelItemId: number
   - panelId: number
   - materialId: number
   - itemCode: string
   - description: string
   - brand: string | null
   - quantity: number
   - itemType: PanelItemType (enum: Incoming=1, Outgoing=2, Enclosure=3, BusbarAndCables=4)
   - basePrice: number
   - discount: number
   - extraDiscount: number | null
   - unitCost: number
   - totalCost: number
   - margin: number
   - totalPrice: number
   - notes: string | null

Also create:
- Create/Update DTOs for each entity
- PanelItemType enum with labels, descriptions, and colors
- ProjectStatus enum with labels and colors

Create in: src/types/index.ts
```

---

## ?? API Services Prompts

### Prompt 4: Create Material Service
```
Create a material API service for SmartOffer.

API Endpoints:
- GET /api/materials - Get all materials
- GET /api/materials/{id} - Get material by ID
- GET /api/materials/search?term={term} - Search materials
- GET /api/materials/categories - Get all categories
- GET /api/materials/brands - Get all brands
- GET /api/materials/category/{category} - Get by category
- POST /api/materials - Create material
- PUT /api/materials/{id} - Update material
- DELETE /api/materials/{id} - Delete material

Include an advancedSearch function that filters by:
- searchTerm (matches itemCode, description, brand, reference)
- category
- brand
- description (partial match)
- ratedCurrent
- isc
- reference (partial match)

Create in: src/services/materialService.ts

Also create React Query hooks:
- useMaterials()
- useMaterial(id)
- useCategories()
- useBrands()
- useMaterialsByCategory(category)
- useMaterialSearch(filters)
- useCreateMaterial()
- useUpdateMaterial()
- useDeleteMaterial()

Create in: src/hooks/useMaterials.ts
```

### Prompt 5: Create Project Service
```
Create a project API service for SmartOffer.

API Endpoints:
- GET /api/projects - Get all projects
- GET /api/projects/{id} - Get project details with panels
- GET /api/projects/{id}/summary - Get project pricing summary
- GET /api/projects/customer/{customer} - Get by customer
- GET /api/projects/status/{status} - Get by status
- POST /api/projects - Create project
- PUT /api/projects/{id} - Update project
- DELETE /api/projects/{id} - Delete project
- GET /api/projects/{id}/export - Export to Excel (returns blob)

Include a createWithPanels function that:
1. Creates the project
2. Creates N panels with names "Panel 1", "Panel 2", etc.
3. Returns the project with panels

Create in: src/services/projectService.ts

Also create React Query hooks in: src/hooks/useProjects.ts
```

### Prompt 6: Create Panel and PanelItem Services
```
Create panel and panel item API services for SmartOffer.

Panel Endpoints:
- GET /api/panels/project/{projectId} - Get panels by project
- GET /api/panels/{id} - Get panel details with items
- GET /api/panels/{id}/summary - Get panel summary
- POST /api/panels - Create panel
- PUT /api/panels/{id} - Update panel
- DELETE /api/panels/{id} - Delete panel

PanelItem Endpoints:
- GET /api/panelitems/panel/{panelId} - Get items by panel
- GET /api/panelitems/panel/{panelId}/type/{itemType} - Get by type
- GET /api/panelitems/types - Get all item types
- GET /api/panelitems/{id} - Get item by ID
- POST /api/panelitems - Create panel item
- PUT /api/panelitems/{id} - Update panel item
- DELETE /api/panelitems/{id} - Delete panel item

Include helper functions:
- updateItemType(id, newType) - Update just the item type
- bulkUpdateItemTypes(items) - Update multiple items' types
- addMaterialToPanel(panelId, materialId, quantity, itemType)

Create services in: src/services/panelService.ts, src/services/panelItemService.ts
Create hooks in: src/hooks/usePanels.ts, src/hooks/usePanelItems.ts
```

---

## ?? Layout Prompts

### Prompt 7: Create App Layout
```
Create the main application layout for SmartOffer using Material-UI.

Layout Structure:
???????????????????????????????????????????????
?                   Header (64px)              ?
???????????????????????????????????????????????
?          ?                                   ?
? Sidebar  ?         Main Content              ?
?  (240px) ?         (Outlet)                  ?
?          ?                                   ?
???????????????????????????????????????????????

Header:
- Company logo/name on left
- User profile dropdown on right
- Notification bell icon

Sidebar:
- Navigation items with icons:
  - Dashboard (home icon)
  - Projects (folder icon)
  - Materials (inventory icon)
  - Customers (people icon)
  - Reports (chart icon)
  - Settings (gear icon)
- Active item highlighted
- Collapsible on smaller screens

Use React Router's Outlet for main content.
Make sidebar responsive (drawer on mobile).

Create in: src/components/layout/AppLayout.tsx
```

### Prompt 8: Create Page Header Component
```
Create a reusable PageHeader component for SmartOffer.

Props:
- title: string (required)
- subtitle?: string
- breadcrumbs?: Array<{ label: string; path?: string }>
- actions?: ReactNode (for action buttons)
- backButton?: { label: string; onClick: () => void }

Features:
- Breadcrumb navigation using MUI Breadcrumbs
- Back button with arrow icon
- Title with optional subtitle
- Right-aligned action buttons area

Styling:
- Padding: 24px
- Border-bottom separator
- Responsive layout

Create in: src/components/layout/PageHeader.tsx
```

---

## ?? Page Prompts

### Prompt 9: Create Projects Page
```
Create the Projects listing page for SmartOffer.

Features:
1. Page Header with "New Project" button
2. Search bar for filtering projects
3. Status filter tabs: All, Draft, In Progress, Review, Completed, Cancelled
   - Show count badges on each tab
4. Projects grid (responsive: 1-4 columns)
5. Project cards showing:
   - Status badge (colored)
   - Project name
   - Customer name
   - Panel count
   - Item count
   - Total value
   - Created date
   - Team members avatars
   - Action menu (Edit, Delete, Duplicate, Export)
6. Empty state when no projects
7. Loading skeleton
8. Pagination

Use React Query to fetch projects.
Clicking a card navigates to /projects/{id}

Create in: src/pages/Projects/ProjectsPage.tsx
```

### Prompt 10: Create Project Form/Create Page
```
Create the Project Create/Edit form page for SmartOffer.

Form Fields:
1. Project Name (required, text input, max 200 chars)
2. Customer (required, searchable select/autocomplete)
3. Currency (select: USD, EUR, GBP, SAR, AED)
4. Number of Panels (number input, 1-50, with +/- buttons)
5. Default Margin % (number input, 0-100, step 0.5)
6. Team Members (multi-select with chips)
7. Notes (textarea, optional)
8. Status (radio buttons: Draft, In Progress, Review)

Validation:
- Use React Hook Form with Zod schema
- Show inline error messages
- Disable submit until valid

On Submit:
- If creating: Create project with panels, redirect to designer
- If editing: Update project, show success toast

Layout:
- Centered form card (max-width 600px)
- Section dividers
- Cancel and Submit buttons at bottom

Create in: src/pages/Projects/ProjectCreatePage.tsx
```

---

## ?? Panel Designer Prompts

### Prompt 11: Create Panel Designer Page - Layout
```
Create the Panel Designer page layout for SmartOffer.

URL: /projects/:projectId/designer

Layout:
???????????????????????????????????????????????????????????????????????????
? PageHeader: "Panel Designer - {ProjectName}"                             ?
? Back button | Save button | Generate Offer button                        ?
???????????????????????????????????????????????????????????????????????????
? Panel Tabs: [Panel 1 (12)] [Panel 2 (8)] [Panel 3 (0)] [+ Add Panel]    ?
???????????????????????????????????????????????????????????????????????????
?                                                                          ?
? ??????????????????????????? ??????????????????????????????????????????? ?
? ? MATERIAL CATALOG        ? ? PANEL ITEMS                             ? ?
? ? (Left panel - 40%)      ? ? (Right panel - 60%)                     ? ?
? ?                         ? ?                                         ? ?
? ? - Search box            ? ? - 4 drop zones (Incoming, Outgoing,     ? ?
? ? - Category tabs         ? ?   Enclosure, Busbar & Cables)           ? ?
? ? - Advanced filters      ? ? - Unassigned zone                       ? ?
? ? - Material cards list   ? ? - Draggable items                       ? ?
? ?                         ? ?                                         ? ?
? ??????????????????????????? ??????????????????????????????????????????? ?
?                                                                          ?
? ?????????????????????????????????????????????????????????????????????????
? ? Summary Bar: Items: 12 | Total Cost: $2,115 | Margin: 20% | $2,538   ??
? ?????????????????????????????????????????????????????????????????????????
???????????????????????????????????????????????????????????????????????????

State Management:
- Selected panel ID
- Panel items organized by type
- Material search/filter state

Create in: src/pages/PanelDesigner/PanelDesignerPage.tsx
```

### Prompt 12: Create Material Catalog Panel
```
Create the Material Catalog component for the Panel Designer.

Features:

1. Search Bar:
   - Text input with search icon
   - Debounced search (300ms)
   - Clear button when has value

2. Category Tabs:
   - Horizontal scrollable tabs
   - "All" tab first
   - Dynamic tabs from categories API
   - Badge with material count per category

3. Advanced Filters (collapsible accordion):
   - Description (text input, partial match)
   - Rated Current (select dropdown with common values: 6A, 10A, 16A, 25A, 32A, 40A, 63A, 100A)
   - Isc (select dropdown: 6kA, 10kA, 15kA, 25kA, 36kA, 50kA)
   - Reference (text input, partial match)
   - Brand (select from brands API)
   - Clear Filters button
   - Apply Filters button

4. Material List:
   - Scrollable container
   - Material cards with:
     - Item code (bold)
     - Description
     - Brand
     - Price
     - Add button (+)
   - Loading skeleton
   - Empty state when no results

5. Add Material Action:
   - Click "+" button
   - Show quick modal with quantity input
   - Add to panel's unassigned zone
   - Show success toast

Create in: src/components/panels/MaterialCatalog/MaterialCatalog.tsx
```

### Prompt 13: Create Drag and Drop Panel Items
```
Create the drag and drop panel items system using @dnd-kit.

Components needed:

1. PanelItemsContainer:
   - Wraps DndContext
   - Contains 5 drop zones
   - Handles drag start, drag over, drag end events
   - Manages zones state

2. ItemTypeZone:
   - Droppable zone component
   - Props: type, title, description, color, items
   - Shows zone header with icon and item count
   - Highlights when item dragged over
   - Shows empty state when no items
   - Contains sortable items list

3. DraggableItem:
   - Sortable item component
   - Shows: drag handle, item code, description, quantity control, price, remove button
   - Expands on hover to show more details
   - Quantity adjustment with +/- buttons
   - Remove button deletes item

4. DragOverlay:
   - Shows dragged item preview
   - Slightly rotated, with shadow
   - Shows item code and quantity

Zone Types with Colors:
- Incoming: #4CAF50 (green)
- Outgoing: #2196F3 (blue)
- Enclosure: #FF9800 (orange)
- Busbar & Cables: #9C27B0 (purple)
- Unassigned: #9E9E9E (gray)

API Integration:
- On drop to new zone: Call updatePanelItem to change itemType
- On quantity change: Call updatePanelItem
- On remove: Call deletePanelItem

Create in: src/components/panels/PanelItemsContainer/
```

---

## ?? Offer Generation Prompts

### Prompt 14: Create Offer Generator Page
```
Create the Offer Generator page for SmartOffer.

URL: /projects/:projectId/offers

Layout:
???????????????????????????????????????????????????????????????????????????
? PageHeader: "Generate Offers"                                            ?
? Back to Designer button                                                  ?
???????????????????????????????????????????????????????????????????????????
?                                                                          ?
? ???????????????????????  ???????????????????????                        ?
? ? ?? Commercial Offer ?  ? ?? Technical Offer  ?  ? Toggle buttons      ?
? ?    (Selected)       ?  ?                     ?                        ?
? ???????????????????????  ???????????????????????                        ?
?                                                                          ?
? ??????????????????????????????????????????????????????????????????????????
? ? Settings              ? Preview                                       ??
? ?                       ?                                               ??
? ? Valid Until: [date]   ? ???????????????????????????????????????????  ??
? ?                       ? ?                                          ?  ??
? ? ? Include logo        ? ?        PDF Preview (iframe)              ?  ??
? ? ? Terms & conditions  ? ?                                          ?  ??
? ? ? Itemized pricing    ? ?                                          ?  ??
? ?                       ? ?                                          ?  ??
? ? Additional discount:  ? ?                                          ?  ??
? ? [___] %               ? ?                                          ?  ??
? ?                       ? ?                                          ?  ??
? ? Notes:                ? ???????????????????????????????????????????  ??
? ? [textarea]            ?                                               ??
? ?                       ? [Export PDF] [Export Excel] [Print]          ??
? ??????????????????????????????????????????????????????????????????????????
???????????????????????????????????????????????????????????????????????????

Features:
- Toggle between Commercial and Technical offer
- Settings panel on left
- Live PDF preview on right (using iframe with blob URL)
- Export buttons for PDF and Excel
- Print functionality
- Regenerate preview when settings change

Create in: src/pages/OfferGenerator/OfferGeneratorPage.tsx
```

### Prompt 15: Create PDF Generation Service
```
Create an offer generation service using jsPDF for SmartOffer.

Functions:

1. prepareOfferData(projectId): Promise<OfferData>
   - Fetch project with panels and items
   - Organize items by panel and category
   - Calculate totals
   - Generate offer number
   - Return structured offer data

2. generateCommercialPDF(data: OfferData): Promise<Blob>
   - Company header with logo
   - "COMMERCIAL OFFER" title
   - Offer number and dates
   - Project and customer info box
   - Panel summary table:
     | # | Panel | Description | Items | Margin | Total |
   - Grand total box (styled)
   - Terms and conditions list
   - Footer with page numbers
   - Return PDF as Blob

3. generateTechnicalPDF(data: OfferData): Promise<Blob>
   - Company header
   - "TECHNICAL OFFER" title
   - Project reference info
   - For each panel:
     - Panel header (colored bar)
     - Items grouped by category (Incoming, Outgoing, etc.)
     - Technical table:
       | Code | Description | Brand | In | Isc | Poles | Qty |
   - Technical notes section
   - Multi-page support
   - Return PDF as Blob

4. generateExcel(data: OfferData, type): Promise<Blob>
   - Summary sheet with project info
   - One sheet per panel with items
   - Formatted headers and totals
   - Return Excel as Blob

Use jspdf-autotable for tables.
Handle page breaks properly.

Create in: src/services/offerService.ts
```

---

## ?? Final Integration Prompts

### Prompt 16: Create Router Configuration
```
Set up React Router for SmartOffer with these routes:

Routes:
- / ? DashboardPage
- /projects ? ProjectsPage
- /projects/new ? ProjectCreatePage
- /projects/:projectId ? ProjectDetailPage
- /projects/:projectId/edit ? ProjectCreatePage (edit mode)
- /projects/:projectId/designer ? PanelDesignerPage
- /projects/:projectId/offers ? OfferGeneratorPage
- /materials ? MaterialsPage
- /materials/import ? MaterialImportPage
- /customers ? CustomersPage (placeholder)
- /reports ? ReportsPage (placeholder)
- /settings ? SettingsPage (placeholder)
- * ? NotFoundPage

All routes except /login should use AppLayout.
Add route guards for authentication (future).

Create in: src/routes/index.tsx
```

### Prompt 17: Create Main App Entry
```
Create the main App component for SmartOffer.

Setup:
1. QueryClientProvider with React Query client
2. ThemeProvider with MUI theme
3. RouterProvider with router
4. ToastContainer for notifications

Theme Configuration:
- Primary color: #1976D2 (blue)
- Secondary color: #424242 (dark gray)
- Success: #4CAF50
- Warning: #FF9800
- Error: #F44336

React Query Configuration:
- Stale time: 5 minutes
- Retry: 3 times
- Refetch on window focus: true

Create in: src/App.tsx and src/main.tsx
```

---

## ?? Testing Prompts

### Prompt 18: Add Loading and Error States
```
Review all pages and components in SmartOffer and ensure:

1. Loading States:
   - Show skeleton loaders while data is loading
   - Use MUI Skeleton components
   - Match the layout of actual content

2. Error States:
   - Show error messages when API fails
   - Include retry button
   - Use MUI Alert component

3. Empty States:
   - Show helpful message when no data
   - Include action button (e.g., "Create First Project")
   - Use custom EmptyState component with icon

4. Toast Notifications:
   - Success toast on create/update/delete
   - Error toast on failures
   - Use react-hot-toast or MUI Snackbar

Implement these patterns consistently across:
- ProjectsPage
- MaterialsPage
- PanelDesignerPage
- All modal dialogs
```

---

## ?? Responsive Design Prompt

### Prompt 19: Make Application Responsive
```
Ensure SmartOffer is responsive across devices:

Breakpoints:
- xs: 0-599px (mobile)
- sm: 600-899px (tablet)
- md: 900-1199px (small desktop)
- lg: 1200-1535px (desktop)
- xl: 1536px+ (large desktop)

Mobile Adaptations:
1. Sidebar ? Drawer (hamburger menu)
2. Project cards ? Single column
3. Panel Designer ? Stacked layout (catalog above, items below)
4. Tables ? Responsive/scrollable
5. Forms ? Full width inputs
6. Modals ? Full screen on mobile

Tablet Adaptations:
1. Project cards ? 2 columns
2. Panel Designer ? Adjustable split

Use MUI's useMediaQuery and responsive props.
Test touch interactions for drag and drop.
```

---

## ?? Complete Implementation Checklist

Use this checklist to track progress:

```markdown
## Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install all dependencies
- [ ] Configure API client
- [ ] Set up folder structure
- [ ] Create type definitions

## Services
- [ ] Material service + hooks
- [ ] Project service + hooks
- [ ] Panel service + hooks
- [ ] PanelItem service + hooks
- [ ] Import service
- [ ] Offer generation service

## Layout
- [ ] AppLayout with sidebar
- [ ] Header component
- [ ] PageHeader component
- [ ] Responsive sidebar/drawer

## Pages
- [ ] Dashboard page
- [ ] Projects list page
- [ ] Project create/edit page
- [ ] Panel designer page
- [ ] Offer generator page
- [ ] Materials page
- [ ] Not found page

## Components
- [ ] Material catalog
- [ ] Category tabs
- [ ] Material search/filters
- [ ] Material cards
- [ ] Panel tabs
- [ ] Drop zones
- [ ] Draggable items
- [ ] Offer preview
- [ ] PDF viewer

## Features
- [ ] Drag and drop
- [ ] Real-time pricing
- [ ] PDF generation
- [ ] Excel export
- [ ] Search and filtering
- [ ] Form validation
- [ ] Toast notifications

## Polish
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Responsive design
- [ ] Keyboard accessibility
- [ ] Touch support
```

---

**Good luck building SmartOffer!** ??
