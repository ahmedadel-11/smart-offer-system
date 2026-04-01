import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { CreateProject, UpdateProject, EntityStatus, ChangeStatusDto, AddCollaboratorDto } from '../types';

export const PROJECTS_QUERY_KEY = 'projects';

export function useProjects() {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY],
    queryFn: () => projectService.getAll(),
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id],
    queryFn: () => projectService.getById(id),
    enabled: id > 0,
  });
}

export function useProjectSummary(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id, 'summary'],
    queryFn: () => projectService.getSummary(id),
    enabled: id > 0,
  });
}

export function useProjectsByCustomer(customer: string) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, 'customer', customer],
    queryFn: () => projectService.getByCustomer(customer),
    enabled: !!customer,
  });
}

export function useProjectsByStatus(status: EntityStatus) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, 'status', status],
    queryFn: () => projectService.getByStatus(status),
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, 'customers'],
    queryFn: () => projectService.getCustomers(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProject) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
}

export function useCreateProjectWithPanels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProject) => projectService.createWithPanels(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProject }) =>
      projectService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
}

export function useExportProject() {
  return useMutation({
    mutationFn: (id: number) => projectService.exportToExcel(id),
  });
}

// Status change
export function useChangeProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ChangeStatusDto }) =>
      projectService.changeStatus(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, id] });
    },
  });
}

// Collaborator management
export function useAddProjectCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, dto }: { projectId: number; dto: AddCollaboratorDto }) =>
      projectService.addCollaborator(projectId, dto),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, projectId] });
    },
  });
}

export function useRemoveProjectCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: number; userId: string }) =>
      projectService.removeCollaborator(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, projectId] });
    },
  });
}

// =====================
// Material List & Pricing Hooks
// =====================

export function useProjectMaterialList(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id, 'material-list'],
    queryFn: () => projectService.getMaterialList(id),
    enabled: id > 0,
  });
}

export function useProjectTotalPrice(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id, 'total-price'],
    queryFn: () => projectService.getTotalPrice(id),
    enabled: id > 0,
  });
}

// =====================
// Project Workflow Hooks
// =====================

export function useLockProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectService.lock(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, id] });
    },
  });
}

export function useUnlockProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectService.unlock(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, id] });
    },
  });
}

export function useCloneProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectService.clone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
    },
  });
}

// =====================
// Changelog & Versions Hooks
// =====================

export function useProjectChangelog(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id, 'changelog'],
    queryFn: () => projectService.getChangelog(id),
    enabled: id > 0,
  });
}

export function useProjectVersions(id: number) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id, 'versions'],
    queryFn: () => projectService.getVersions(id),
    enabled: id > 0,
  });
}

// =====================
// Search Hook
// =====================

export function useSearchProjects(term: string) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, 'search', term],
    queryFn: () => projectService.search(term),
    enabled: term.length >= 2,
  });
}

// =====================
// Export Hooks
// =====================

export function useExportProjectMaterialList() {
  return useMutation({
    mutationFn: (id: number) => projectService.exportMaterialList(id),
  });
}

export function useExportOffer() {
  return useMutation({
    mutationFn: (id: number) => projectService.exportOffer(id),
  });
}

export function useExportTechnicalOfferPdf() {
  return useMutation({
    mutationFn: (id: number) => projectService.exportTechnicalOfferPdf(id),
  });
}

export function useExportCommercialOfferPdf() {
  return useMutation({
    mutationFn: (id: number) => projectService.exportCommercialOfferPdf(id),
  });
}
