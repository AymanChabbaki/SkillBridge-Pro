import { get, post, patch } from './api';
import {
  Contract,
  CreateContractRequest,
  Milestone,
  CreateMilestoneRequest,
} from './types';

export const contractService = {
  async createContract(data: CreateContractRequest): Promise<Contract> {
    return post<Contract>('/contracts', data);
  },

  async getContracts(params?: { status?: string; page?: number; limit?: number }) {
    // returns { contracts, pagination }
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const url = `/contracts${query.toString() ? `?${query.toString()}` : ''}`;
    return get<{ contracts: Contract[]; pagination: any }>(url);
  },

  async getContract(id: string): Promise<Contract> {
    return get<Contract>(`/contracts/${id}`);
  },

  async signContract(id: string): Promise<Contract> {
    return patch<Contract>(`/contracts/${id}/sign`);
  },

  async createMilestone(contractId: string, data: CreateMilestoneRequest): Promise<Milestone> {
    return post<Milestone>(`/contracts/${contractId}/milestones`, data);
  },

  async approveMilestone(milestoneId: string, deliverable?: string): Promise<Milestone> {
    return patch<Milestone>(`/milestones/${milestoneId}/approve`, { 
      approved: true, 
      deliverable 
    });
  },

  async submitMilestone(milestoneId: string, deliverable: string): Promise<Milestone> {
    return patch<Milestone>(`/milestones/${milestoneId}/submit`, { deliverable });
  },
};