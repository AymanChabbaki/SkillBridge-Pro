import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const createApplicationSchema = z.object({
  missionId: z.string().min(1, 'Mission ID is required'),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  proposedRate: z.number().min(0, 'Proposed rate must be positive'),
  availabilityPlan: z.string().min(10, 'Availability plan must be at least 10 characters'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
});

export const getApplicationsQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  missionId: z.string().optional(),
});

export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusDto = z.infer<typeof updateApplicationStatusSchema>;
export type GetApplicationsQueryDto = z.infer<typeof getApplicationsQuerySchema>;
