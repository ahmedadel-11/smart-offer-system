import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '../services/permissionService';
import type { CreatePermissionDto, UpdatePermissionDto } from '../types';
import toast from 'react-hot-toast';

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAll(),
  });
};

export const usePermission = (id: string) => {
  return useQuery({
    queryKey: ['permissions', id],
    queryFn: () => permissionService.getById(id),
    enabled: !!id,
  });
};

export const usePermissionsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['permissions', 'category', category],
    queryFn: () => permissionService.getByCategory(category),
    enabled: !!category,
  });
};

export const usePermissionCategories = () => {
  return useQuery({
    queryKey: ['permissions', 'categories'],
    queryFn: () => permissionService.getCategories(),
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePermissionDto) => permissionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission created successfully');
    },
    onError: () => {
      toast.error('Failed to create permission');
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionDto }) =>
      permissionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission updated successfully');
    },
    onError: () => {
      toast.error('Failed to update permission');
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete permission');
    },
  });
};
