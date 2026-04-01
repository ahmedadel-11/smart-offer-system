import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panelService } from '../services/panelService';
import { CreatePanel, UpdatePanel, ChangeStatusDto, AddCollaboratorDto } from '../types';
import toast from 'react-hot-toast';

function handlePanelError(error: any, fallbackMsg: string) {
  const message = error?.response?.status === 403
    ? 'You do not have permission to perform this action'
    : error?.response?.data?.message || fallbackMsg;
  toast.error(message);
}
import { PROJECTS_QUERY_KEY } from './useProjects';

export const PANELS_QUERY_KEY = 'panels';

export function usePanelsByProject(projectId: number) {
  return useQuery({
    queryKey: [PANELS_QUERY_KEY, 'project', projectId],
    queryFn: () => panelService.getByProject(projectId),
    enabled: projectId > 0,
  });
}

export function usePanel(id: number) {
  return useQuery({
    queryKey: [PANELS_QUERY_KEY, id],
    queryFn: () => panelService.getById(id),
    enabled: id > 0,
  });
}

export function usePanelSummary(id: number) {
  return useQuery({
    queryKey: [PANELS_QUERY_KEY, id, 'summary'],
    queryFn: () => panelService.getSummary(id),
    enabled: id > 0,
  });
}

export function useProjectPanelsWithDetails(projectId: number) {
  return useQuery({
    queryKey: [PANELS_QUERY_KEY, 'project', projectId, 'details'],
    queryFn: () => panelService.getProjectPanelsWithDetails(projectId),
    enabled: projectId > 0,
  });
}

export function useCreatePanel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePanel) => panelService.create(data),
    onSuccess: (newPanel) => {
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, 'project', newPanel.projectId] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, newPanel.projectId] });
    },
    onError: (error: any) => handlePanelError(error, 'Failed to create panel'),
  });
}

export function useUpdatePanel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePanel }) => panelService.update(id, data),
    onSuccess: async (panel) => {
      // Optimistically update the panel name inside the project detail cache
      // so the tab strip reflects the new name immediately, without waiting for a refetch.
      queryClient.setQueryData([PROJECTS_QUERY_KEY, panel.projectId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          panels: (old.panels ?? []).map((p: any) =>
            p.panelId === panel.panelId ? { ...p, panelName: panel.panelName } : p
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, panel.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, 'project', panel.projectId] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, panel.projectId] });
    },
    onError: (error: any) => handlePanelError(error, 'Failed to update panel'),
  });
}

export function useDeletePanel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const panel = await panelService.getById(id);
      await panelService.delete(id);
      return panel;
    },
    onSuccess: (panel) => {
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, panel.projectId] });
    },
    onError: (error: any) => handlePanelError(error, 'Failed to delete panel'),
  });
}

export function useDuplicatePanel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (panelId: number) => panelService.duplicate(panelId),
    onSuccess: (panel) => {
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, 'project', panel.projectId] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, panel.projectId] });
    },
    onError: (error: any) => handlePanelError(error, 'Failed to duplicate panel'),
  });
}

// Panel status change
export function useChangePanelStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ChangeStatusDto }) =>
      panelService.changeStatus(id, dto),
    onSuccess: (panel) => {
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, panel.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, 'project', panel.projectId] });
      // Also invalidate the project query so panel tabs update their status badges
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, panel.projectId] });
    },
    onError: (error: any) => handlePanelError(error, 'Failed to change panel status'),
  });
}

// Panel collaborator management
export function useAddPanelCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ panelId, dto }: { panelId: number; dto: AddCollaboratorDto }) =>
      panelService.addCollaborator(panelId, dto),
    onSuccess: (_, { panelId }) => {
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, panelId] });
    },
    onError: (error: any) => handlePanelError(error, 'Failed to add collaborator'),
  });
}

export function useRemovePanelCollaborator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ panelId, userId }: { panelId: number; userId: string }) =>
      panelService.removeCollaborator(panelId, userId),
    onSuccess: (_, { panelId }) => {
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, panelId] });
    },
    onError: (error: any) => handlePanelError(error, 'Failed to remove collaborator'),
  });
}

// =====================
// Panel Material List Hooks
// =====================

export function usePanelMaterialList(id: number) {
  return useQuery({
    queryKey: [PANELS_QUERY_KEY, id, 'material-list'],
    queryFn: () => panelService.getMaterialList(id),
    enabled: id > 0,
  });
}

export function useExportPanelMaterialList() {
  return useMutation({
    mutationFn: (id: number) => panelService.exportMaterialList(id),
  });
}
