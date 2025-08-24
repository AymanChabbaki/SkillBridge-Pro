import { z } from 'zod';

export const CreateContractSchema = z.object({
  missionId: z.string().min(1, 'Mission ID is required'),
  freelancerId: z.string().min(1, 'Freelancer ID is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  templateId: z.string().optional(),
  terms: z.record(z.any()),
  hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
  fixedPrice: z.number().positive('Fixed price must be positive').optional(),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format').optional()
}).refine(
  (data) => data.hourlyRate || data.fixedPrice,
  {
    message: 'Either hourly rate or fixed price must be provided',
    path: ['hourlyRate']
  }
);

export const UpdateContractSchema = z.object({
  terms: z.record(z.any()).optional(),
  hourlyRate: z.number().positive().optional(),
  fixedPrice: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED']).optional(),
  signedAt: z.string().datetime().optional()
});

export const SignContractSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
  agreedToTerms: z.boolean().refine(val => val === true, 'Must agree to terms')
});

export type CreateContractDto = z.infer<typeof CreateContractSchema>;
export type UpdateContractDto = z.infer<typeof UpdateContractSchema>;
export type SignContractDto = z.infer<typeof SignContractSchema>;
