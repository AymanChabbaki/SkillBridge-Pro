import { get, post, patch } from './api';
import {
  Application,
  CreateApplicationRequest,
  PaginatedResponse,
} from './types';

export const applicationService = {
  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    return post<Application>('/applications', data);
  },

  async getMyApplications(filters: any = {}): Promise<PaginatedResponse<Application>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]: [string, any]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return get<PaginatedResponse<Application>>(`/applications/me?${params.toString()}`);
  },

  async getMissionApplications(missionId: string): Promise<Application[]> {
  // Backend returns a paginated response for mission applications.
  return get<PaginatedResponse<Application>>(`/applications/mission/${missionId}`) as Promise<PaginatedResponse<Application>>;
  },

  async updateApplicationStatus(
    id: string, 
    status: string, 
    notes?: string
  ): Promise<Application> {
    return patch<Application>(`/applications/${id}/status`, { status, notes });
  },

  async getApplicationById(id: string): Promise<Application> {
    return get<Application>(`/applications/${id}`);
  },
};