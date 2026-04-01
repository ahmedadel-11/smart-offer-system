import { apiClient } from './api';
import {
  Panel,
  PanelDetail,
  PanelSummary,
  CreatePanel,
  UpdatePanel,
  ChangeStatusDto,
  AddCollaboratorDto,
  CollaboratorDto,
  PanelMaterialList,
} from '../types';

const ENDPOINT = '/panels';

export const panelService = {
  // Get panels by project
  async getByProject(projectId: number): Promise<Panel[]> {
    const response = await apiClient.get<Panel[]>(`${ENDPOINT}/project/${projectId}`);
    return response.data;
  },

  // Get panel by ID with items
  async getById(id: number): Promise<PanelDetail> {
    const response = await apiClient.get<PanelDetail>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Get panel summary
  async getSummary(id: number): Promise<PanelSummary> {
    const response = await apiClient.get<PanelSummary>(`${ENDPOINT}/${id}/summary`);
    return response.data;
  },

  // Create panel
  async create(data: CreatePanel): Promise<Panel> {
    const response = await apiClient.post<Panel>(ENDPOINT, data);
    return response.data;
  },

  // Update panel
  async update(id: number, data: UpdatePanel): Promise<Panel> {
    const response = await apiClient.put<Panel>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete panel (soft delete)
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  // Get all panels for a project with full details
  async getProjectPanelsWithDetails(projectId: number): Promise<PanelDetail[]> {
    const panels = await this.getByProject(projectId);
    const detailPromises = panels.map((panel) => this.getById(panel.panelId));
    return Promise.all(detailPromises);
  },

  // Duplicate panel (backend handles copying items)
  async duplicate(panelId: number): Promise<Panel> {
    const response = await apiClient.post<Panel>(`${ENDPOINT}/${panelId}/duplicate`);
    return response.data;
  },

  // Change panel status
  async changeStatus(id: number, dto: ChangeStatusDto): Promise<Panel> {
    const response = await apiClient.put<Panel>(`${ENDPOINT}/${id}/status`, dto);
    return response.data;
  },

  // Add collaborator to panel
  async addCollaborator(id: number, dto: AddCollaboratorDto): Promise<CollaboratorDto> {
    const response = await apiClient.post<CollaboratorDto>(`${ENDPOINT}/${id}/collaborators`, dto);
    return response.data;
  },

  // Remove collaborator from panel
  async removeCollaborator(id: number, userId: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}/collaborators/${userId}`);
  },

  // Export panel to Excel
  async exportToExcel(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get panel material list with pricing
  async getMaterialList(id: number): Promise<PanelMaterialList> {
    const response = await apiClient.get<PanelMaterialList>(`${ENDPOINT}/${id}/material-list`);
    return response.data;
  },

  // Export panel material list (Excel)
  async exportMaterialList(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export-material-list`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default panelService;
