import { z } from 'zod';

export const CreateTrackingEntrySchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  hours: z.number().min(0, 'Hours must be non-negative').optional(),
  description: z.string().min(1, 'Description is required'),
  deliverable: z.string().optional(),
  attachments: z.array(z.string().url()).optional()
});

export const UpdateTrackingEntrySchema = z.object({
  hours: z.number().min(0).optional(),
  description: z.string().min(1).optional(),
  deliverable: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
  approved: z.boolean().optional()
});

export const ApproveTrackingSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional()
});

export type CreateTrackingEntryDto = z.infer<typeof CreateTrackingEntrySchema>;
export type UpdateTrackingEntryDto = z.infer<typeof UpdateTrackingEntrySchema>;
export type ApproveTrackingDto = z.infer<typeof ApproveTrackingSchema>;
