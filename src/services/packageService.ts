import { apiClient } from './api';
import {
  CreatePackageRequest,
  PackageDto,
  PackageItemDto,
  UpdatePackageRequest,
  Material,
} from '../types';

const ENDPOINT = '/packages';

type PackageItemApiShape = Partial<PackageItemDto> & {
  materialCode?: string | null;
  materialDescription?: string | null;
  materialBasePrice?: number | null;
  material?: Partial<Material> | null;
};

type PackageApiShape = Partial<PackageDto> & {
  createdDate?: string | null;
  updatedDate?: string | null;
  items?: PackageItemApiShape[];
};

const normalizePackageItem = (
  item: PackageItemApiShape,
  packageId: number
): PackageItemDto => {
  return {
    packageItemId: item.packageItemId ?? 0,
    packageId: item.packageId ?? packageId,
    materialId: item.materialId ?? item.material?.materialId ?? 0,
    quantity: item.quantity ?? 0,
    materialCode: item.materialCode ?? item.material?.itemCode ?? null,
    materialDescription: item.materialDescription ?? item.material?.description ?? null,
    materialBasePrice: item.materialBasePrice ?? item.material?.basePrice ?? null,
    material: item.material ? (item.material as Material) : null,
  };
};

const normalizePackage = (pkg: PackageApiShape): PackageDto => {
  const packageId = pkg.packageId ?? 0;

  return {
    packageId,
    packageName: pkg.packageName ?? '',
    description: pkg.description ?? null,
    isActive: pkg.isActive ?? true,
    createdAt: pkg.createdAt ?? pkg.createdDate ?? '',
    updatedAt: pkg.updatedAt ?? pkg.updatedDate ?? null,
    createdByUserId: pkg.createdByUserId ?? null,
    updatedByUserId: pkg.updatedByUserId ?? null,
    items: (pkg.items ?? []).map((item) => normalizePackageItem(item, packageId)),
  };
};

export const packageService = {
  async getAll(): Promise<PackageDto[]> {
    const response = await apiClient.get<PackageApiShape[]>(ENDPOINT);
    return response.data.map(normalizePackage);
  },

  async getById(id: number): Promise<PackageDto> {
    const response = await apiClient.get<PackageApiShape>(`${ENDPOINT}/${id}`);
    return normalizePackage(response.data);
  },

  async search(term: string): Promise<PackageDto[]> {
    const response = await apiClient.get<PackageApiShape[]>(`${ENDPOINT}/search`, {
      params: { term },
    });
    return response.data.map(normalizePackage);
  },

  async create(data: CreatePackageRequest): Promise<PackageDto> {
    const response = await apiClient.post<PackageApiShape>(ENDPOINT, data);
    return normalizePackage(response.data);
  },

  async update(id: number, data: UpdatePackageRequest): Promise<PackageDto> {
    const response = await apiClient.put<PackageApiShape>(`${ENDPOINT}/${id}`, data);
    return normalizePackage(response.data);
  },

  async deactivate(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}/deactivate`);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};

export default packageService;