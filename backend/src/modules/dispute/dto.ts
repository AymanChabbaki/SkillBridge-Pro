import { z } from 'zod';

export const CreateDisputeSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  reason: z.string().min(1, 'Reason is required').max(100, 'Reason too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long')
});

export const UpdateDisputeSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  resolution: z.string().optional()
});

export const ResolveDisputeSchema = z.object({
  resolution: z.string().min(10, 'Resolution must be at least 10 characters'),
  status: z.enum(['RESOLVED', 'CLOSED']).default('RESOLVED')
});

export type CreateDisputeDto = z.infer<typeof CreateDisputeSchema>;
export type UpdateDisputeDto = z.infer<typeof UpdateDisputeSchema>;
export type ResolveDisputeDto = z.infer<typeof ResolveDisputeSchema>;
