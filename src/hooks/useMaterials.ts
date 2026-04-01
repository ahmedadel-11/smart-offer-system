import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '../services/materialService';
import { CreateMaterial, UpdateMaterial, MaterialSearchFilters } from '../types';
import toast from 'react-hot-toast';

export const MATERIALS_QUERY_KEY = 'materials';
export const CATEGORIES_QUERY_KEY = 'categories';
export const BRANDS_QUERY_KEY = 'brands';

export function useMaterials() {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY],
    queryFn: () => materialService.getAll(),
  });
}

export function useMaterial(id: number) {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, id],
    queryFn: () => materialService.getById(id),
    enabled: id > 0,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: () => materialService.getCategories(),
  });
}

export function useBrands() {
  return useQuery({
    queryKey: [BRANDS_QUERY_KEY],
    queryFn: () => materialService.getBrands(),
  });
}

export function useMaterialsByCategory(category: string) {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, 'category', category],
    queryFn: () => materialService.getByCategory(category),
    enabled: !!category,
  });
}

export function useMaterialSearch(term: string) {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, 'search', term],
    queryFn: () => materialService.search(term),
    enabled: term.length > 0,
  });
}

export function useMaterialAdvancedSearch(filters: MaterialSearchFilters) {
  return useQuery({
    queryKey: [MATERIALS_QUERY_KEY, 'advancedSearch', filters],
    queryFn: () => materialService.advancedSearch(filters),
    enabled: Object.keys(filters).length > 0,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaterial) => materialService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BRANDS_QUERY_KEY] });
      toast.success('Material created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.status === 403
        ? 'You do not have permission to create materials'
        : error?.response?.data?.message || 'Failed to create material';
      toast.error(message);
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMaterial }) =>
      materialService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY, id] });
      toast.success('Material updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.status === 403
        ? 'You do not have permission to edit materials'
        : error?.response?.data?.message || 'Failed to update material';
      toast.error(message);
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => materialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATERIALS_QUERY_KEY] });
      toast.success('Material deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.status === 403
        ? 'You do not have permission to delete materials'
        : error?.response?.data?.message || 'Failed to delete material';
      toast.error(message);
    },
  });
}
