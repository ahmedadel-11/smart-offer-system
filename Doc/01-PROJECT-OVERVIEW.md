# SmartOffer Frontend - Project Overview

## ?? Project Summary

SmartOffer is an **Electrical Panel Quotation Management System** that helps electrical engineers and sales teams create professional quotations for electrical panel projects. The application manages materials, projects, panels, and generates commercial and technical offers.

## ??? Technology Stack Requirements

### Recommended Stack
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Library**: Material-UI (MUI) v5+ or Ant Design
- **Drag & Drop**: react-beautiful-dnd or @dnd-kit
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios or TanStack Query (React Query)
- **Routing**: React Router v6
- **Charts/Reports**: Chart.js or Recharts
- **PDF Generation**: jsPDF or react-pdf
- **Excel Export**: SheetJS (xlsx)

### Alternative Stack (if preferred)
- **Framework**: Next.js 14+ with App Router
- **Framework**: Vue 3 with Composition API
- **Framework**: Angular 17+

## ?? Backend API

### Base URL
```
Development: https://localhost:7000/api
Production: https://api.smartoffer.com/api
```

### Available Endpoints
| Resource | Endpoint | Description |
|----------|----------|-------------|
| Materials | `/api/materials` | Material catalog management |
| Projects | `/api/projects` | Project CRUD operations |
| Panels | `/api/panels` | Panel management within projects |
| Panel Items | `/api/panelitems` | Items within panels |
| Import | `/api/import` | Excel import functionality |

### Authentication
- Currently: No authentication (development mode)
- Future: JWT Bearer token authentication

## ?? Application Structure

```
src/
??? components/           # Reusable UI components
?   ??? common/          # Buttons, Inputs, Cards, etc.
?   ??? layout/          # Header, Sidebar, Footer
?   ??? materials/       # Material-related components
?   ??? projects/        # Project-related components
?   ??? panels/          # Panel-related components
?   ??? offers/          # Offer generation components
??? pages/               # Page components
?   ??? Dashboard/
?   ??? Projects/
?   ??? Materials/
?   ??? PanelDesigner/
?   ??? OfferGenerator/
??? hooks/               # Custom React hooks
??? services/            # API service functions
??? store/               # State management
??? types/               # TypeScript interfaces
??? utils/               # Utility functions
??? assets/              # Images, icons, styles
```

## ?? Design Guidelines

### Color Palette
```css
--primary-color: #1976D2;      /* Blue - Primary actions */
--secondary-color: #424242;     /* Dark Gray - Secondary elements */
--success-color: #4CAF50;       /* Green - Success states */
--warning-color: #FF9800;       /* Orange - Warnings */
--error-color: #F44336;         /* Red - Errors */
--background-color: #F5F5F5;    /* Light Gray - Background */
--surface-color: #FFFFFF;       /* White - Cards, surfaces */
--text-primary: #212121;        /* Dark - Primary text */
--text-secondary: #757575;      /* Gray - Secondary text */
```

### Typography
- **Headings**: Roboto Bold
- **Body**: Roboto Regular
- **Monospace**: Roboto Mono (for codes, prices)

### Spacing System
- Base unit: 8px
- Use multiples: 8, 16, 24, 32, 48, 64px

## ?? Main User Flows

### Flow 1: Project Creation
1. User navigates to Projects page
2. Clicks "New Project" button
3. Fills project form (name, customer, panels count, team)
4. System creates project with specified number of empty panels
5. User is redirected to Panel Designer

### Flow 2: Panel Material Selection
1. User opens Panel Designer for a project
2. Sees material categories as tabs
3. Searches/filters materials
4. Adds materials to panel with quantities
5. Materials appear in "Unassigned" section

### Flow 3: Item Categorization (Drag & Drop)
1. User sees 4 drop zones: Incoming, Outgoing, Enclosure, Busbar & Cables
2. Drags items from "Unassigned" to appropriate zones
3. Can reorder items within zones
4. Can move items between zones

### Flow 4: Offer Generation
1. User completes all panels
2. Clicks "Generate Offers"
3. System calculates pricing with margins
4. User can generate:
   - Commercial Offer (pricing focused)
   - Technical Offer (specifications focused)
5. Export as PDF or Excel

## ?? Key Features

### Must-Have Features (MVP)
- [ ] Project CRUD with customer selection
- [ ] Panel management within projects
- [ ] Material catalog with search/filter
- [ ] Category-based material browsing
- [ ] Drag & drop item categorization
- [ ] Basic offer generation (PDF)
- [ ] Responsive design (desktop first)

### Nice-to-Have Features
- [ ] Dashboard with statistics
- [ ] Material import from Excel
- [ ] Offer templates customization
- [ ] Team collaboration features
- [ ] Offline mode with sync
- [ ] Dark mode theme
- [ ] Multi-language support

## ?? Getting Started

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 9.0.0 or yarn >= 1.22.0
```

### Installation
```bash
# Clone repository
git clone <frontend-repo-url>

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_API_BASE_URL=https://localhost:7000/api
VITE_APP_NAME=SmartOffer
VITE_APP_VERSION=1.0.0
```

## ?? Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint + Prettier configuration
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for all async operations

### Component Guidelines
- One component per file
- Use named exports
- Props interfaces defined above component
- Memoize expensive computations
- Use lazy loading for routes

### State Management Guidelines
- Server state: React Query / TanStack Query
- UI state: Local component state
- Global UI state: Context or Zustand
- Form state: React Hook Form

---

**Next Steps**: Read the following documentation files:
1. `02-DATA-MODELS.md` - TypeScript interfaces and data structures
2. `03-API-INTEGRATION.md` - API endpoints and service functions
3. `04-COMPONENTS.md` - Component specifications
4. `05-PAGES.md` - Page layouts and features
5. `06-DRAG-DROP.md` - Drag and drop implementation
6. `07-OFFER-GENERATION.md` - Commercial and technical offers
