import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;
export type GetUsersQueryDto = z.infer<typeof getUsersQuerySchema>;
