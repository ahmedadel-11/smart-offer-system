import { apiClient } from './api';
import type { CurrencyRateDto, UpdateCurrencyRateDto } from '../types';

const ENDPOINT = '/CurrencyRates';

export const currencyRateService = {
  async getAll(): Promise<CurrencyRateDto[]> {
    const response = await apiClient.get<CurrencyRateDto[]>(ENDPOINT);
    return response.data;
  },

  async getByCode(currencyCode: string): Promise<CurrencyRateDto> {
    const code = currencyCode.trim().toUpperCase();
    const response = await apiClient.get<CurrencyRateDto>(`${ENDPOINT}/${code}`);
    return response.data;
  },

  async upsert(currencyCode: string, data: UpdateCurrencyRateDto): Promise<CurrencyRateDto> {
    const code = currencyCode.trim().toUpperCase();
    const response = await apiClient.put<CurrencyRateDto>(`${ENDPOINT}/${code}`, data);
    return response.data;
  },
};

export default currencyRateService;
