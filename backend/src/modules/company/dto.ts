import { z } from 'zod';

export const updateCompanyProfileSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(2, 'Industry is required'),
  size: z.string().min(1, 'Company size is required'),
  description: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  location: z.string().optional(),
  values: z.array(z.string()).optional(),
  logo: z.string().url('Invalid logo URL').optional(),
});

export const getCompaniesQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  verified: z.string().transform(val => val === 'true').optional(),
});

export type UpdateCompanyProfileDto = z.infer<typeof updateCompanyProfileSchema>;
export type GetCompaniesQueryDto = z.infer<typeof getCompaniesQuerySchema>;
