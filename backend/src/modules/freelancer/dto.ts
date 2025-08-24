import { z } from 'zod';

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
});

const availabilitySchema = z.object({
  status: z.enum(['available', 'busy', 'unavailable']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateFreelancerProfileSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  bio: z.string().optional(),
  skills: z.array(skillSchema).min(1, 'At least one skill is required'),
  seniority: z.enum(['junior', 'mid', 'senior']),
  dailyRate: z.number().min(0, 'Daily rate must be positive').optional(),
  availability: availabilitySchema,
  location: z.string().optional(),
  remote: z.boolean().default(true),
  languages: z.array(z.string()).optional(),
  experience: z.number().min(0, 'Experience must be positive').optional(),
});

export const getFreelancersQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  skills: z.array(z.string()).optional(),
  seniority: z.enum(['junior', 'mid', 'senior']).optional(),
  minRate: z.string().transform(Number).optional(),
  maxRate: z.string().transform(Number).optional(),
  location: z.string().optional(),
  remote: z.string().transform(val => val === 'true').optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
});

export type UpdateFreelancerProfileDto = z.infer<typeof updateFreelancerProfileSchema>;
export type GetFreelancersQueryDto = z.infer<typeof getFreelancersQuerySchema>;
