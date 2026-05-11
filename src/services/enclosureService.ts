import { apiClient } from './api';
import {
  EnclosureComponent,
  CreateEnclosureComponent,
  PanelEnclosure,
  CreateCustomEnclosureRequest,
  UpdateCustomEnclosureRequest,
  PanelItem
} from '../types';

const ENCLOSURE_COMPONENTS_API = '/enclosurecomponents';
const ENCLOSURES_API = '/enclosures';

export const enclosureService = {
  // ==========================================
  // Enclosure Components Catalog
  // ==========================================

  /**
   * Get all enclosure components from the catalog
   */
  getComponents: async (): Promise<EnclosureComponent[]> => {
    try {
      const response = await apiClient.get<EnclosureComponent[]>(ENCLOSURE_COMPONENTS_API);
      return response.data;
    } catch (error) {
      console.error('Error fetching enclosure components:', error);
      throw error;
    }
  },

  /**
   * Get a single enclosure component by ID
   */
  getComponent: async (id: number): Promise<EnclosureComponent> => {
    try {
      const response = await apiClient.get<EnclosureComponent>(
        `${ENCLOSURE_COMPONENTS_API}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching enclosure component ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new enclosure component (admin only)
   */
  createComponent: async (
    component: CreateEnclosureComponent
  ): Promise<EnclosureComponent> => {
    try {
      const response = await apiClient.post<EnclosureComponent>(
        ENCLOSURE_COMPONENTS_API,
        component
      );
      return response.data;
    } catch (error) {
      console.error('Error creating enclosure component:', error);
      throw error;
    }
  },

  /**
   * Update an enclosure component (admin only)
   */
  updateComponent: async (
    id: number,
    component: CreateEnclosureComponent
  ): Promise<EnclosureComponent> => {
    try {
      const response = await apiClient.put<EnclosureComponent>(
        `${ENCLOSURE_COMPONENTS_API}/${id}`,
        component
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating enclosure component ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an enclosure component (admin only)
   */
  deleteComponent: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${ENCLOSURE_COMPONENTS_API}/${id}`);
    } catch (error) {
      console.error(`Error deleting enclosure component ${id}:`, error);
      throw error;
    }
  },

  // ==========================================
  // Custom Enclosure Operations
  // ==========================================

  /**
   * Get enclosure snapshot for a panel item
   */
  getEnclosureSnapshot: async (panelItemId: number): Promise<PanelEnclosure> => {
    try {
      const response = await apiClient.get<PanelEnclosure>(
        `${ENCLOSURES_API}/${panelItemId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching enclosure snapshot for item ${panelItemId}:`, error);
      throw error;
    }
  },

  /**
   * Create a custom enclosure
   * Returns the created PanelItem
   */
  createCustomEnclosure: async (
    request: CreateCustomEnclosureRequest
  ): Promise<PanelItem> => {
    try {
      const response = await apiClient.post<PanelItem>(ENCLOSURES_API, request);
      return response.data;
    } catch (error) {
      console.error('Error creating custom enclosure:', error);
      throw error;
    }
  },

  /**
   * Update an existing custom enclosure snapshot
   */
  updateCustomEnclosure: async (
    panelItemId: number,
    request: UpdateCustomEnclosureRequest
  ): Promise<PanelEnclosure> => {
    try {
      const response = await apiClient.post<PanelEnclosure>(
        `${ENCLOSURES_API}/${panelItemId}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating custom enclosure for item ${panelItemId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a custom enclosure snapshot
   */
  deleteCustomEnclosure: async (panelItemId: number): Promise<void> => {
    try {
      await apiClient.delete(`${ENCLOSURES_API}/${panelItemId}`);
    } catch (error) {
      console.error(`Error deleting custom enclosure for item ${panelItemId}:`, error);
      throw error;
    }
  },

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Calculate total price for a custom enclosure
   */
  calculateEnclosureTotal: (components: any[]): number => {
    return components.reduce((sum, component) => {
      return sum + (component.totalPriceList || 0);
    }, 0);
  },

  /**
   * Validate custom enclosure before saving
   */
  validateCustomEnclosure: (components: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!components || components.length === 0) {
      errors.push('At least one component must be selected');
    }

    components.forEach((component, index) => {
      if (!component.description || component.description.trim() === '') {
        errors.push(`Component ${index + 1}: Description is required`);
      }
      if (component.qty <= 0) {
        errors.push(`Component ${index + 1}: Quantity must be greater than 0`);
      }
      if (component.unitPriceList < 0 || component.totalPriceList < 0) {
        errors.push(`Component ${index + 1}: Prices cannot be negative`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default enclosureService;
