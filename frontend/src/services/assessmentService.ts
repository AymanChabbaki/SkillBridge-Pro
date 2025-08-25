import { get, post, patch } from './api';
import {
  Assessment,
  CreateAssessmentRequest,
  SubmitAssessmentRequest,
} from './types';

export const assessmentService = {
  async createAssessment(data: CreateAssessmentRequest): Promise<Assessment> {
    return post<Assessment>('/assessments', data);
  },

  async getAssessment(id: string): Promise<Assessment> {
    return get<Assessment>(`/assessments/${id}`);
  },

  async submitAssessment(id: string, data: SubmitAssessmentRequest): Promise<Assessment> {
    return post<Assessment>(`/assessments/${id}/submit`, data);
  },

  async scoreAssessment(id: string, score: number, reviewNotes?: string): Promise<Assessment> {
    return patch<Assessment>(`/assessments/${id}/score`, { score, reviewNotes });
  },
};