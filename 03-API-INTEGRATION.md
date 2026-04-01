# SmartOffer Frontend - API Integration

## ?? API Configuration

### Axios Setup
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## ?? Materials API Service

```typescript
// src/services/materialService.ts
import { apiClient } from './api';
import { Material, CreateMaterial, UpdateMaterial, MaterialSearchFilters } from '../types';

const ENDPOINT = '/materials';

export const materialService = {
  // Get all materials
  async getAll(): Promise<Material[]> {
    const response = await apiClient.get<Material[]>(ENDPOINT);
    return response.data;
  },

  // Get material by ID
  async getById(id: number): Promise<Material> {
    const response = await apiClient.get<Material>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Search materials
  async search(term: string): Promise<Material[]> {
    const response = await apiClient.get<Material[]>(`${ENDPOINT}/search`, {
      params: { term }
    });
    return response.data;
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${ENDPOINT}/categories`);
    return response.data;
  },

  // Get all brands
  async getBrands(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${ENDPOINT}/brands`);
    return response.data;
  },

  // Get materials by category
  async getByCategory(category: string): Promise<Material[]> {
    const response = await apiClient.get<Material[]>(`${ENDPOINT}/category/${encodeURIComponent(category)}`);
    return response.data;
  },

  // Create new material
  async create(data: CreateMaterial): Promise<Material> {
    const response = await apiClient.post<Material>(ENDPOINT, data);
    return response.data;
  },

  // Update material
  async update(id: number, data: UpdateMaterial): Promise<Material> {
    const response = await apiClient.put<Material>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete material
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  // Advanced search with filters
  async advancedSearch(filters: MaterialSearchFilters): Promise<Material[]> {
    // Client-side filtering since backend may not have all filter options
    const allMaterials = await this.getAll();
    
    return allMaterials.filter(material => {
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          material.itemCode.toLowerCase().includes(term) ||
          material.description.toLowerCase().includes(term) ||
          material.brand?.toLowerCase().includes(term) ||
          material.reference?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      
      if (filters.category && material.category !== filters.category) return false;
      if (filters.brand && material.brand !== filters.brand) return false;
      if (filters.description && !material.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
      if (filters.ratedCurrent && material.ratedCurrent !== filters.ratedCurrent) return false;
      if (filters.isc && material.isc !== filters.isc) return false;
      if (filters.reference && !material.reference?.toLowerCase().includes(filters.reference.toLowerCase())) return false;
      if (filters.isActive !== undefined && material.isActive !== filters.isActive) return false;
      
      return true;
    });
  }
};
```

---

## ?? Projects API Service

```typescript
// src/services/projectService.ts
import { apiClient } from './api';
import { 
  Project, 
  ProjectDetail, 
  ProjectSummary, 
  CreateProject, 
  UpdateProject 
} from '../types';

const ENDPOINT = '/projects';

export const projectService = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(ENDPOINT);
    return response.data;
  },

  // Get project details with panels
  async getById(id: number): Promise<ProjectDetail> {
    const response = await apiClient.get<ProjectDetail>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Get project summary
  async getSummary(id: number): Promise<ProjectSummary> {
    const response = await apiClient.get<ProjectSummary>(`${ENDPOINT}/${id}/summary`);
    return response.data;
  },

  // Get projects by customer
  async getByCustomer(customer: string): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(`${ENDPOINT}/customer/${encodeURIComponent(customer)}`);
    return response.data;
  },

  // Get projects by status
  async getByStatus(status: string): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(`${ENDPOINT}/status/${status}`);
    return response.data;
  },

  // Create new project
  async create(data: CreateProject): Promise<Project> {
    const response = await apiClient.post<Project>(ENDPOINT, data);
    return response.data;
  },

  // Update project
  async update(id: number, data: UpdateProject): Promise<Project> {
    const response = await apiClient.put<Project>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete project
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  // Export project to Excel
  async exportToExcel(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Create project with panels
  async createWithPanels(data: CreateProject, panelCount: number): Promise<ProjectDetail> {
    // First create the project
    const project = await this.create(data);
    
    // Then create the specified number of panels
    const { panelService } = await import('./panelService');
    
    for (let i = 1; i <= panelCount; i++) {
      await panelService.create({
        projectId: project.projectId,
        panelName: `Panel ${i}`,
        description: `Panel ${i} of ${panelCount}`
      });
    }
    
    // Return the project with panels
    return this.getById(project.projectId);
  }
};
```

---

## ?? Panels API Service

```typescript
// src/services/panelService.ts
import { apiClient } from './api';
import { Panel, PanelDetail, PanelSummary, CreatePanel, UpdatePanel } from '../types';

const ENDPOINT = '/panels';

export const panelService = {
  // Get panels by project
  async getByProject(projectId: number): Promise<Panel[]> {
    const response = await apiClient.get<Panel[]>(`${ENDPOINT}/project/${projectId}`);
    return response.data;
  },

  // Get panel details with items
  async getById(id: number): Promise<PanelDetail> {
    const response = await apiClient.get<PanelDetail>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Get panel summary
  async getSummary(id: number): Promise<PanelSummary> {
    const response = await apiClient.get<PanelSummary>(`${ENDPOINT}/${id}/summary`);
    return response.data;
  },

  // Create new panel
  async create(data: CreatePanel): Promise<Panel> {
    const response = await apiClient.post<Panel>(ENDPOINT, data);
    return response.data;
  },

  // Update panel
  async update(id: number, data: UpdatePanel): Promise<Panel> {
    const response = await apiClient.put<Panel>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete panel
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  // Duplicate panel
  async duplicate(id: number, newName: string): Promise<Panel> {
    const panel = await this.getById(id);
    const { panelItemService } = await import('./panelItemService');
    
    // Create new panel
    const newPanel = await this.create({
      projectId: panel.projectId,
      panelName: newName,
      description: `Copy of ${panel.panelName}`,
      overrideMargin: panel.overrideMargin ?? undefined
    });
    
    // Copy all items
    for (const item of panel.items) {
      await panelItemService.create({
        panelId: newPanel.panelId,
        materialId: item.materialId,
        quantity: item.quantity,
        itemType: item.itemType,
        extraDiscount: item.extraDiscount ?? undefined,
        notes: item.notes ?? undefined
      });
    }
    
    return newPanel;
  }
};
```

---

## ?? Panel Items API Service

```typescript
// src/services/panelItemService.ts
import { apiClient } from './api';
import { PanelItem, CreatePanelItem, UpdatePanelItem, PanelItemType } from '../types';

const ENDPOINT = '/panelitems';

export const panelItemService = {
  // Get items by panel
  async getByPanel(panelId: number): Promise<PanelItem[]> {
    const response = await apiClient.get<PanelItem[]>(`${ENDPOINT}/panel/${panelId}`);
    return response.data;
  },

  // Get items by panel and type
  async getByPanelAndType(panelId: number, itemType: PanelItemType): Promise<PanelItem[]> {
    const response = await apiClient.get<PanelItem[]>(`${ENDPOINT}/panel/${panelId}/type/${itemType}`);
    return response.data;
  },

  // Get all item types
  async getItemTypes(): Promise<Array<{ value: number; name: string; description: string }>> {
    const response = await apiClient.get(`${ENDPOINT}/types`);
    return response.data;
  },

  // Get item by ID
  async getById(id: number): Promise<PanelItem> {
    const response = await apiClient.get<PanelItem>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Create new panel item
  async create(data: CreatePanelItem): Promise<PanelItem> {
    const response = await apiClient.post<PanelItem>(ENDPOINT, data);
    return response.data;
  },

  // Update panel item
  async update(id: number, data: UpdatePanelItem): Promise<PanelItem> {
    const response = await apiClient.put<PanelItem>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete panel item
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  // Update item type (for drag and drop)
  async updateItemType(id: number, newType: PanelItemType): Promise<PanelItem> {
    const item = await this.getById(id);
    return this.update(id, {
      quantity: item.quantity,
      itemType: newType,
      overrideDiscount: item.discount,
      overrideMargin: item.margin,
      extraDiscount: item.extraDiscount ?? undefined,
      notes: item.notes ?? undefined
    });
  },

  // Bulk update item types
  async bulkUpdateItemTypes(items: Array<{ id: number; type: PanelItemType }>): Promise<void> {
    await Promise.all(
      items.map(item => this.updateItemType(item.id, item.type))
    );
  },

  // Add material to panel
  async addMaterialToPanel(
    panelId: number, 
    materialId: number, 
    quantity: number = 1,
    itemType: PanelItemType = PanelItemType.Outgoing
  ): Promise<PanelItem> {
    return this.create({
      panelId,
      materialId,
      quantity,
      itemType
    });
  }
};
```

---

## ?? Import API Service

```typescript
// src/services/importService.ts
import { apiClient } from './api';
import { ImportResult } from '../types';

const ENDPOINT = '/import';

export const importService = {
  // Import materials from Excel
  async importMaterials(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ImportResult>(`${ENDPOINT}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Import project from Excel
  async importProject(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ImportResult>(`${ENDPOINT}/project`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Download materials template
  async downloadMaterialsTemplate(): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/materials/template`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download project template
  async downloadProjectTemplate(): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/project/template`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
```

---

## ?? React Query Hooks

```typescript
// src/hooks/useMaterials.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '../services/materialService';
import { CreateMaterial, UpdateMaterial, MaterialSearchFilters } from '../types';

export const MATERIALS_QUERY_KEY = 'materials';

export function useMaterials() {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY],
    queryFn: materialService.getAll
  });
}

export function useMaterial(id: number) {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, id],
    queryFn: () => materialService.getById(id),
    enabled: !!id
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, 'categories'],
    queryFn: materialService.getCategories
  });
}

export function useBrands() {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, 'brands'],
    queryFn: materialService.getBrands
  });
}

export function useMaterialsByCategory(category: string) {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, 'category', category],
    queryFn: () => materialService.getByCategory(category),
    enabled: !!category
  });
}

export function useMaterialSearch(filters: MaterialSearchFilters) {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, 'search', filters],
    queryFn: () => materialService.advancedSearch(filters),
    enabled: Object.keys(filters).length > 0
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMaterial) => materialService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
    }
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMaterial }) => 
      materialService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
    }
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => materialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
    }
  });
}
```

```typescript
// src/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { CreateProject, UpdateProject } from '../types';

export const PROJECTS_QUERY_KEY = 'projects';

export function useProjects() {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY],
    queryFn: projectService.getAll
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id],
    queryFn: () => projectService.getById(id),
    enabled: !!id
  });
}

export function useProjectSummary(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id, 'summary'],
    queryFn: () => projectService.getSummary(id),
    enabled: !!id
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, panelCount }: { data: CreateProject; panelCount?: number }) => 
      panelCount ? projectService.createWithPanels(data, panelCount) : projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProject }) => 
      projectService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, variables.id] });
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    }
  });
}
```

```typescript
// src/hooks/usePanelItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panelItemService } from '../services/panelItemService';
import { CreatePanelItem, UpdatePanelItem, PanelItemType } from '../types';

export const PANEL_ITEMS_QUERY_KEY = 'panelItems';

export function usePanelItems(panelId: number) {
  return useQuery({
    queryKey: [PANEL_ITEMS_QUERY_KEY, panelId],
    queryFn: () => panelItemService.getByPanel(panelId),
    enabled: !!panelId
  });
}

export function useUpdatePanelItemType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, type }: { id: number; type: PanelItemType }) => 
      panelItemService.updateItemType(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY] });
    }
  });
}

export function useAddMaterialToPanel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ panelId, materialId, quantity, itemType }: {
      panelId: number;
      materialId: number;
      quantity?: number;
      itemType?: PanelItemType;
    }) => panelItemService.addMaterialToPanel(panelId, materialId, quantity, itemType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, variables.panelId] });
    }
  });
}
```

---

## ??? Utility Functions

```typescript
// src/utils/download.ts
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function downloadExcel(blob: Blob, filename: string): void {
  downloadBlob(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function downloadPdf(blob: Blob, filename: string): void {
  downloadBlob(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
```

---

**Next**: See `04-COMPONENTS.md` for UI component specifications.
