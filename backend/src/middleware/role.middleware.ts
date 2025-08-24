import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../utils/response';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};

export const requireFreelance = requireRole(UserRole.FREELANCE);
export const requireCompany = requireRole(UserRole.COMPANY);
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireFreelanceOrCompany = requireRole(UserRole.FREELANCE, UserRole.COMPANY);
export const requireCompanyOrAdmin = requireRole(UserRole.COMPANY, UserRole.ADMIN);
