import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { currencyRateService } from '../services/currencyRateService';
import type { UpdateCurrencyRateDto } from '../types';

export const CURRENCY_RATES_QUERY_KEY = 'currencyRates';

export const useCurrencyRates = () => {
  return useQuery({
    queryKey: [CURRENCY_RATES_QUERY_KEY],
    queryFn: () => currencyRateService.getAll(),
  });
};

export const useCurrencyRate = (currencyCode: string) => {
  return useQuery({
    queryKey: [CURRENCY_RATES_QUERY_KEY, currencyCode],
    queryFn: () => currencyRateService.getByCode(currencyCode),
    enabled: !!currencyCode,
  });
};

export const useUpsertCurrencyRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      currencyCode,
      data,
    }: {
      currencyCode: string;
      data: UpdateCurrencyRateDto;
    }) => currencyRateService.upsert(currencyCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CURRENCY_RATES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CURRENCY_RATES_QUERY_KEY, variables.currencyCode],
      });
      toast.success(`Rate updated for ${variables.currencyCode.toUpperCase()}`);
    },
    onError: () => {
      toast.error('Failed to update currency rate');
    },
  });
};
