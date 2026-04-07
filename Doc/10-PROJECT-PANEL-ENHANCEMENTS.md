# Project & Panel Management Enhancements - Frontend Documentation

## 📋 Overview

This document describes the enhancements to Project & Panel management for SmartOffer. The frontend must implement:

1. **Soft Delete** - Projects and Panels are soft-deleted (recoverable)
2. **Panel Duplication** - Clone a panel with all its materials
3. **Status Management** - Status workflow for Projects and Panels
4. **Collaboration System** - Add collaborators to Projects and Panels
5. **Visibility Rules** - Users see only what they own or collaborate on
6. **Audit Trail** - All changes are fully auditable

---

## 📦 TypeScript Interfaces

### EntityStatus Enum

```typescript
enum EntityStatus {
  Draft = 1,
  InProgress = 2,
  UnderReview = 3,
  Approved = 4,
  Rejected = 5,
  Completed = 6,
  Archived = 7
}

// Status labels and colors
const statusConfig: Record<EntityStatus, { label: string; color: string }> = {
  [EntityStatus.Draft]: { label: 'Draft', color: '#9E9E9E' },
  [EntityStatus.InProgress]: { label: 'In Progress', color: '#2196F3' },
  [EntityStatus.UnderReview]: { label: 'Under Review', color: '#FF9800' },
  [EntityStatus.Approved]: { label: 'Approved', color: '#4CAF50' },
  [EntityStatus.Rejected]: { label: 'Rejected', color: '#F44336' },
  [EntityStatus.Completed]: { label: 'Completed', color: '#009688' },
  [EntityStatus.Archived]: { label: 'Archived', color: '#607D8B' },
};
```

### Updated Project Types

```typescript
interface ProjectDto {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  createdDate: string;
  status: EntityStatus;        // Changed from string to enum
  notes: string | null;
  panelCount: number;
  createdByUserId: string | null;  // NEW
}

interface ProjectDetailDto {
  projectId: number;
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  createdDate: string;
  status: EntityStatus;
  notes: string | null;
  createdByUserId: string | null;  // NEW
  panels: PanelDto[];
  collaborators: CollaboratorDto[];  // NEW
  summary: ProjectSummaryDto;
}

interface CreateProjectDto {
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  notes?: string;
  // Note: Status removed from create - always starts as Draft
  // Note: CreatedByUserId set automatically from JWT
}

interface UpdateProjectDto {
  projectName: string;
  customer: string;
  currency: string;
  defaultMargin: number;
  notes?: string;
  // Note: Status removed - use dedicated ChangeStatus endpoint
}

interface ChangeStatusDto {
  newStatus: EntityStatus;
}

interface AddCollaboratorDto {
  userId: string;      // GUID
  roleInProject?: string;  // Optional role description
}

interface CollaboratorDto {
  id: number;
  userId: string;
  userName: string | null;
  roleInProject: string | null;
  addedAt: string;
}
```

### Updated Panel Types

```typescript
interface PanelDto {
  panelId: number;
  panelName: string;
  description: string | null;
  projectId: number;
  overrideMargin: number | null;
  status: EntityStatus;           // NEW
  itemCount: number;
  createdByUserId: string | null;  // NEW
  ownerId: string | null;          // NEW
}

interface PanelDetailDto {
  panelId: number;
  panelName: string;
  description: string | null;
  projectId: number;
  overrideMargin: number | null;
  status: EntityStatus;
  createdByUserId: string | null;
  ownerId: string | null;
  items: PanelItemDto[];
  collaborators: CollaboratorDto[];  // NEW
  summary: PanelSummaryDto;
}
```

---

## 🌐 API Endpoints

### Updated Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/projects` | Get accessible projects (filtered by role/ownership) | Yes |
| `GET` | `/api/projects/{id}` | Get project detail (access checked) | Yes |
| `POST` | `/api/projects` | Create project (auto-assigns owner) | Yes |
| `PUT` | `/api/projects/{id}` | Update project | Yes |
| `DELETE` | `/api/projects/{id}` | **Soft delete** project | Yes |
| `PUT` | `/api/projects/{id}/status` | Change project status | Yes (Manager+) |
| `POST` | `/api/projects/{id}/collaborators` | Add collaborator | Yes (Manager+) |
| `DELETE` | `/api/projects/{id}/collaborators/{userId}` | Remove collaborator | Yes (Manager+) |

### Updated Panel Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/panels/project/{projectId}` | Get panels by project | Yes |
| `GET` | `/api/panels/{id}` | Get panel detail (access checked) | Yes |
| `POST` | `/api/panels` | Create panel (auto-assigns owner) | Yes |
| `PUT` | `/api/panels/{id}` | Update panel | Yes |
| `DELETE` | `/api/panels/{id}` | **Soft delete** panel | Yes |
| `POST` | `/api/panels/{id}/duplicate` | **Duplicate** panel with items | Yes |
| `PUT` | `/api/panels/{id}/status` | Change panel status | Yes (Manager+) |
| `POST` | `/api/panels/{id}/collaborators` | Add collaborator | Yes (Manager+) |
| `DELETE` | `/api/panels/{id}/collaborators/{userId}` | Remove collaborator | Yes (Manager+) |

---

## 📄 UI Changes Required

### 1. Project Card Updates

Add to each project card:
- **Status badge** (colored by EntityStatus)
- **Owner indicator** (avatar/initials of creator)
- **Collaborator count** badge

### 2. Panel Designer Updates

Add to panel tabs:
- **Status badge** next to panel name
- **Duplicate button** (📋 icon) on each panel tab
- **Collaborators button** to manage panel collaborators

### 3. Status Change UI

**Status Change Dropdown** (on project/panel detail views):
```
┌─────────────────────────────┐
│  Status: [Draft ▼]          │
│  ┌───────────────────────┐  │
│  │ ⚪ Draft               │  │
│  │ 🔵 In Progress         │  │
│  │ 🟠 Under Review        │  │
│  │ ✅ Approved            │  │
│  │ ❌ Rejected            │  │
│  │ 🟢 Completed           │  │
│  │ 📦 Archived            │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Only visible to**: SuperAdmin, TenderingManager, or the project/panel creator.

### 4. Collaborator Management Modal

```
┌──────────────────────────────────────────┐
│  Collaborators for "Project Name"         │
├──────────────────────────────────────────┤
│                                          │
│  [Search users...              ] [Add]   │
│                                          │
│  👤 John Doe (Engineer)        [Remove]  │
│  👤 Jane Smith                 [Remove]  │
│  👤 Bob Wilson (Reviewer)      [Remove]  │
│                                          │
│                          [Close]         │
└──────────────────────────────────────────┘
```

### 5. Panel Duplicate Action

- Button in panel tab context menu or toolbar
- Confirmation dialog: "Duplicate 'Panel Name'? This will copy all materials and quantities."
- On success: Navigate to the new duplicated panel tab
- New panel name: "{Original Name} (Copy)"

### 6. Soft Delete Confirmation

```
┌──────────────────────────────────────────┐
│  ⚠️ Delete Project                        │
│                                          │
│  Are you sure you want to delete         │
│  "Project Name"?                         │
│                                          │
│  This action can be reversed by an       │
│  administrator.                          │
│                                          │
│           [Cancel]  [Delete]             │
└──────────────────────────────────────────┘
```

---

## 🔒 Visibility Rules

### What Users See

| Role | Projects Visible | Panels Visible |
|------|-----------------|----------------|
| **SuperAdmin** | All projects | All panels |
| **TenderingManager** | All projects | All panels |
| **TenderingEngineer** | Own + Collaborated | Panels in accessible projects + Own |

### Frontend Implementation

```typescript
// The API already handles filtering - GET /api/projects returns only accessible projects
// But the frontend should hide certain UI elements based on ownership:

const canChangeStatus = (project: ProjectDto) => {
  return hasRole('SuperAdmin') || 
         hasRole('TenderingManager') || 
         project.createdByUserId === currentUser.id;
};

const canManageCollaborators = (project: ProjectDto) => {
  return hasRole('SuperAdmin') || hasRole('TenderingManager');
};

const canDeleteProject = (project: ProjectDto) => {
  return hasRole('SuperAdmin') || 
         hasRole('TenderingManager') || 
         project.createdByUserId === currentUser.id;
};

const canDuplicatePanel = () => {
  return hasPermission('Panels.Duplicate');
};
```

---

## 🚀 API Service Updates

```typescript
// Updated projectService
export const projectService = {
  // ... existing methods ...
  
  changeStatus: (id: number, dto: ChangeStatusDto) =>
    api.put<ProjectDto>(`/api/projects/${id}/status`, dto),
  
  addCollaborator: (id: number, dto: AddCollaboratorDto) =>
    api.post<CollaboratorDto>(`/api/projects/${id}/collaborators`, dto),
  
  removeCollaborator: (id: number, userId: string) =>
    api.delete(`/api/projects/${id}/collaborators/${userId}`),
};

// Updated panelService
export const panelService = {
  // ... existing methods ...
  
  duplicate: (id: number) =>
    api.post<PanelDto>(`/api/panels/${id}/duplicate`),
  
  changeStatus: (id: number, dto: ChangeStatusDto) =>
    api.put<PanelDto>(`/api/panels/${id}/status`, dto),
  
  addCollaborator: (id: number, dto: AddCollaboratorDto) =>
    api.post<CollaboratorDto>(`/api/panels/${id}/collaborators`, dto),
  
  removeCollaborator: (id: number, userId: string) =>
    api.delete(`/api/panels/${id}/collaborators/${userId}`),
};
```

---

## 📱 React Query Hooks

```typescript
// Status change
const useChangeProjectStatus = () => useMutation({
  mutationFn: ({ id, dto }: { id: number; dto: ChangeStatusDto }) =>
    projectService.changeStatus(id, dto),
  onSuccess: () => queryClient.invalidateQueries(['projects'])
});

// Duplicate panel
const useDuplicatePanel = () => useMutation({
  mutationFn: (panelId: number) => panelService.duplicate(panelId),
  onSuccess: (_, panelId) => {
    queryClient.invalidateQueries(['panels']);
    // Show success toast
  }
});

// Collaborators
const useAddProjectCollaborator = () => useMutation({
  mutationFn: ({ projectId, dto }: { projectId: number; dto: AddCollaboratorDto }) =>
    projectService.addCollaborator(projectId, dto),
  onSuccess: (_, { projectId }) =>
    queryClient.invalidateQueries(['projects', projectId])
});

const useRemoveProjectCollaborator = () => useMutation({
  mutationFn: ({ projectId, userId }: { projectId: number; userId: string }) =>
    projectService.removeCollaborator(projectId, userId),
  onSuccess: (_, { projectId }) =>
    queryClient.invalidateQueries(['projects', projectId])
});
```

---

## ✅ Implementation Checklist

### Status Management
- [ ] Add EntityStatus enum
- [ ] Update ProjectDto and PanelDto interfaces
- [ ] Status badge component with colors
- [ ] Status change dropdown (authorized users only)
- [ ] Status change API integration

### Soft Delete
- [ ] Update delete confirmation dialog
- [ ] Remove deleted items from UI after delete
- [ ] Show "can be recovered" message

### Panel Duplication
- [ ] Add duplicate button to panel tabs
- [ ] Duplicate confirmation dialog
- [ ] Navigate to new panel after duplication
- [ ] Success toast notification

### Collaboration
- [ ] Collaborator management modal
- [ ] User search/select for adding collaborators
- [ ] Collaborator list with remove action
- [ ] Collaborator count badge on cards
- [ ] API integration

### Visibility
- [ ] Projects page filters correctly (API handles this)
- [ ] Hide admin actions for unauthorized users
- [ ] Show owner/collaborator indicators

---

## 📝 Important Notes

1. **Status is now an integer enum**, not a string. Map accordingly.
2. **Delete is soft delete** — projects/panels are hidden, not removed.
3. **CreatedByUserId** is auto-set from the JWT token — don't send it from frontend.
4. **GET /api/projects** already returns only accessible projects based on the authenticated user's role.
5. **403 Forbidden** is returned if a user tries to access a project/panel they don't have rights to.
