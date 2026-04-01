import { apiClient } from './api';
import type {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  UpdateSystemRoleDto,
  AssignPermissionsDto,
} from '../types';

const ENDPOINT = '/roles';

export const roleService = {
  async getAll(): Promise<RoleDto[]> {
    const response = await apiClient.get<RoleDto[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: string): Promise<RoleDto> {
    const response = await apiClient.get<RoleDto>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(data: CreateRoleDto): Promise<RoleDto> {
    const response = await apiClient.post<RoleDto>(ENDPOINT, data);
    return response.data;
  },

  async update(id: string, data: UpdateRoleDto): Promise<RoleDto> {
    const response = await apiClient.put<RoleDto>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  async updateSystemRole(id: string, data: UpdateSystemRoleDto): Promise<RoleDto> {
    const response = await apiClient.put<RoleDto>(`${ENDPOINT}/${id}/system`, data);
    return response.data;
  },

  async assignPermissions(id: string, data: AssignPermissionsDto): Promise<void> {
    await apiClient.post(`${ENDPOINT}/${id}/permissions`, data);
  },
};

export default roleService;
