import { prisma } from '../../config/prisma';
import { PaginationResult } from '../../utils/pagination';
import { UpdateFreelancerProfileDto } from './dto';
import { normalizeFreelancerProfile } from '../../utils/normalize';
import { normalizePortfolioItem, parseJsonField } from '../../utils/normalize';

export class FreelancerRepository {
  async findMany(filters: {
    skills?: string[];
    seniority?: string;
    minRate?: number;
    maxRate?: number;
    location?: string;
    remote?: boolean;
    availability?: string;
    pagination: PaginationResult;
  }) {
    const { skills, seniority, minRate, maxRate, location, remote, availability, pagination } = filters;
    
    const where: any = {};
    
    if (skills && skills.length > 0) {
      where.skills = {
        path: '$[*].name',
        array_contains: skills,
      };
    }
    
    if (seniority) {
      where.seniority = seniority;
    }
    
    if (minRate !== undefined || maxRate !== undefined) {
      where.dailyRate = {};
      if (minRate !== undefined) where.dailyRate.gte = minRate;
      if (maxRate !== undefined) where.dailyRate.lte = maxRate;
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    if (remote !== undefined) {
      where.remote = remote;
    }
    
    if (availability) {
      where.availability = {
        path: '$.status',
        equals: availability,
      };
    }

    const [freelancers, total] = await Promise.all([
      prisma.freelancerProfile.findMany({
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
          portfolio: {
            select: {
              id: true,
              title: true,
              technologies: true,
              images: true,
              links: true,
            },
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              portfolio: true,
              applications: true,
              contracts: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { completedJobs: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.freelancerProfile.count({ where }),
    ]);

    return { freelancers, total };
  }

  async findById(id: string) {
    return prisma.freelancerProfile.findUnique({
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
          // cvPath: true,
        portfolio: {
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
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
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        contracts: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            mission: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            portfolio: true,
            applications: true,
            contracts: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
  const profile = await prisma.freelancerProfile.findUnique({
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
  // cvPath: true,
        portfolio: {
          orderBy: { createdAt: 'desc' },
        },
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
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
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        contracts: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            mission: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            portfolio: true,
            applications: true,
            contracts: true,
          },
        },
      },
    });

    if (!profile) return null;

    // normalize nested fields
    const p = normalizeFreelancerProfile(profile);
    p.portfolio = (p.portfolio || []).map((it: any) => normalizePortfolioItem(it));
    // parse availability if string
    if (typeof p.availability === 'string') {
      try { p.availability = parseJsonField(p.availability); } catch (e) { p.availability = {}; }
    }

    return p;
  }

  async setCvPath(userId: string, cvPath: string) {
  // cast prisma to any to avoid type errors before regenerating Prisma client
  return (prisma as any).freelancerProfile.update({
      where: { userId },
      data: { cvPath },
    });
  }

  async create(userId: string, data: UpdateFreelancerProfileDto) {
    const created = await prisma.freelancerProfile.create({
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

    const p = normalizeFreelancerProfile(created);
    p.portfolio = (p.portfolio || []).map((it: any) => normalizePortfolioItem(it));
    if (typeof p.availability === 'string') {
      try { p.availability = parseJsonField(p.availability); } catch (e) { p.availability = {}; }
    }
    return p;
  }

  async update(userId: string, data: UpdateFreelancerProfileDto) {
    const updated = await prisma.freelancerProfile.update({
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

    const p = normalizeFreelancerProfile(updated);
    p.portfolio = (p.portfolio || []).map((it: any) => normalizePortfolioItem(it));
    if (typeof p.availability === 'string') {
      try { p.availability = parseJsonField(p.availability); } catch (e) { p.availability = {}; }
    }
    return p;
  }

  async delete(userId: string) {
    return prisma.freelancerProfile.delete({
      where: { userId },
    });
  }

  async updateProfileViews(id: string) {
    return prisma.freelancerProfile.update({
      where: { id },
      data: {
        profileViews: {
          increment: 1,
        },
      },
    });
  }
}

export const freelancerRepository = new FreelancerRepository();
