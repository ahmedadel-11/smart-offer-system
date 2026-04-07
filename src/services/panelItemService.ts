import { apiClient } from './api';
import {
  PanelItem,
  CreatePanelItem,
  UpdatePanelItem,
  PanelItemType,
  BusbarCablesWorksheetInput,
  BusbarCablesWorksheetResult,
  BusbarCablesWorksheetPayload,
  SaveBusbarCablesWithPriceRequest,
} from '../types';

const ENDPOINT = '/panelitems';
const BUSBAR_ENDPOINT = `${ENDPOINT}/busbar-cables`;

export const panelItemService = {
  // Get items by panel
  async getByPanel(panelId: number): Promise<PanelItem[]> {
    const response = await apiClient.get<PanelItem[]>(`${ENDPOINT}/panel/${panelId}`);
    return response.data;
  },

  // Get items by panel and type
  async getByPanelAndType(panelId: number, itemType: PanelItemType): Promise<PanelItem[]> {
    const response = await apiClient.get<PanelItem[]>(
      `${ENDPOINT}/panel/${panelId}/type/${itemType}`
    );
    return response.data;
  },

  // Get all item types
  async getItemTypes(): Promise<{ value: number; label: string }[]> {
    const response = await apiClient.get<{ value: number; label: string }[]>(`${ENDPOINT}/types`);
    return response.data;
  },

  // Get item by ID
  async getById(id: number): Promise<PanelItem> {
    const response = await apiClient.get<PanelItem>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Create panel item
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

  // Update item type only
  async updateItemType(id: number, newType: PanelItemType | null): Promise<PanelItem> {
    const item = await this.getById(id);
    return this.update(id, {
      quantity: item.quantity,
      itemType: newType ?? undefined,
      notes: item.notes ?? undefined,
    });
  },

  // Bulk update item types
  async bulkUpdateItemTypes(
    items: { id: number; itemType: PanelItemType | null }[]
  ): Promise<PanelItem[]> {
    const updatePromises = items.map(async (item) => {
      const existingItem = await this.getById(item.id);
      return this.update(item.id, {
        quantity: existingItem.quantity,
        itemType: item.itemType ?? undefined,
        notes: existingItem.notes ?? undefined,
      });
    });
    return Promise.all(updatePromises);
  },

  // Add material to panel
  async addMaterialToPanel(
    panelId: number,
    materialId: number,
    quantity: number = 1,
    itemType?: PanelItemType
  ): Promise<PanelItem> {
    return this.create({
      panelId,
      materialId,
      quantity,
      itemType,
    });
  },

  async calculateBusbarCables(
    input: BusbarCablesWorksheetInput
  ): Promise<BusbarCablesWorksheetResult> {
    const response = await apiClient.post<BusbarCablesWorksheetResult>(`${BUSBAR_ENDPOINT}/calculate`, input);
    return response.data;
  },

  async saveBusbarCablesWorksheet(
    panelId: number,
    input: BusbarCablesWorksheetInput,
    options?: { useDefaultPrice?: boolean; manualPricePerKg?: number }
  ): Promise<PanelItem> {
    const payload: SaveBusbarCablesWithPriceRequest = {
      input,
      useDefaultPrice: options?.useDefaultPrice ?? true,
      manualPricePerKg: options?.manualPricePerKg,
    };
    const response = await apiClient.post<PanelItem>(`${BUSBAR_ENDPOINT}/panel/${panelId}/save-with-price`, payload);
    return response.data;
  },

  async getBusbarCablesWorksheet(panelId: number): Promise<BusbarCablesWorksheetPayload | null> {
    try {
      const response = await apiClient.get<BusbarCablesWorksheetPayload>(`${BUSBAR_ENDPOINT}/panel/${panelId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get unassigned items (items without type)
  async getUnassigned(panelId: number): Promise<PanelItem[]> {
    const items = await this.getByPanel(panelId);
    return items.filter((item) => item.itemType === null);
  },

  // Get items grouped by type
  async getGroupedByType(panelId: number): Promise<Record<string, PanelItem[]>> {
    const items = await this.getByPanel(panelId);
    
    const grouped: Record<string, PanelItem[]> = {
      unassigned: [],
      incoming: [],
      outgoing: [],
      enclosure: [],
      busbarAndCables: [],
    };

    items.forEach((item) => {
      switch (item.itemType) {
        case PanelItemType.Incoming:
          grouped.incoming.push(item);
          break;
        case PanelItemType.Outgoing:
          grouped.outgoing.push(item);
          break;
        case PanelItemType.Enclosure:
          grouped.enclosure.push(item);
          break;
        case PanelItemType.BusbarAndCables:
          grouped.busbarAndCables.push(item);
          break;
        default:
          grouped.unassigned.push(item);
      }
    });

    // Sort each group by panelItemId
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.panelItemId - b.panelItemId);
    });

    return grouped;
  },
};

export default panelItemService;
