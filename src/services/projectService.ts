import { apiClient } from './api';
import {
  Project,
  ProjectDetail,
  ProjectSummary,
  CreateProject,
  UpdateProject,
  ChangeStatusDto,
  AddCollaboratorDto,
  CollaboratorDto,
  ProjectMaterialList,
  ProjectTotalPrice,
  AuditLogDto,
} from '../types';

const ENDPOINT = '/projects';

export const projectService = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(ENDPOINT);
    return response.data;
  },

  // Get project by ID with panels
  async getById(id: number): Promise<ProjectDetail> {
    const response = await apiClient.get<ProjectDetail>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Get project summary (pricing)
  async getSummary(id: number): Promise<ProjectSummary> {
    const response = await apiClient.get<ProjectSummary>(`${ENDPOINT}/${id}/summary`);
    return response.data;
  },

  // Get projects by customer
  async getByCustomer(customer: string): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(
      `${ENDPOINT}/customer/${encodeURIComponent(customer)}`
    );
    return response.data;
  },

  // Get projects by status
  async getByStatus(status: number): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(`${ENDPOINT}/status/${status}`);
    return response.data;
  },

  // Create project
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
      responseType: 'blob',
    });
    return response.data;
  },

  // Export project summary to Excel
  async exportSummary(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export-summary`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Create project with panels
  async createWithPanels(
    data: CreateProject
  ): Promise<ProjectDetail> {
    // First create the project
    const project = await this.create(data);

    // Then create the specified number of panels
    const { panelService } = await import('./panelService');
    const panelPromises = [];
    
    for (let i = 1; i <= data.numberOfPanels; i++) {
      panelPromises.push(
        panelService.create({
          projectId: project.projectId,
          panelName: `Panel ${i}`,
          margin: 20, // Default margin
        })
      );
    }

    await Promise.all(panelPromises);

    // Fetch and return the complete project with panels
    return this.getById(project.projectId);
  },

  // Get unique customers
  async getCustomers(): Promise<string[]> {
    const projects = await this.getAll();
    const customers = [...new Set(projects.map((p) => p.customer))];
    return customers.sort();
  },

  // Change project status
  async changeStatus(id: number, dto: ChangeStatusDto): Promise<Project> {
    const response = await apiClient.put<Project>(`${ENDPOINT}/${id}/status`, dto);
    return response.data;
  },

  // Add collaborator to project
  async addCollaborator(id: number, dto: AddCollaboratorDto): Promise<CollaboratorDto> {
    const response = await apiClient.post<CollaboratorDto>(`${ENDPOINT}/${id}/collaborators`, dto);
    return response.data;
  },

  // Remove collaborator from project
  async removeCollaborator(id: number, userId: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}/collaborators/${userId}`);
  },

  // Get project material list (per-panel + consolidated)
  async getMaterialList(id: number): Promise<ProjectMaterialList> {
    const response = await apiClient.get<ProjectMaterialList>(`${ENDPOINT}/${id}/material-list`);
    return response.data;
  },

  // Get project total price summary
  async getTotalPrice(id: number): Promise<ProjectTotalPrice> {
    const response = await apiClient.get<ProjectTotalPrice>(`${ENDPOINT}/${id}/total-price`);
    return response.data;
  },

  // Lock project
  async lock(id: number): Promise<Project> {
    const response = await apiClient.post<Project>(`${ENDPOINT}/${id}/lock`);
    return response.data;
  },

  // Unlock project
  async unlock(id: number): Promise<Project> {
    const response = await apiClient.post<Project>(`${ENDPOINT}/${id}/unlock`);
    return response.data;
  },

  // Clone project (deep copy)
  async clone(id: number): Promise<Project> {
    const response = await apiClient.post<Project>(`${ENDPOINT}/${id}/clone`);
    return response.data;
  },

  // Get project changelog (audit trail)
  async getChangelog(id: number): Promise<AuditLogDto[]> {
    const response = await apiClient.get<AuditLogDto[]>(`${ENDPOINT}/${id}/changelog`);
    return response.data;
  },

  // Get project version history
  async getVersions(id: number): Promise<AuditLogDto[]> {
    const response = await apiClient.get<AuditLogDto[]>(`${ENDPOINT}/${id}/versions`);
    return response.data;
  },

  // Search projects (full-text)
  async search(term: string): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(`${ENDPOINT}/search`, {
      params: { q: term },
    });
    return response.data;
  },

  // Export project material list (Excel)
  async exportMaterialList(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export-material-list`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export offer / quotation (Excel)
  async exportOffer(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export-offer`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export Technical Offer (PDF) — backend-generated
  async exportTechnicalOfferPdf(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export-technical-offer`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export Commercial Offer (PDF) — backend-generated
  async exportCommercialOfferPdf(id: number): Promise<Blob> {
    const response = await apiClient.get(`${ENDPOINT}/${id}/export-commercial-offer`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default projectService;
