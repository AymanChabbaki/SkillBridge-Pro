import { get, patch } from './api';

export const notificationService = {
  async list(): Promise<any[]> {
    return get<any[]>('/notifications');
  },

  async markRead(id: string): Promise<void> {
    return patch<void>(`/notifications/${id}/read`, {});
  }
};
