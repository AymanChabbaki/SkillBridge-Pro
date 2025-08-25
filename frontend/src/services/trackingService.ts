import { get, post, patch } from './api';
import {
  TrackingEntry,
  CreateTrackingRequest,
  ProjectSummary,
  PaginatedResponse,
} from './types';

export const trackingService = {
  async logTime(contractId: string, data: CreateTrackingRequest): Promise<TrackingEntry> {
    return post<TrackingEntry>(`/tracking/${contractId}/log`, data);
  },

  async getTrackingEntries(contractId: string, page?: number, limit?: number): Promise<PaginatedResponse<TrackingEntry>> {
    const qs: string[] = [];
    if (page) qs.push(`page=${page}`);
    if (limit) qs.push(`limit=${limit}`);
    const suffix = qs.length ? `?${qs.join('&')}` : '';
  const path = contractId === 'for-me' ? `/tracking/for-me${suffix}` : `/tracking/${contractId}${suffix}`;
  return get<PaginatedResponse<TrackingEntry>>(path as any);
  },

  async approveEntry(entryId: string): Promise<TrackingEntry> {
    return patch<TrackingEntry>(`/tracking/${entryId}/approve`, { approved: true });
  },

  async getProjectSummary(contractId: string): Promise<ProjectSummary> {
    if (contractId === 'for-me') {
      // No summary for 'for-me' path; return empty defaults
      return Promise.resolve({ contractId: 'for-me', totalHours: 0, approvedHours: 0, pendingHours: 0, totalEarnings: 0, completionRate: 0, lastUpdate: new Date().toISOString() });
    }
    return get<ProjectSummary>(`/tracking/${contractId}/summary`);
  },
};