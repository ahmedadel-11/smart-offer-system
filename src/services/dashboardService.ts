import { apiClient } from './api';
import type { DashboardStats, RecentActivityItem } from '../types';

const ENDPOINT = '/dashboard';

export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(`${ENDPOINT}/stats`);
    return response.data;
  },

  // Get recent activity for the current user
  async getRecentActivity(count: number = 20): Promise<RecentActivityItem[]> {
    const response = await apiClient.get<RecentActivityItem[]>(
      `${ENDPOINT}/recent-activity`,
      { params: { count } }
    );
    return response.data;
  },
};

export default dashboardService;
