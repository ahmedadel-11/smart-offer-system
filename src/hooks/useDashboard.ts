import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const DASHBOARD_QUERY_KEY = 'dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30_000, // 30 seconds
  });
}

export function useRecentActivity(count: number = 20) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'recent-activity', count],
    queryFn: () => dashboardService.getRecentActivity(count),
    staleTime: 15_000, // 15 seconds
  });
}
