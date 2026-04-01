# SmartOffer Frontend

Electrical Panel Quotation Management System - Frontend Application

## Overview

SmartOffer is a modern web application for managing electrical panel quotations. It provides a visual drag-and-drop interface for designing panels, generating professional PDF offers, and managing project workflows.

## Tech Stack

- **React 18+** with TypeScript
- **Vite** - Build tool
- **Material-UI (MUI) v5** - UI Component Library
- **TanStack React Query** - Server state management
- **React Router v6** - Routing
- **React Hook Form + Zod** - Form handling and validation
- **@dnd-kit** - Drag and Drop
- **jsPDF** - PDF generation
- **xlsx (SheetJS)** - Excel export/import
- **Axios** - HTTP client
- **react-hot-toast** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Backend API running at `https://localhost:7098/`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://localhost:7098/api
VITE_APP_NAME=SmartOffer
VITE_APP_VERSION=1.0.0
```

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Card, Modal, etc.)
│   ├── layout/          # Layout components (AppLayout, Header, Sidebar)
│   ├── materials/       # Material-related components
│   ├── panels/          # Panel & drag-drop components
│   └── projects/        # Project-related components
├── hooks/               # React Query hooks for data fetching
├── pages/               # Page components
│   ├── Dashboard/       # Home dashboard
│   ├── Import/          # Excel import page
│   ├── Materials/       # Material catalog
│   ├── OfferGenerator/  # PDF/Excel offer generation
│   ├── PanelDesigner/   # Drag-drop panel designer
│   ├── Projects/        # Project management
│   └── Settings/        # Application settings
├── router/              # React Router configuration
├── services/            # API service modules
├── styles/              # Global CSS styles
├── theme/               # MUI theme configuration
└── types/               # TypeScript type definitions
```

## Key Features

### Dashboard
- Project statistics and overview
- Recent projects list
- Quick actions for common tasks

### Project Management
- Create, edit, delete projects
- View project details and panels
- Export projects to PDF/Excel

### Material Catalog
- Browse materials by category
- Search with advanced filters
- Add materials to panels

### Panel Designer
- Visual drag-and-drop interface
- 5 zones: Unassigned, Incoming, Outgoing, Enclosure, Busbars & Cables
- Real-time price calculations
- Quantity management

### Offer Generation
- Commercial offer PDF (summary pricing)
- Technical offer PDF (detailed specifications)
- Excel export with multiple sheets

### Import
- Import materials from Excel
- Import projects from Excel
- Validation and preview before import

## API Integration

The application connects to a .NET backend API. All API calls are made through the services in `src/services/`:

- `materialService.ts` - Material CRUD operations
- `projectService.ts` - Project management
- `panelService.ts` - Panel operations
- `panelItemService.ts` - Panel item management
- `importService.ts` - Excel import
- `offerService.ts` - PDF/Excel generation (client-side)

## Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #1976D2 | Primary actions, navigation |
| Success Green | #4CAF50 | Success states, Incoming zone |
| Warning Orange | #FF9800 | Warnings, Enclosure zone |
| Error Red | #F44336 | Errors, delete actions |
| Purple | #9C27B0 | Busbars & Cables zone |
| Grey | #9E9E9E | Neutral, Unassigned zone |

## Panel Item Types

| Type | Value | Zone |
|------|-------|------|
| Unassigned | 0 | Unassigned |
| Incoming | 1 | Incoming |
| Outgoing | 2 | Outgoing |
| Enclosure | 3 | Enclosure |
| BusbarsAndCables | 4 | Busbars & Cables |

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## License

Proprietary - All rights reserved
