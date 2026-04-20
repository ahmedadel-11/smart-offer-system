# Packages Feature - UI/UX Design Guide

## 🎨 Design Overview

This guide provides UI/UX specifications for the Packages feature implementation.

---

## 🏗️ Information Architecture

```
Packages (Main Section)
├── Packages List Page
│   ├── Search Bar
│   ├── Create Package Button
│   └── Packages Grid/List
│       └── Package Card
│           ├── Package Name
│           ├── Description
│           ├── Item Count
│           └── Actions (View, Edit, Delete)
│
├── Create Package Page
│   ├── Form Section
│   │   ├── Package Name Input
│   │   ├── Description Textarea
│   │   ├── Items Table
│   │   │   ├── Add Item Section
│   │   │   └── Item List
│   │   └── Submit Button
│   └── Sidebar (Optional)
│       └── Instructions
│
├── Package Details Page
│   ├── Header
│   │   ├── Package Name
│   │   └── Actions (Edit, Back)
│   ├── Description
│   ├── Items Table
│   └── Metadata
│
└── Edit Package Page
    └── (Same as Create Page)
```

---

## 📄 Page Wireframes

### 1. Packages List Page

```
┌─────────────────────────────────────────────────────┐
│                    SmartOffer                        │
├─────────────────────────────────────────────────────┤
│ [≡] Sidebar      Packages List          [USER] [⚙]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Packages                        [+ Create Package]  │
│                                                       │
│  ┌─ Search: [__________] (x)                        │
│                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ Panel Enclosure 1    │  │ Cable Bundle Kit     │ │
│  │ ────────────────────  │  │ ────────────────────  │
│  │ Standard panel with   │  │ Cables and         │ │
│  │ DIN rail...          │  │ connectors...       │ │
│  │                      │  │                      │ │
│  │ 4 items              │  │ 3 items              │ │
│  │ [View] [Edit][Del]   │  │ [View] [Edit][Del]   │ │
│  └──────────────────────┘  └──────────────────────┘ │
│                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ Power Supply Kit     │  │ Switch Assembly      │ │
│  │ ────────────────────  │  │ ────────────────────  │
│  │ Complete power       │  │ All switches and    │ │
│  │ solution...          │  │ accessories...      │ │
│  │                      │  │                      │ │
│  │ 6 items              │  │ 5 items              │ │
│  │ [View] [Edit][Del]   │  │ [View] [Edit][Del]   │ │
│  └──────────────────────┘  └──────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 2. Create Package Page

```
┌─────────────────────────────────────────────────────┐
│                    SmartOffer                        │
├─────────────────────────────────────────────────────┤
│ [≡] Sidebar      Create Package         [USER] [⚙]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ Create New Package                             │ │
│  │                                                │ │
│  │ Package Name *                                 │ │
│  │ [____________________________]                 │ │
│  │                                                │ │
│  │ Description                                    │ │
│  │ [____________________________]                 │ │
│  │ [____________________________]                 │ │
│  │ [____________________________]                 │ │
│  │                                                │ │
│  │ Items *                                        │ │
│  │ ┌────────────────────────────────────────────┐│ │
│  │ │ Material ID | Quantity | Action           ││ │
│  │ ├────────────────────────────────────────────┤│ │
│  │ │ 5          | 2        | [Remove]         ││ │
│  │ │ 12         | 1        | [Remove]         ││ │
│  │ │ 18         | 3        | [Remove]         ││ │
│  │ └────────────────────────────────────────────┘│ │
│  │                                                │ │
│  │ Add Item                                       │ │
│  │ Material ID: [______]  Quantity: [___] [Add] │ │
│  │                                                │ │
│  │ [Create Package]  [Cancel]                    │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 3. Package Details Page

```
┌─────────────────────────────────────────────────────┐
│                    SmartOffer                        │
├─────────────────────────────────────────────────────┤
│ [≡] Sidebar      Package Details        [USER] [⚙]  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Panel Enclosure 1              [Edit] [Back]       │
│                                                       │
│  Standard panel enclosure with DIN rail and         │
│  connectors for electrical panels.                   │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ Items (4)                                      │ │
│  ├────────────────────────────────────────────────┤ │
│  │ Code | Description | Qty | Base Price        │ │
│  ├────────────────────────────────────────────────┤ │
│  │ DIN- | DIN Rail 35mm | 2 | $25.50          │ │
│  │ BUS- | Busbar Conn. | 1 | $15.00           │ │
│  │ CBL- | Cable Gland   | 3 | $5.00            │ │
│  │ MOU- | Mounting Plate | 1 | $10.00         │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  Created: April 20, 2025                             │
│  Updated: April 21, 2025                             │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🎭 Design System

### Colors

```
Primary:
  - Primary Color: #1976d2 (Blue)
  - Hover: #1565c0
  - Disabled: #b3e5fc

Secondary:
  - Secondary Color: #757575 (Gray)
  - Hover: #616161
  - Disabled: #bdbdbd

Status:
  - Success: #4caf50 (Green)
  - Error: #d32f2f (Red)
  - Warning: #ff9800 (Orange)
  - Info: #2196f3 (Light Blue)

Background:
  - Light: #f5f5f5
  - Card: #ffffff
  - Border: #ddd

Text:
  - Primary: #333333
  - Secondary: #666666
  - Disabled: #999999
```

### Typography

```
Headings:
  - H1: 28px, Bold (600), #333333
  - H2: 22px, Bold (600), #333333
  - H3: 18px, Bold (600), #333333
  - H4: 16px, Bold (600), #333333

Body:
  - Regular: 14px, Normal (400), #666666
  - Small: 12px, Normal (400), #999999

Labels:
  - 14px, Medium (500), #333333

Links:
  - 14px, Normal (400), #1976d2
  - Underline on hover
```

### Spacing

```
Margin/Padding Scale:
  - xs: 4px
  - sm: 8px
  - md: 12px
  - lg: 16px
  - xl: 20px
  - 2xl: 24px
  - 3xl: 32px
  - 4xl: 40px
```

### Border Radius

```
  - xs: 2px
  - sm: 4px
  - md: 8px
  - lg: 12px
  - full: 9999px
```

### Shadows

```
Elevation Levels:
  - None: no shadow
  - 1: 0 2px 4px rgba(0,0,0,0.1)
  - 2: 0 4px 12px rgba(0,0,0,0.15)
  - 3: 0 8px 24px rgba(0,0,0,0.2)
```

---

## 🧩 Component Specifications

### Button Component

**States:**
- Default
- Hover
- Active/Pressed
- Disabled
- Loading

**Variants:**
- Primary (Blue)
- Secondary (Gray)
- Danger (Red)
- Success (Green)

**Sizes:**
- Small: 32px height, 8px padding
- Medium: 40px height, 12px padding
- Large: 48px height, 16px padding

```html
<!-- Examples -->
<button class="btn btn-primary">Create Package</button>
<button class="btn btn-secondary">Cancel</button>
<button class="btn btn-danger" disabled>Delete</button>
<button class="btn btn-sm btn-outline">View</button>
```

### Input Component

**States:**
- Default
- Focused
- Filled
- Error
- Disabled

**Attributes:**
- Placeholder text
- Helper text
- Error message
- Character count (optional)

```html
<div class="form-group">
  <label>Package Name</label>
  <input 
    type="text" 
    class="form-control" 
    placeholder="Enter package name"
  />
  <span class="helper-text">Max 200 characters</span>
</div>
```

### Card Component

**Structure:**
- Header (optional)
- Content
- Footer (optional)
- Actions (optional)

```html
<div class="package-card">
  <div class="card-header">
    <h3>Panel Enclosure 1</h3>
  </div>
  <div class="card-body">
    <p>Description text</p>
  </div>
  <div class="card-footer">
    <span class="badge">4 items</span>
  </div>
</div>
```

### Modal/Dialog Component

**Types:**
- Confirmation Dialog
- Alert Dialog
- Form Modal
- Information Modal

```html
<div class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Delete Package</h2>
      <button class="close">&times;</button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to delete this package?</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-danger">Delete</button>
    </div>
  </div>
</div>
```

### Table Component

**Features:**
- Sortable columns
- Responsive design
- Row actions
- Pagination (if needed)

```html
<table class="data-table">
  <thead>
    <tr>
      <th>Material Code</th>
      <th>Description</th>
      <th>Quantity</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>DIN-RAIL</td>
      <td>DIN Rail 35mm</td>
      <td>2</td>
      <td><button>Remove</button></td>
    </tr>
  </tbody>
</table>
```

---

## 🔄 User Flows

### Create Package Flow

```
1. User clicks "Create Package"
   ↓
2. Navigate to Create Package page
   ↓
3. User fills form
   - Package name
   - Description
   - Add items with quantities
   ↓
4. Validation
   - Client-side validation
   - Show errors if invalid
   ↓
5. User clicks "Create Package"
   ↓
6. API request sent
   ↓
7. Show loading state
   ↓
8. Response received
   ↓
9. If successful:
   - Show success message
   - Redirect to packages list
   ↓
   If error:
   - Show error message
   - Keep form data
```

### Edit Package Flow

```
1. User clicks "Edit" on package card
   ↓
2. Navigate to Edit Package page
   ↓
3. Load package details (pre-fill form)
   ↓
4. User modifies form
   ↓
5. User clicks "Update Package"
   ↓
6. Validation and API request
   ↓
7. Show success message
   ↓
8. Redirect to packages list
```

### Delete Package Flow

```
1. User clicks "Delete" button
   ↓
2. Show confirmation dialog
   ↓
3. If confirmed:
   - Send delete request
   - Show loading state
   - Remove from list
   - Show success message
   ↓
   If cancelled:
   - Close dialog
   - Return to previous state
```

---

## 📱 Responsive Design

### Breakpoints

```
Mobile:   < 576px
Tablet:   576px - 768px
Desktop:  768px - 1200px
Wide:     > 1200px
```

### Grid Adjustments

```
Mobile (< 576px):
  - Packages grid: 1 column
  - Form: Single column layout
  - Table: Horizontal scroll or stacked view

Tablet (576px - 768px):
  - Packages grid: 2 columns
  - Form: Single column layout
  - Table: Horizontal scroll

Desktop (> 768px):
  - Packages grid: 3+ columns
  - Form: Multi-column layout possible
  - Table: Full width
```

### Touch Targets

- Minimum: 44px × 44px (mobile)
- Recommended: 48px × 48px

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

**1. Color Contrast**
- Normal text: 4.5:1 ratio
- Large text (18px+): 3:1 ratio
- UI components: 3:1 ratio

**2. Keyboard Navigation**
- All interactive elements must be keyboard accessible
- Tab order should be logical
- Focus state should be visible

**3. ARIA Labels**
```html
<button aria-label="Delete package">
  <span aria-hidden="true">×</span>
</button>

<table aria-label="List of packages">
  <!-- content -->
</table>
```

**4. Form Labels**
```html
<label for="packageName">Package Name</label>
<input id="packageName" type="text" />
```

**5. Error Messages**
```html
<input 
  aria-describedby="nameError"
  aria-invalid="true"
/>
<span id="nameError" role="alert">
  Package name is required
</span>
```

---

## 🌙 Dark Mode Support (Optional)

```css
@media (prefers-color-scheme: dark) {
  body {
    background: #1e1e1e;
    color: #ffffff;
  }

  .card {
    background: #2d2d2d;
    border-color: #444;
  }

  input, textarea {
    background: #3d3d3d;
    color: #ffffff;
    border-color: #555;
  }
}
```

---

## 📊 Loading States

**Skeleton Loading:**
```html
<div class="skeleton-card">
  <div class="skeleton-title"></div>
  <div class="skeleton-text"></div>
  <div class="skeleton-text"></div>
</div>
```

**Spinner:**
```html
<div class="spinner">
  <div class="spinner-ring"></div>
</div>
```

**Progress Bar:**
```html
<div class="progress-bar">
  <div class="progress-fill"></div>
</div>
```

---

## 💬 Messaging

### Success Messages
```
✓ Package created successfully!
✓ Package updated successfully!
✓ Package deleted successfully!
```

### Error Messages
```
✗ Failed to create package
✗ Package name already exists
✗ Please fill in all required fields
✗ Material not found
```

### Confirmation Messages
```
Are you sure you want to delete this package?
This action cannot be undone.

[Cancel] [Delete]
```

---

## 🎬 Animations & Transitions

**Page Transitions:**
- Fade in: 200ms
- Slide in: 300ms

**Button Hover:**
- Color change: 150ms

**Loading Spinner:**
- Rotation: 1000ms infinite

**Toast Notifications:**
- Slide in: 300ms
- Stay visible: 4000ms
- Slide out: 300ms

---

## 🖼️ Icons

Recommended icon library: **Material UI Icons** or **Font Awesome**

```
📦 Package
✏️ Edit
🗑️ Delete
👁️ View
🔍 Search
➕ Add
❌ Close
✓ Check/Success
⚠️ Warning
ⓘ Info
```

---

## 📸 Screenshot Examples

### Desktop View
```
Wide sidebar + Main content area
- Left: Navigation menu (200px)
- Center: Packages grid (3-4 columns)
- Responsive to window size
```

### Mobile View
```
- Full-width content
- Hamburger menu for navigation
- Single column layout
- Touch-friendly buttons (48px+)
```

### Tablet View
```
- Collapsible sidebar
- 2-column grid for packages
- Balanced layout
```

---

## 🔐 Permission-Based UI

**Show based on permissions:**

```typescript
{hasPermission('packages:create') && (
  <button>Create Package</button>
)}

{hasPermission('packages:edit') && (
  <button>Edit</button>
)}

{hasPermission('packages:delete') && (
  <button className="btn-danger">Delete</button>
)}
```

---

## 📋 Form Validation Messages

```
Package Name:
  - Required: "Package name is required"
  - Duplicate: "Package with this name already exists"
  - Too long: "Maximum 200 characters allowed"

Description:
  - Too long: "Maximum 500 characters allowed"

Items:
  - Required: "At least one item is required"
  - Invalid material: "Material not found"
  - Invalid quantity: "Quantity must be greater than 0"
```

---

## 🎯 Design Tokens

```css
--color-primary: #1976d2;
--color-secondary: #757575;
--color-success: #4caf50;
--color-error: #d32f2f;
--color-warning: #ff9800;
--color-info: #2196f3;

--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;

--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;

--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);

--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-md: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 28px;
```

---

## ✅ Checklist for Implementation

- [ ] Design system tokens created
- [ ] Components designed (buttons, inputs, cards, modals)
- [ ] Color palette defined
- [ ] Typography system established
- [ ] Layout/grid system defined
- [ ] Responsive breakpoints determined
- [ ] Accessibility standards reviewed
- [ ] Icon library selected
- [ ] Animation guidelines documented
- [ ] Dark mode support planned
- [ ] Component library created
- [ ] Storybook setup (optional)
- [ ] Design handoff to developers
