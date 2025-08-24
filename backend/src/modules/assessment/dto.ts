import { z } from 'zod';
import { AssessmentType } from '@prisma/client';

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  type: z.enum(['text', 'multiple_choice', 'code', 'file_upload']),
  options: z.array(z.string()).optional(), // For multiple choice
  correctAnswer: z.string().optional(), // For auto-grading
  points: z.number().min(1, 'Points must be at least 1').default(10),
});

const answerSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
  fileUrl: z.string().optional(), // For file uploads
});

export const createAssessmentSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  type: z.nativeEnum(AssessmentType),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
  maxScore: z.number().min(1, 'Max score must be at least 1'),
  timeLimit: z.number().min(5, 'Time limit must be at least 5 minutes').optional(),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(answerSchema).min(1, 'At least one answer is required'),
});

export const scoreAssessmentSchema = z.object({
  score: z.number().min(0, 'Score must be non-negative'),
  reviewNotes: z.string().optional(),
});

export const getAssessmentsQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  type: z.nativeEnum(AssessmentType).optional(),
  applicationId: z.string().optional(),
});

export type CreateAssessmentDto = z.infer<typeof createAssessmentSchema>;
export type SubmitAssessmentDto = z.infer<typeof submitAssessmentSchema>;
export type ScoreAssessmentDto = z.infer<typeof scoreAssessmentSchema>;
export type GetAssessmentsQueryDto = z.infer<typeof getAssessmentsQuerySchema>;
