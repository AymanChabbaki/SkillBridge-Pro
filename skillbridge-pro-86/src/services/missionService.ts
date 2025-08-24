import { get, post, put, del, patch } from './api';
import {
  Mission,
  CreateMissionRequest,
  MissionFilters,
  PaginatedResponse,
} from './types';

export const missionService = {
  async createMission(data: CreateMissionRequest): Promise<Mission> {
    return post<Mission>('/missions', data);
  },

  async getMissions(filters: MissionFilters = {}): Promise<PaginatedResponse<Mission>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]: [string, any]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(`${key}[]`, v));
      } else if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return get<PaginatedResponse<Mission>>(`/missions?${params.toString()}`);
  },

  async getMissionById(id: string): Promise<Mission> {
    return get<Mission>(`/missions/${id}`);
  },

  async updateMission(id: string, data: Partial<CreateMissionRequest>): Promise<Mission> {
    return put<Mission>(`/missions/${id}`, data);
  },

  async deleteMission(id: string): Promise<void> {
    return del<void>(`/missions/${id}`);
  },

  async updateMissionStatus(id: string, status: string): Promise<Mission> {
    return patch<Mission>(`/missions/${id}/status`, { status });
  },
};