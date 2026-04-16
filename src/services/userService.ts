import { apiClient } from './api';
import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  AssignRolesDto,
  SetUserPermissionOverrideDto,
  UserPermissionOverrideDto,
} from '../types';

const ENDPOINT = '/users';

export const userService = {
  async getAll(): Promise<UserDto[]> {
    const response = await apiClient.get<UserDto[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: string): Promise<UserDto> {
    const response = await apiClient.get<UserDto>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async getMe(): Promise<UserDto> {
    const response = await apiClient.get<UserDto>(`${ENDPOINT}/me`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<UserDto> {
    const response = await apiClient.post<UserDto>(ENDPOINT, data);
    return response.data;
  },

  async update(id: string, data: UpdateUserDto): Promise<UserDto> {
    const response = await apiClient.put<UserDto>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  async activate(id: string): Promise<void> {
    await apiClient.post(`${ENDPOINT}/${id}/activate`);
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.post(`${ENDPOINT}/${id}/deactivate`);
  },

  async assignRoles(id: string, data: AssignRolesDto): Promise<void> {
    await apiClient.post(`${ENDPOINT}/${id}/roles`, data);
  },

  async getPermissions(id: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${ENDPOINT}/${id}/permissions`);
    return response.data;
  },

  async getPermissionOverrides(id: string): Promise<UserPermissionOverrideDto[]> {
    const response = await apiClient.get<UserPermissionOverrideDto[]>(`${ENDPOINT}/${id}/permission-overrides`);
    return response.data;
  },

  async setPermissionOverride(id: string, data: SetUserPermissionOverrideDto): Promise<void> {
    await apiClient.put(`${ENDPOINT}/${id}/permission-overrides`, data);
  },

  async removePermissionOverride(id: string, permissionId: string): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}/permission-overrides/${permissionId}`);
  },
};

export default userService;
