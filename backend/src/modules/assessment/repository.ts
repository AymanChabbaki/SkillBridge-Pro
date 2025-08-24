import { prisma } from '../../config/prisma';
import { AssessmentType } from '@prisma/client';
import { PaginationResult } from '../../utils/pagination';
import { CreateAssessmentDto } from './dto';

export class AssessmentRepository {
  async findMany(filters: {
    type?: AssessmentType;
    applicationId?: string;
    reviewerId?: string;
    pagination: PaginationResult;
  }) {
    const { type, applicationId, reviewerId, pagination } = filters;
    
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (applicationId) {
      where.applicationId = applicationId;
    }
    
    if (reviewerId) {
      where.reviewerId = reviewerId;
    }

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          application: {
            select: {
              id: true,
              status: true,
              mission: {
                select: {
                  id: true,
                  title: true,
                  company: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              freelancer: {
                select: {
                  id: true,
                  title: true,
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
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.assessment.count({ where }),
    ]);

    return { assessments, total };
  }

  async findById(id: string) {
    return prisma.assessment.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            mission: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    industry: true,
                    verified: true,
                  },
                },
              },
            },
            freelancer: {
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
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async create(data: CreateAssessmentDto & { reviewerId: string }) {
    return prisma.assessment.create({
      data,
      include: {
        application: {
          select: {
            id: true,
            mission: {
              select: {
                title: true,
              },
            },
            freelancer: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async submitAnswers(id: string, answers: any[]) {
    return prisma.assessment.update({
      where: { id },
      data: {
        answers,
        submittedAt: new Date(),
      },
    });
  }

  async scoreAssessment(id: string, score: number, reviewNotes?: string) {
    return prisma.assessment.update({
      where: { id },
      data: {
        score,
        reviewNotes,
      },
      include: {
        application: {
          select: {
            id: true,
            freelancer: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByApplicationId(applicationId: string) {
    return prisma.assessment.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByFreelancerIds(freelancerIds: string[]) {
    if (!freelancerIds || freelancerIds.length === 0) return [];

    return prisma.assessment.findMany({
      where: {
        score: { not: null },
        application: {
          freelancerId: { in: freelancerIds },
        },
      },
      select: {
        id: true,
        score: true,
        maxScore: true,
        application: {
          select: {
            freelancerId: true,
          },
        },
      },
    });
  }
}

export const assessmentRepository = new AssessmentRepository();
