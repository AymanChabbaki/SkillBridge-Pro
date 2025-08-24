import { z } from 'zod';

const linkSchema = z.object({
  type: z.enum(['live', 'github', 'demo', 'documentation']),
  url: z.string().url('Invalid URL'),
});

export const createPortfolioItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  links: z.array(linkSchema).optional(),
  impact: z.string().optional(),
  duration: z.string().optional(),
  teamSize: z.number().min(1, 'Team size must be at least 1').optional(),
});

export const updatePortfolioItemSchema = createPortfolioItemSchema.partial();

export const getPortfolioQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  technology: z.string().optional(),
});

export type CreatePortfolioItemDto = z.infer<typeof createPortfolioItemSchema>;
export type UpdatePortfolioItemDto = z.infer<typeof updatePortfolioItemSchema>;
export type GetPortfolioQueryDto = z.infer<typeof getPortfolioQuerySchema>;
