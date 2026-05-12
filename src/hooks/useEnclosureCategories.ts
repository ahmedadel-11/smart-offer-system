import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '../services/materialService';
import toast from 'react-hot-toast';

export const ENCLOSURE_CATEGORIES_QUERY_KEY = 'enclosure-categories';
export const AVAILABLE_CATEGORIES_QUERY_KEY = 'available-categories';

export interface EnclosureCategoryMapping {
  enclosureCategoryMappingId: number;
  categoryName: string;
}

export function useAvailableCategories() {
  return useQuery({
    queryKey: [AVAILABLE_CATEGORIES_QUERY_KEY],
    queryFn: () => materialService.getAvailableCategories(),
  });
}

export function useEnclosureCategories() {
  return useQuery({
    queryKey: [ENCLOSURE_CATEGORIES_QUERY_KEY],
    queryFn: () => materialService.getEnclosureCategories(),
  });
}

export function useAddEnclosureCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryName: string) =>
      materialService.addEnclosureCategory(categoryName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENCLOSURE_CATEGORIES_QUERY_KEY] });
      toast.success('Category added successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.status === 403
        ? 'You do not have permission to manage enclosure categories'
        : error?.response?.data?.message || 'Failed to add category';
      toast.error(message);
    },
  });
}

export function useRemoveEnclosureCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mappingId: number) =>
      materialService.removeEnclosureCategory(mappingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENCLOSURE_CATEGORIES_QUERY_KEY] });
      toast.success('Category removed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.status === 403
        ? 'You do not have permission to manage enclosure categories'
        : error?.response?.data?.message || 'Failed to remove category';
      toast.error(message);
    },
  });
}
