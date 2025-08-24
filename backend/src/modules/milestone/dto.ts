import { z } from 'zod';

export const CreateMilestoneSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Invalid due date format'),
  deliverable: z.string().optional()
});

export const UpdateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED']).optional(),
  deliverable: z.string().optional()
});

export const ApproveMilestoneSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional()
});

export const MilestoneQuerySchema = z.object({
  contractId: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED']).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  type: z.string().optional(),
  milestoneId: z.string().optional()
});

export type CreateMilestoneDto = z.infer<typeof CreateMilestoneSchema>;
export type UpdateMilestoneDto = z.infer<typeof UpdateMilestoneSchema>;
export type ApproveMilestoneDto = z.infer<typeof ApproveMilestoneSchema>;
export type MilestoneQueryDto = z.infer<typeof MilestoneQuerySchema>;

// Input types for service layer
export type CreateMilestoneInput = CreateMilestoneDto;
export type UpdateMilestoneInput = UpdateMilestoneDto;
export type MilestoneQueryInput = MilestoneQueryDto;
