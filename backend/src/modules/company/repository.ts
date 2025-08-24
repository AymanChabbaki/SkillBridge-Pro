import { prisma } from '../../config/prisma';
import { PaginationResult } from '../../utils/pagination';
import { UpdateCompanyProfileDto } from './dto';

export class CompanyRepository {
  async findMany(filters: {
    industry?: string;
    size?: string;
    location?: string;
    verified?: boolean;
    pagination: PaginationResult;
  }) {
    const { industry, size, location, verified, pagination } = filters;
    
    const where: any = {};
    
    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }
    
    if (size) {
      where.size = size;
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    if (verified !== undefined) {
      where.verified = verified;
    }

    const [companies, total] = await Promise.all([
      prisma.companyProfile.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              createdAt: true,
            },
          },
          missions: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              missions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.companyProfile.count({ where }),
    ]);

    return { companies, total };
  }

  async findById(id: string) {
    return prisma.companyProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        missions: {
          select: {
            id: true,
            title: true,
            status: true,
            applicationsCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            missions: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.companyProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        missions: {
          select: {
            id: true,
            title: true,
            status: true,
            applicationsCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            missions: true,
          },
        },
      },
    });
  }

  async create(userId: string, data: UpdateCompanyProfileDto) {
    return prisma.companyProfile.create({
      data: {
        userId,
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(userId: string, data: UpdateCompanyProfileDto) {
    return prisma.companyProfile.update({
      where: { userId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async delete(userId: string) {
    return prisma.companyProfile.delete({
      where: { userId },
    });
  }
}

export const companyRepository = new CompanyRepository();
