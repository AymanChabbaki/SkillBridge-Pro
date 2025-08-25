import { patch, get } from './api';
import { Milestone } from './types';

export const milestoneService = {
  async approveMilestone(milestoneId: string, deliverable?: string): Promise<Milestone> {
    return patch<Milestone>(`/milestones/${milestoneId}/approve`, { 
      approved: true, 
      deliverable 
    });
  },

  async submitMilestone(milestoneId: string, deliverable: string): Promise<Milestone> {
    return patch<Milestone>(`/milestones/${milestoneId}/submit`, { deliverable });
  },

  async getMilestones(filters?: { contractId?: string; status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.contractId) params.append('contractId', filters.contractId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const suffix = params.toString() ? `?${params.toString()}` : '';

    // Use the axios-based `get` helper which attaches auth token and normalizes responses.
    return get<any>(`/milestones${suffix}`);
  }
};