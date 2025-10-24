import apiClient from './apiClient';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalTransactions: number;
  totalCarts: number;
  revenueData: { name: string; Revenue: number }[];
  categoryData: { name: string; value: number }[];
}

export const getSummary = async (token: string): Promise<AnalyticsSummary> => {
  const response = await apiClient.get('/analytics/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};