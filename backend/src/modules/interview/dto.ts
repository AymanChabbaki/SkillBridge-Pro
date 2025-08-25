import { z } from 'zod';

export const CreateInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
  meetingLink: z.string().url('Invalid meeting link').optional(),
  notes: z.string().optional()
});

export const UpdateInterviewSchema = z.object({
  scheduledAt: z.string().datetime('Invalid date format').optional(),
  duration: z.number().min(15).max(480).optional(),
  meetingLink: z.string().url('Invalid meeting link').optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional()
});

export type CreateInterviewDto = z.infer<typeof CreateInterviewSchema>;
export type UpdateInterviewDto = z.infer<typeof UpdateInterviewSchema>;

export const InviteInterviewSchema = z.object({
  missionId: z.string().min(1, 'Mission ID is required'),
  freelancerId: z.string().min(1, 'Freelancer ID is required'),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
  meetingLink: z.string().url('Invalid meeting link').optional(),
  notes: z.string().optional(),
  coverLetter: z.string().optional(),
  proposedRate: z.number().optional()
});

export type InviteInterviewDto = z.infer<typeof InviteInterviewSchema>;
