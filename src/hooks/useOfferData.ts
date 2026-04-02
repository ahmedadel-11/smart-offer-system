import { useState, useEffect } from 'react';
import { offerService } from '../services/offerService';
import { TechnicalOfferDto, CommercialOfferDto } from '../types';

/**
 * Hook for fetching technical offer data
 * GET /api/Projects/{id}/technical-offer
 */
export const useTechnicalOfferData = (projectId: number) => {
  const [data, setData] = useState<TechnicalOfferDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await offerService.getTechnicalOfferData(projectId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch technical offer data'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  return { data, isLoading, error };
};

/**
 * Hook for fetching commercial offer data
 * GET /api/Projects/{id}/commercial-offer
 */
export const useCommercialOfferData = (projectId: number) => {
  const [data, setData] = useState<CommercialOfferDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await offerService.getCommercialOfferData(projectId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch commercial offer data'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  return { data, isLoading, error };
};

/**
 * Hook for fetching both technical and commercial offer data
 */
export const useOfferData = (projectId: number) => {
  const technical = useTechnicalOfferData(projectId);
  const commercial = useCommercialOfferData(projectId);

  return {
    technical,
    commercial,
    isLoading: technical.isLoading || commercial.isLoading,
    error: technical.error || commercial.error,
  };
};
