import { get, post, del } from './api';

export const shortlistService = {
  async add(data: { companyId: string; missionId: string; freelancerId: string; notes?: string }) {
    return post('/shortlists', data);
  },

  async list(companyId: string, missionId?: string) {
    const params = [] as string[];
    if (companyId) params.push(`companyId=${encodeURIComponent(companyId)}`);
    if (missionId) params.push(`missionId=${encodeURIComponent(missionId)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return get(`/shortlists${query}`);
  },

  async remove(companyId: string, missionId: string, freelancerId: string) {
    return del(`/shortlists/${encodeURIComponent(companyId)}/${encodeURIComponent(missionId)}/${encodeURIComponent(freelancerId)}`);
  },
};
