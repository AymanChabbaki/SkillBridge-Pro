import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  milestoneId: z.string().min(1, 'Milestone ID is required'),
  contractId: z.string().min(1, 'Contract ID is required'),
  payerId: z.string().min(1, 'Payer ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional()
});

export const UpdatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  transactionId: z.string().optional(),
  stripePaymentId: z.string().optional(),
  fees: z.number().min(0).optional(),
  description: z.string().optional(),
  notes: z.string().optional()
});

export const ProcessPaymentSchema = z.object({
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentDetails: z.string().optional()
});

export const PaymentQuerySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  contractId: z.string().optional(),
  payerId: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  type: z.string().optional(),
  milestoneId: z.string().optional()
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentDto = z.infer<typeof UpdatePaymentSchema>;
export type ProcessPaymentDto = z.infer<typeof ProcessPaymentSchema>;
export type PaymentQueryDto = z.infer<typeof PaymentQuerySchema>;

// Input types for service layer
export type CreatePaymentInput = CreatePaymentDto;
export type UpdatePaymentInput = UpdatePaymentDto;
export type ProcessPaymentInput = ProcessPaymentDto;
export type PaymentQueryInput = PaymentQueryDto;
