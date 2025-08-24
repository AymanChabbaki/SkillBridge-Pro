import { get, post, patch } from './api';
import {
  Interview,
  ScheduleInterviewRequest,
} from './types';

export const interviewService = {
  async scheduleInterview(data: ScheduleInterviewRequest): Promise<Interview> {
    return post<Interview>('/interviews/schedule', data);
  },

  async getInterview(id: string): Promise<Interview> {
    return get<Interview>(`/interviews/${id}`);
  },

  async updateInterviewNotes(id: string, notes: string, rating?: number): Promise<Interview> {
    return patch<Interview>(`/interviews/${id}/notes`, { notes, rating });
  },

  async completeInterview(id: string, rating: number): Promise<Interview> {
    return patch<Interview>(`/interviews/${id}/complete`, { completed: true, rating });
  },
};