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
      params: { term },
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
    const response = await apiClient.get<Material[]>(
      `${ENDPOINT}/category/${encodeURIComponent(category)}`
    );
    return response.data;
  },

  // Create material
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
    const materials = await this.getAll();
    
    return materials.filter((material) => {
      // Search term filter - matches itemCode, description, brand, reference
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesTerm =
          material.itemCode.toLowerCase().includes(term) ||
          material.description.toLowerCase().includes(term) ||
          material.brand.toLowerCase().includes(term) ||
          (material.reference?.toLowerCase().includes(term) ?? false);
        if (!matchesTerm) return false;
      }

      // Category filter
      if (filters.category && material.category !== filters.category) {
        return false;
      }

      // Brand filter
      if (filters.brand && material.brand !== filters.brand) {
        return false;
      }

      // Description filter (partial match)
      if (
        filters.description &&
        !material.description.toLowerCase().includes(filters.description.toLowerCase())
      ) {
        return false;
      }

      // Rated current filter
      if (filters.ratedCurrent && material.ratedCurrent !== filters.ratedCurrent) {
        return false;
      }

      // ISC filter
      if (filters.isc && material.isc !== filters.isc) {
        return false;
      }

      // Reference filter (partial match)
      if (
        filters.reference &&
        !(material.reference?.toLowerCase().includes(filters.reference.toLowerCase()) ?? false)
      ) {
        return false;
      }

      // Active status filter
      if (filters.isActive !== undefined && material.isActive !== filters.isActive) {
        return false;
      }

      return true;
    });
  },

  // Get available categories (from Materials table)
  async getAvailableCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${ENDPOINT}/available-categories`);
    return response.data;
  },

  // Get enclosure mapped categories
  async getEnclosureCategories(): Promise<Array<{ enclosureCategoryMappingId: number; categoryName: string }>> {
    const response = await apiClient.get(`${ENDPOINT}/enclosure-categories`);
    return response.data;
  },

  // Add category to enclosure mapping
  async addEnclosureCategory(categoryName: string): Promise<{ enclosureCategoryMappingId: number; categoryName: string }> {
    const response = await apiClient.post(`${ENDPOINT}/enclosure-categories`, {
      categoryName,
    });
    return response.data;
  },

  // Remove category from enclosure mapping
  async removeEnclosureCategory(mappingId: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/enclosure-categories/${mappingId}`);
  },
};

export default materialService;
