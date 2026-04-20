import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../constants';
import { packageService } from '../services/packageService';
import { CreatePackageRequest, UpdatePackageRequest } from '../types';

export const PACKAGES_QUERY_KEY = queryKeys.packages.all;

export function usePackages() {
  return useQuery({
    queryKey: queryKeys.packages.list(),
    queryFn: () => packageService.getAll(),
  });
}

export function usePackage(id: number) {
  return useQuery({
    queryKey: queryKeys.packages.detail(id),
    queryFn: () => packageService.getById(id),
    enabled: id > 0,
  });
}

export function useSearchPackages(term: string) {
  const normalizedTerm = term.trim();

  return useQuery({
    queryKey: queryKeys.packages.search(normalizedTerm),
    queryFn: () => packageService.search(normalizedTerm),
    enabled: normalizedTerm.length >= 2,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePackageRequest) => packageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePackageRequest }) =>
      packageService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.detail(variables.id) });
    },
  });
}

export function useDeactivatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => packageService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => packageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
    },
  });
}