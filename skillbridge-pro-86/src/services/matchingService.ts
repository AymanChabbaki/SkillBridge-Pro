import { get } from './api';
import { MatchResult } from './types';

export const matchingService = {
  async getMatchingMissions(freelancerId?: string, limit: number = 10): Promise<MatchResult[]> {
    const params = new URLSearchParams();
    if (freelancerId) params.append('freelancerId', freelancerId);
    params.append('limit', limit.toString());
    return get<MatchResult[]>(`/matching/missions?${params.toString()}`);
  },

  async getMatchingFreelancers(missionId: string, limit: number = 10): Promise<MatchResult[]> {
    const params = new URLSearchParams();
    params.append('missionId', missionId);
    params.append('limit', limit.toString());
    return get<MatchResult[]>(`/matching/freelancers?${params.toString()}`);
  },
};