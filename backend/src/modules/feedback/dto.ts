import { z } from 'zod';

export const CreateFeedbackSchema = z.object({
  toUserId: z.string().min(1, 'Recipient user ID is required'),
  missionId: z.string().optional(),
  contractId: z.string().optional(),
  rating: z.number().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  comment: z.string().optional(),
  skills: z.record(z.number().min(1).max(5)).optional(),
  isPublic: z.boolean().default(true)
}).refine(
  (data) => data.missionId || data.contractId,
  {
    message: 'Either mission ID or contract ID must be provided',
    path: ['missionId']
  }
);

export const UpdateFeedbackSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  skills: z.record(z.number().min(1).max(5)).optional(),
  isPublic: z.boolean().optional()
});

export type CreateFeedbackDto = z.infer<typeof CreateFeedbackSchema>;
export type UpdateFeedbackDto = z.infer<typeof UpdateFeedbackSchema>;
