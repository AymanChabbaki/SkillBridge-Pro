import { prisma } from '../../config/prisma';
import { UserRole } from '@prisma/client';
import { PaginationResult } from '../../utils/pagination';

export class UserRepository {
  async findMany(filters: {
    role?: UserRole;
    search?: string;
    pagination: PaginationResult;
  }) {
    const { role, search, pagination } = filters;
    
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
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
            size: true,
            description: true,
            website: true,
            location: true,
            verified: true,
          },
        },
        freelancerProfile: {
          select: {
            id: true,
            title: true,
            bio: true,
            skills: true,
            seniority: true,
            dailyRate: true,
            availability: true,
            location: true,
            remote: true,
            languages: true,
            experience: true,
            rating: true,
            completedJobs: true,
          },
        },
      },
    });
  }

  async update(id: string, data: { name?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
