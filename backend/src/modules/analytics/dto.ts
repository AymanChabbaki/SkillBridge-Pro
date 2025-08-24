import { z } from 'zod';

export const AnalyticsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metrics: z.array(z.string()).optional()
});

export const MarketTrendsQuerySchema = z.object({
  skills: z.array(z.string()).optional(),
  sectors: z.array(z.string()).optional(),
  period: z.enum(['monthly', 'quarterly', 'yearly']).default('quarterly')
});

export type AnalyticsQueryDto = z.infer<typeof AnalyticsQuerySchema>;
export type MarketTrendsQueryDto = z.infer<typeof MarketTrendsQuerySchema>;
