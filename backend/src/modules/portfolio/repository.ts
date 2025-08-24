import { prisma } from '../../config/prisma';
import { PaginationResult } from '../../utils/pagination';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto } from './dto';

export class PortfolioRepository {
  async findByFreelancerId(freelancerId: string, filters: {
    technology?: string;
    pagination: PaginationResult;
  }) {
    const { technology, pagination } = filters;
    
    const where: any = { freelancerId };
    
    if (technology) {
      where.technologies = {
        has: technology,
      };
    }

    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.portfolioItem.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.portfolioItem.findUnique({
      where: { id },
      include: {
        freelancer: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async create(freelancerId: string, data: CreatePortfolioItemDto) {
    return prisma.portfolioItem.create({
      data: {
        freelancerId,
        ...data,
      },
    });
  }

  async update(id: string, data: UpdatePortfolioItemDto) {
    return prisma.portfolioItem.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.portfolioItem.delete({
      where: { id },
    });
  }

  async findByIdAndFreelancerId(id: string, freelancerId: string) {
    return prisma.portfolioItem.findFirst({
      where: {
        id,
        freelancerId,
      },
    });
  }
}

export const portfolioRepository = new PortfolioRepository();
