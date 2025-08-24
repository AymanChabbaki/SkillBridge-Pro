import { PrismaClient } from '@prisma/client';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto';

export class FeedbackRepository {
  constructor(public prisma: PrismaClient) {}

  async create(data: CreateFeedbackDto & { fromUserId: string }) {
    return this.prisma.feedback.create({
      data,
      include: {
        fromUser: {
          select: { id: true, name: true, role: true }
        },
        toUser: {
          select: { id: true, name: true, role: true }
        },
        mission: {
          select: { id: true, title: true }
        },
        contract: {
          select: { id: true }
        }
      }
    });
  }

  async findById(id: string) {
    return this.prisma.feedback.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: { id: true, name: true, role: true }
        },
        toUser: {
          select: { id: true, name: true, role: true }
        },
        mission: {
          select: { id: true, title: true }
        },
        contract: {
          select: { id: true }
        }
      }
    });
  }

  async findByUserId(userId: string, filters: { page?: number; limit?: number; isPublic?: boolean }) {
    const { page = 1, limit = 20, isPublic } = filters;
    const skip = (page - 1) * limit;

    const where: any = { toUserId: userId };
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    const [feedback, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: {
          fromUser: {
            select: { id: true, name: true, role: true }
          },
          mission: {
            select: { id: true, title: true }
          },
          contract: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.feedback.count({ where })
    ]);

    return {
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async update(id: string, data: UpdateFeedbackDto) {
    return this.prisma.feedback.update({
      where: { id },
      data,
      include: {
        fromUser: {
          select: { id: true, name: true, role: true }
        },
        toUser: {
          select: { id: true, name: true, role: true }
        },
        mission: {
          select: { id: true, title: true }
        },
        contract: {
          select: { id: true }
        }
      }
    });
  }

  async delete(id: string) {
    return this.prisma.feedback.delete({
      where: { id }
    });
  }

  async calculateUserRating(userId: string) {
    const result = await this.prisma.feedback.aggregate({
      where: { toUserId: userId, isPublic: true },
      _avg: { rating: true },
      _count: { rating: true }
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.rating || 0
    };
  }
}
