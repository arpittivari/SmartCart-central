import apiClient from './apiClient';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalTransactions: number;
  cartCounts: {
    total: number;
    Idle: number;
    Shopping: number;
    Payment: number;
    Offline: number;
  };
}

export const getSummary = async (token: string): Promise<AnalyticsSummary> => {
  const response = await apiClient.get('/analytics/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};