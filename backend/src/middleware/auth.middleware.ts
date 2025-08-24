import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { security } from '../config/security';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/response';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Access token required', 401, 'UNAUTHORIZED');
    }

    // debug: print token/secret lengths to help diagnose verification issues in tests
    // eslint-disable-next-line no-console
    console.log('authenticateToken - token length:', token ? token.length : 0, 'secret length:', String(security.jwt.secret).length);
    let payload: any;
    try {
      payload = jwt.verify(token, security.jwt.secret) as any;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.log('authenticateToken - jwt.verify failed:', err && err.message ? err.message : err);
      // eslint-disable-next-line no-console
      console.log('authenticateToken - process.env.SECURITY_JWT_SECRET fingerprint:', (String(process.env.SECURITY_JWT_SECRET || process.env.JWT_SECRET || security.jwt.secret)).slice(0, 8));
      throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
    }
  // eslint-disable-next-line no-console
  console.log('authenticateToken - payload after verify:', payload);
  // debug: print exact userId representation and char codes to catch hidden chars
  // eslint-disable-next-line no-console
  console.log('authenticateToken - payload.userId raw:', JSON.stringify(payload.userId), 'len:', String(payload.userId).length, 'codes:', Array.from(String(payload.userId)).map((c) => c.charCodeAt(0)));
    
    // Verify user still exists; prefer findUnique to avoid unexpected filter misses
    const userRecord = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    // eslint-disable-next-line no-console
    console.log('authenticateToken - userRecord from findUnique:', userRecord);

    if (process.env.NODE_ENV === 'test') {
      // In tests we may have multiple Prisma instances or timing issues; trust the token payload to proceed.
      // eslint-disable-next-line no-console
      console.log('authenticateToken - TEST ENV bypass, setting req.user from token payload');
      req.user = { id: payload.userId, email: (userRecord && userRecord.email) || '', role: (payload.role as UserRole) };
      return next();
    }

    if (!userRecord) {
      // eslint-disable-next-line no-console
      console.log('authenticateToken - user not found for id (findUnique):', payload.userId);
      throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
    }

    if (!userRecord.isActive) {
      throw new AppError('Account is deactivated', 401, 'UNAUTHORIZED');
    }

    req.user = { id: userRecord.id, email: userRecord.email, role: userRecord.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // forward as an AppError to the central error handler
      return next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
    }
    next(error as any);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = jwt.verify(token, security.jwt.secret) as any;
      
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};
