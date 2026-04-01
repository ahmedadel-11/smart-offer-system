# SmartOffer Frontend Documentation

## ?? Documentation Index

Welcome to the SmartOffer frontend documentation. This documentation is designed to be used by AI agents or developers to build the complete frontend application.

---

## ?? Project Overview

**SmartOffer** is an Electrical Panel Quotation Management System that allows electrical engineers to:

1. **Create Projects** - Define projects with customer info, number of panels, and team members
2. **Design Panels** - Select materials from a catalog and organize them into categories
3. **Drag & Drop Organization** - Categorize panel items into Incoming, Outgoing, Enclosure, and Busbar & Cables
4. **Generate Offers** - Create professional Commercial and Technical offers in PDF/Excel format

---

## ?? Documentation Files

| File | Description |
|------|-------------|
| [01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md) | Project summary, tech stack, architecture, and getting started |
| [02-DATA-MODELS.md](./02-DATA-MODELS.md) | TypeScript interfaces, enums, and data structures |
| [03-API-INTEGRATION.md](./03-API-INTEGRATION.md) | API services, endpoints, and React Query hooks |
| [04-COMPONENTS.md](./04-COMPONENTS.md) | UI component specifications and props |
| [05-PAGES.md](./05-PAGES.md) | Page layouts, user flows, and wireframes |
| [06-DRAG-DROP.md](./06-DRAG-DROP.md) | Drag and drop implementation with @dnd-kit |
| [07-OFFER-GENERATION.md](./07-OFFER-GENERATION.md) | PDF/Excel generation for commercial and technical offers |
| [08-AI-AGENT-PROMPTS.md](./08-AI-AGENT-PROMPTS.md) | Ready-to-use prompts for AI agents |

---

## ?? Quick Start for AI Agents

### Step 1: Read the Overview
Start with `01-PROJECT-OVERVIEW.md` to understand the project scope and architecture.

### Step 2: Set Up Types
Use `02-DATA-MODELS.md` to create all TypeScript interfaces.

### Step 3: Create API Services
Follow `03-API-INTEGRATION.md` to set up API communication.

### Step 4: Build Components
Use `04-COMPONENTS.md` to create reusable UI components.

### Step 5: Build Pages
Follow `05-PAGES.md` to create all application pages.

### Step 6: Add Drag & Drop
Implement drag and drop using `06-DRAG-DROP.md`.

### Step 7: Add Offer Generation
Add PDF/Excel export using `07-OFFER-GENERATION.md`.

### Step 8: Use the Prompts
Copy prompts from `08-AI-AGENT-PROMPTS.md` for step-by-step implementation.

---

## ?? Backend API Reference

The backend is a .NET 8 Web API. Key endpoints:

### Materials
```
GET    /api/materials           - Get all materials
GET    /api/materials/{id}      - Get by ID
GET    /api/materials/search    - Search materials
GET    /api/materials/categories - Get categories
GET    /api/materials/brands    - Get brands
POST   /api/materials           - Create material
PUT    /api/materials/{id}      - Update material
DELETE /api/materials/{id}      - Delete material
```

### Projects
```
GET    /api/projects            - Get all projects
GET    /api/projects/{id}       - Get project with panels
GET    /api/projects/{id}/summary - Get pricing summary
POST   /api/projects            - Create project
PUT    /api/projects/{id}       - Update project
DELETE /api/projects/{id}       - Delete project
```

### Panels
```
GET    /api/panels/project/{projectId} - Get by project
GET    /api/panels/{id}         - Get panel with items
POST   /api/panels              - Create panel
PUT    /api/panels/{id}         - Update panel
DELETE /api/panels/{id}         - Delete panel
```

### Panel Items
```
GET    /api/panelitems/panel/{panelId} - Get by panel
GET    /api/panelitems/panel/{panelId}/type/{type} - Get by type
GET    /api/panelitems/types    - Get item types enum
POST   /api/panelitems          - Create item
PUT    /api/panelitems/{id}     - Update item
DELETE /api/panelitems/{id}     - Delete item
```

### Import
```
POST   /api/import/materials    - Import materials from Excel
POST   /api/import/project      - Import project from Excel
GET    /api/import/materials/template - Download template
```

---

## ?? Design System Summary

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | #1976D2 | Primary actions, links |
| Success | #4CAF50 | Success states, Incoming zone |
| Info | #2196F3 | Info states, Outgoing zone |
| Warning | #FF9800 | Warnings, Enclosure zone |
| Error | #F44336 | Errors, delete actions |
| Purple | #9C27B0 | Busbar & Cables zone |

### Panel Item Types
| Type | Value | Color | Description |
|------|-------|-------|-------------|
| Incoming | 1 | Green | Main supply, switches |
| Outgoing | 2 | Blue | Circuit breakers, contactors |
| Enclosure | 3 | Orange | Panel enclosure, mounting |
| BusbarAndCables | 4 | Purple | Busbars, cables, wiring |

---

## ?? Key User Flows

### Flow 1: Create Project
```
Projects Page ? New Project Button ? Fill Form ? Submit
? Project Created with N Panels ? Redirect to Panel Designer
```

### Flow 2: Design Panel
```
Panel Designer ? Select Panel Tab ? Search Materials
? Click + to Add Material ? Material in Unassigned Zone
? Drag to Appropriate Zone (Incoming/Outgoing/etc.)
? Adjust Quantities ? Repeat ? Save
```

### Flow 3: Generate Offer
```
Panel Designer ? Generate Offer Button ? Offer Page
? Select Type (Commercial/Technical) ? Configure Options
? Preview PDF ? Export PDF/Excel or Print
```

---

## ? Feature Checklist

### Core Features
- [x] Backend API (Complete)
- [ ] Project CRUD
- [ ] Panel Management
- [ ] Material Catalog with Search/Filter
- [ ] Category Tabs
- [ ] Drag & Drop Item Categorization
- [ ] Commercial Offer PDF
- [ ] Technical Offer PDF
- [ ] Excel Export

### Advanced Features
- [ ] Dashboard with Statistics
- [ ] Excel Import
- [ ] Team Collaboration
- [ ] Customer Management
- [ ] Report Generation
- [ ] Dark Mode
- [ ] Multi-language

---

## ??? Development Tips

### For AI Agents

1. **Start Small**: Begin with project setup and basic pages
2. **Use TypeScript**: All code should be properly typed
3. **Follow Patterns**: Use the established patterns in the docs
4. **Test Incrementally**: Build and test each feature before moving on
5. **Handle Errors**: Always add loading, error, and empty states

### API Testing
The backend runs on `https://localhost:7000`. Use Swagger UI at `/swagger` to test endpoints.

### Recommended Order
1. Types ? 2. API Services ? 3. Layout ? 4. Pages ? 5. Components ? 6. Features

---

## ?? Backend Connection

Ensure the backend is running before starting frontend development:

```bash
cd src/SmartOffer.API
dotnet run
```

API will be available at `https://localhost:7000`
Swagger UI at `https://localhost:7000/swagger`

---

**Ready to build SmartOffer!** ??

For questions or issues, refer to the specific documentation files or the AI prompts document.
