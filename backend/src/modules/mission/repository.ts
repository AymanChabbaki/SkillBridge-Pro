import { prisma } from '../../config/prisma';
import { MissionStatus } from '@prisma/client';
import { PaginationResult } from '../../utils/pagination';
import { CreateMissionDto, UpdateMissionDto } from './dto';
import { normalizeMissionSkills } from '../../utils/normalize';

export class MissionRepository {
  async findMany(filters: {
    q?: string;
    skills?: string[];
    sector?: string;
    seniority?: string;
    budgetMin?: number;
    budgetMax?: number;
    duration?: string;
    modality?: string;
    urgency?: string;
    status?: MissionStatus;
    sort?: string;
    pagination: PaginationResult;
  }) {
    const { q, skills, sector, seniority, budgetMin, budgetMax, duration, modality, urgency, status, sort, pagination } = filters;
    
    const where: any = {
      status: status || MissionStatus.PUBLISHED,
    };
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    if (skills && skills.length > 0) {
      where.requiredSkills = {
        hasSome: skills,
      };
    }
    
    if (sector) {
      where.sector = { contains: sector, mode: 'insensitive' };
    }
    
    if (seniority) {
      where.experience = seniority;
    }
    
    if (budgetMin !== undefined || budgetMax !== undefined) {
      where.AND = [];
      if (budgetMin !== undefined) {
        where.AND.push({ budgetMax: { gte: budgetMin } });
      }
      if (budgetMax !== undefined) {
        where.AND.push({ budgetMin: { lte: budgetMax } });
      }
    }
    
    if (duration) {
      where.duration = duration;
    }
    
    if (modality) {
      where.modality = modality;
    }
    
    if (urgency) {
      where.urgency = urgency;
    }

    // Parse sort parameter
    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      const [field, direction] = sort.split(':');
      orderBy = { [field]: direction };
    }

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
              size: true,
              location: true,
              verified: true,
              logo: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy,
      }),
      prisma.mission.count({ where }),
    ]);

    // normalize mission skills before returning
    const normalizedMissions = missions.map((m: any) => ({
      ...m,
      requiredSkills: normalizeMissionSkills(m.requiredSkills),
      optionalSkills: normalizeMissionSkills(m.optionalSkills),
    }));

    return { missions: normalizedMissions, total };
  }

  async findById(id: string) {
  const mission = await prisma.mission.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            size: true,
            description: true,
            website: true,
            location: true,
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
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            freelancer: {
              select: {
                id: true,
                title: true,
                seniority: true,
                rating: true,
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
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!mission) return null;

    return {
      ...mission,
      requiredSkills: normalizeMissionSkills(mission.requiredSkills),
      optionalSkills: normalizeMissionSkills(mission.optionalSkills),
    };
  }

  async findByCompanyId(companyId: string, pagination: PaginationResult) {
    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where: { companyId },
        skip: pagination.skip,
        take: pagination.take,
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mission.count({ where: { companyId } }),
    ]);

    return { missions, total };
  }

  async create(companyId: string, data: CreateMissionDto) {
    return prisma.mission.create({
      data: {
        companyId,
        ...data,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            verified: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateMissionDto) {
    return prisma.mission.update({
      where: { id },
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            verified: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: MissionStatus) {
    return prisma.mission.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return prisma.mission.delete({
      where: { id },
    });
  }

  async incrementViews(id: string) {
    return prisma.mission.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  async findByIdAndCompanyId(id: string, companyId: string) {
    return prisma.mission.findFirst({
      where: {
        id,
        companyId,
      },
    });
  }
}

export const missionRepository = new MissionRepository();
