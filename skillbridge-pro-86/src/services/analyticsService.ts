export async function fetchAnalyticsMock() {
  await new Promise(r => setTimeout(r, 200));
  return {
    totalMissions: 42,
    totalContracts: 128,
    totalFreelancers: 76,
  };
}
import { get } from './api';
import { AnalyticsSummary, MarketTrends } from './types';

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    return get<AnalyticsSummary>('/analytics/summary');
  },

  async getTopSkills(): Promise<Array<{skill: string; count: number; avgRate: number}>> {
    return get<Array<{skill: string; count: number; avgRate: number}>>('/analytics/top-skills');
  },

  async getMarketTrends(): Promise<MarketTrends> {
    return get<MarketTrends>('/analytics/market-trends');
  },

  async getFreelancerPerformance(period: string = 'month'): Promise<any> {
    return get<any>(`/analytics/freelancer/performance?period=${period}`);
  },

  async getCompanyHiringAnalytics(period: string = 'quarter'): Promise<any> {
    return get<any>(`/analytics/company/hiring?period=${period}`);
  },
};