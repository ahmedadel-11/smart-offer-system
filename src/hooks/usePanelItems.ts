import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panelItemService } from '../services/panelItemService';
import {
  CreatePanelItem,
  UpdatePanelItem,
  PanelItemType,
  BusbarCablesWorksheetInput,
} from '../types';
import toast from 'react-hot-toast';

function handleMutationError(error: any, fallbackMsg: string) {
  const message = error?.response?.status === 403
    ? 'You do not have permission to perform this action'
    : error?.response?.data?.message || fallbackMsg;
  toast.error(message);
}
import { PANELS_QUERY_KEY } from './usePanels';

export const PANEL_ITEMS_QUERY_KEY = 'panelItems';
export const BUSBAR_CABLES_QUERY_KEY = 'busbarCables';

export function usePanelItems(panelId: number) {
  return useQuery({
    queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', panelId],
    queryFn: () => panelItemService.getByPanel(panelId),
    enabled: panelId > 0,
  });
}

export function usePanelItemsByType(panelId: number, itemType: PanelItemType) {
  return useQuery({
    queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', panelId, 'type', itemType],
    queryFn: () => panelItemService.getByPanelAndType(panelId, itemType),
    enabled: panelId > 0,
  });
}

export function usePanelItem(id: number) {
  return useQuery({
    queryKey: [PANEL_ITEMS_QUERY_KEY, id],
    queryFn: () => panelItemService.getById(id),
    enabled: id > 0,
  });
}

export function useGroupedPanelItems(panelId: number) {
  return useQuery({
    queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', panelId, 'grouped'],
    queryFn: () => panelItemService.getGroupedByType(panelId),
    enabled: panelId > 0,
  });
}

export function useItemTypes() {
  return useQuery({
    queryKey: [PANEL_ITEMS_QUERY_KEY, 'types'],
    queryFn: () => panelItemService.getItemTypes(),
  });
}

export function useCreatePanelItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePanelItem) => panelItemService.create(data),
    onSuccess: (_, { panelId }) => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', panelId] });
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, panelId] });
    },
    onError: (error: any) => handleMutationError(error, 'Failed to create panel item'),
  });
}

export function useUpdatePanelItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePanelItem }) =>
      panelItemService.update(id, data),
    onSuccess: async (item) => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', item.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, item.panelItemId] });
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, item.panelId] });
    },
    onError: (error: any) => handleMutationError(error, 'Failed to update panel item'),
  });
}

export function useUpdatePanelItemType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newType }: { id: number; newType: PanelItemType | null }) =>
      panelItemService.updateItemType(id, newType),
    onSuccess: async (item) => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', item.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, item.panelId] });
    },
    onError: (error: any) => handleMutationError(error, 'Failed to update item type'),
  });
}

export function useBulkUpdatePanelItemTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: number; itemType: PanelItemType | null; sortOrder?: number }[]) =>
      panelItemService.bulkUpdateItemTypes(items),
    onSuccess: (items) => {
      if (items.length > 0) {
        const panelId = items[0].panelId;
        queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', panelId] });
        queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, panelId] });
      }
    },
    onError: (error: any) => handleMutationError(error, 'Failed to update item types'),
  });
}

export function useDeletePanelItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const item = await panelItemService.getById(id);
      await panelItemService.delete(id);
      return item;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', item.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, item.panelId] });
    },
    onError: (error: any) => handleMutationError(error, 'Failed to delete panel item'),
  });
}

export function useAddMaterialToPanel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      panelId,
      materialId,
      quantity = 1,
      itemType,
      notes,
    }: {
      panelId: number;
      materialId: number;
      quantity?: number;
      itemType?: PanelItemType;
      notes?: string;
    }) => panelItemService.addMaterialToPanel(panelId, materialId, quantity, itemType, notes),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', item.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, item.panelId] });
    },
    onError: (error: any) => handleMutationError(error, 'Failed to add material to panel'),
  });
}

export function useBusbarCablesWorksheet(panelId: number, enabled = true) {
  return useQuery({
    queryKey: [BUSBAR_CABLES_QUERY_KEY, panelId],
    queryFn: () => panelItemService.getBusbarCablesWorksheet(panelId),
    enabled: panelId > 0 && enabled,
  });
}

export function useCalculateBusbarCablesWorksheet() {
  return useMutation({
    mutationFn: (input: BusbarCablesWorksheetInput) => panelItemService.calculateBusbarCables(input),
    onError: (error: any) => handleMutationError(error, 'Failed to calculate busbar worksheet'),
  });
}

export function useSaveBusbarCablesWorksheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      panelId,
      input,
      useDefaultPrice,
      manualPricePerKg,
    }: {
      panelId: number;
      input: BusbarCablesWorksheetInput;
      useDefaultPrice?: boolean;
      manualPricePerKg?: number;
    }) => panelItemService.saveBusbarCablesWorksheet(panelId, input, { useDefaultPrice, manualPricePerKg }),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: [BUSBAR_CABLES_QUERY_KEY, item.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', item.panelId] });
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', item.panelId, 'grouped'] });
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, item.panelItemId] });
    },
    onError: (error: any) => handleMutationError(error, 'Failed to save busbar worksheet'),
  });
}
