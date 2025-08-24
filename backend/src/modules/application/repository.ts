import { prisma } from '../../config/prisma';
import { ApplicationStatus } from '@prisma/client';
import { PaginationResult } from '../../utils/pagination';
import { CreateApplicationDto } from './dto';

export class ApplicationRepository {
  async findMany(filters: {
    freelancerId?: string;
    missionId?: string;
    status?: ApplicationStatus;
    pagination: PaginationResult;
  }) {
    const { freelancerId, missionId, status, pagination } = filters;
    
    const where: any = {};
    
    if (freelancerId) {
      where.freelancerId = freelancerId;
    }
    
    if (missionId) {
      where.missionId = missionId;
    }
    
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          mission: {
            select: {
              id: true,
              title: true,
              budgetMin: true,
              budgetMax: true,
              duration: true,
              modality: true,
              sector: true,
              urgency: true,
              status: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  industry: true,
                  verified: true,
                  logo: true,
                },
              },
            },
          },
          freelancer: {
            select: {
              id: true,
              title: true,
              seniority: true,
              dailyRate: true,
              rating: true,
              completedJobs: true,
              skills: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          assessments: {
            select: {
              id: true,
              type: true,
              title: true,
              score: true,
              maxScore: true,
              submittedAt: true,
            },
          },
          interviews: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              completed: true,
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.count({ where }),
    ]);

    // Determine which freelancers in this batch have passing scored assessments
    try {
      const freelancerIds = Array.from(new Set(applications.map(a => a.freelancerId)));
      if (freelancerIds.length > 0) {
        // lazy require to avoid circular imports
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { assessmentRepository } = require('../assessment/repository');
        const scored = await assessmentRepository.findByFreelancerIds(freelancerIds);

        const certifiedByFreelancer: Record<string, boolean> = {};
        for (const s of scored) {
          const fid = s.application.freelancerId;
          const score = s.score || 0;
          const pass = s.maxScore ? (score / s.maxScore) >= 0.7 : score >= 70;
          if (pass) certifiedByFreelancer[fid] = true;
        }

        // Attach isCertified flag to freelancer select objects
        applications.forEach((app: any) => {
          if (!app.freelancer) return;
          // cast to any because Prisma's generated types don't include our runtime-only flag
          (app.freelancer as any).isCertified = !!certifiedByFreelancer[app.freelancerId];
        });
      }
    } catch (e) {
      // ignore assessment failures
    }

    return { applications, total };
  }

  async findById(id: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        mission: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                industry: true,
                size: true,
                verified: true,
                logo: true,
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
            portfolio: {
              select: {
                id: true,
                title: true,
                technologies: true,
                links: true,
              },
              take: 3,
            },
          },
        },
        assessments: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        interviews: {
          orderBy: { scheduledAt: 'desc' },
        },
      },
    });

    try {
      if (app && app.freelancer) {
        // lazy require to avoid circular imports
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { assessmentRepository } = require('../assessment/repository');
        const scored = await assessmentRepository.findByFreelancerIds([app.freelancerId]);
        const certified = scored.some((s: any) => {
          const score = s.score || 0;
          return s.maxScore ? (score / s.maxScore) >= 0.7 : score >= 70;
        });
  // cast to any because Prisma's generated types don't include our runtime-only flag
  (app.freelancer as any).isCertified = !!certified;
      }
    } catch (e) {
      // ignore
    }

    return app;
  }

  async create(freelancerId: string, data: CreateApplicationDto) {
    return prisma.application.create({
      data: {
        freelancerId,
        missionId: data.missionId,
        coverLetter: data.coverLetter,
        proposedRate: data.proposedRate,
        availabilityPlan: data.availabilityPlan,
      },
      include: {
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
      },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus, notes?: string) {
    return prisma.application.update({
      where: { id },
      data: {
        status,
        notes,
      },
      include: {
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
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findByMissionAndFreelancer(missionId: string, freelancerId: string) {
    return prisma.application.findUnique({
      where: {
        missionId_freelancerId: {
          missionId,
          freelancerId,
        },
      },
    });
  }

  async updateMatchingScore(id: string, matchingScore: number) {
    return prisma.application.update({
      where: { id },
      data: { matchingScore },
    });
  }
}

export const applicationRepository = new ApplicationRepository();
