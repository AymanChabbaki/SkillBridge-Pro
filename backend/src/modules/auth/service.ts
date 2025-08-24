import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { security } from '../../config/security';
import { AppError } from '../../utils/response';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from './dto';
import { logger } from '../../utils/logger';

export class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User already exists with this email', 409, 'USER_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, security.bcrypt.rounds);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user.id, user.role);

    return {
      user,
      tokens,
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true,
      },
    });

    if (!user) {
      logger.info('AuthService.login - user not found', { email: data.email });
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      logger.warn('AuthService.login - account deactivated', { email: data.email, userId: user.id });
      throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      logger.warn('AuthService.login - invalid password', { email: data.email, userId: user.id });
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user.id, user.role);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async refreshToken(data: RefreshTokenDto) {
    try {
      const payload = jwt.verify(data.refreshToken, security.jwt.refreshSecret) as any;
      
      const user = await prisma.user.findFirst({
        where: {
          id: payload.userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const tokens = this.generateTokens(user.id, user.role);

      return {
        user,
        tokens,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        companyProfile: {
          select: {
            id: true,
            name: true,
            industry: true,
            verified: true,
          },
        },
        freelancerProfile: {
          select: {
            id: true,
            title: true,
            seniority: true,
            rating: true,
            completedJobs: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    const hashedNewPassword = await bcrypt.hash(data.newPassword, security.bcrypt.rounds);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  private generateTokens(userId: string, role: UserRole) {
    const payload = { userId, role };

    const accessToken = jwt.sign(payload, security.jwt.secret as string, {
      expiresIn: security.jwt.expiresIn as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, security.jwt.refreshSecret as string, {
      expiresIn: security.jwt.refreshExpiresIn as string,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: security.jwt.expiresIn,
    };
  }
}

export const authService = new AuthService();
