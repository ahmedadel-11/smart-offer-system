import { apiClient } from './api';
import type {
  PermissionDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../types';

const ENDPOINT = '/permissions';

export const permissionService = {
  async getAll(): Promise<PermissionDto[]> {
    const response = await apiClient.get<PermissionDto[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: string): Promise<PermissionDto> {
    const response = await apiClient.get<PermissionDto>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async getByCategory(category: string): Promise<PermissionDto[]> {
    const response = await apiClient.get<PermissionDto[]>(
      `${ENDPOINT}/category/${encodeURIComponent(category)}`
    );
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${ENDPOINT}/categories`);
    return response.data;
  },

  async create(data: CreatePermissionDto): Promise<PermissionDto> {
    const response = await apiClient.post<PermissionDto>(ENDPOINT, data);
    return response.data;
  },

  async update(id: string, data: UpdatePermissionDto): Promise<PermissionDto> {
    const response = await apiClient.put<PermissionDto>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};

export default permissionService;
