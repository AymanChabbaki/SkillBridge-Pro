import { get, post } from './api';
import {
  Feedback,
  CreateFeedbackRequest,
  PaginatedResponse,
} from './types';

export const feedbackService = {
  async createFeedback(data: CreateFeedbackRequest): Promise<Feedback> {
    return post<Feedback>('/feedback', data);
  },

  async getUserFeedback(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Feedback>> {
    return get<PaginatedResponse<Feedback>>(`/feedback/user/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`);
  },

  async getMyFeedback(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Feedback>> {
    return get<PaginatedResponse<Feedback>>(`/feedback/me?page=${page}&limit=${limit}`);
  },
};

// Backwards-compatible simple helpers used by the UI pages (return a flat list)
export async function fetchFeedbackList(userId?: string) {
  if (userId) {
    const pag = await feedbackService.getUserFeedback(userId, 1, 50);
    return pag.items || [];
  }
  // If no userId provided, try to fetch current user's feedback (may require auth)
  try {
    const pag = await feedbackService.getMyFeedback(1, 50);
    return pag.items || [];
  } catch (e) {
    return [];
  }
}

export async function submitFeedbackMock(payload: { toUserId: string; message: string }) {
  const created = await feedbackService.createFeedback({ toUserId: payload.toUserId, rating: 5, comment: payload.message });
  return created;
}