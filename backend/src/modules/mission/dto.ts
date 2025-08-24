import { z } from 'zod';
import { MissionStatus } from '@prisma/client';

export const createMissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill is needed'),
  optionalSkills: z.array(z.string()).optional(),
  budgetMin: z.number().min(0, 'Budget minimum must be positive').optional(),
  budgetMax: z.number().min(0, 'Budget maximum must be positive').optional(),
  duration: z.string().min(1, 'Duration is required'),
  modality: z.enum(['remote', 'on-site', 'hybrid']),
  sector: z.string().min(1, 'Sector is required'),
  urgency: z.enum(['low', 'medium', 'high']),
  experience: z.enum(['junior', 'mid', 'senior']),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
});

export const updateMissionSchema = createMissionSchema.partial();

export const updateMissionStatusSchema = z.object({
  status: z.nativeEnum(MissionStatus),
});

export const getMissionsQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  q: z.string().optional(), // Search query
  skills: z.array(z.string()).optional(),
  sector: z.string().optional(),
  seniority: z.enum(['junior', 'mid', 'senior']).optional(),
  budgetMin: z.string().transform(Number).optional(),
  budgetMax: z.string().transform(Number).optional(),
  duration: z.string().optional(),
  modality: z.enum(['remote', 'on-site', 'hybrid']).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  status: z.nativeEnum(MissionStatus).optional(),
  sort: z.enum(['createdAt:desc', 'createdAt:asc', 'budgetMax:desc', 'budgetMax:asc']).optional(),
});

export type CreateMissionDto = z.infer<typeof createMissionSchema>;
export type UpdateMissionDto = z.infer<typeof updateMissionSchema>;
export type UpdateMissionStatusDto = z.infer<typeof updateMissionStatusSchema>;
export type GetMissionsQueryDto = z.infer<typeof getMissionsQuerySchema>;
