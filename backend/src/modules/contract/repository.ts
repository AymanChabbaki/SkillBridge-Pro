import { PrismaClient } from '@prisma/client';
import { CreateContractDto, UpdateContractDto } from './dto';

export class ContractRepository {
  constructor(public prisma: PrismaClient) {}

  async create(data: CreateContractDto) {
    return this.prisma.contract.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null
      },
      include: {
        mission: {
          include: {
            company: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        freelancer: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        milestones: true
      }
    });
  }

  async findById(id: string) {
    return this.prisma.contract.findUnique({
      where: { id },
      include: {
        mission: {
          include: {
            company: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        freelancer: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        milestones: {
          include: {
            payments: true
          }
        },
        tracking: {
          orderBy: { date: 'desc' }
        },
        disputes: {
          where: { status: { not: 'CLOSED' } }
        },
        feedback: true
      }
    });
  }

  async findMany(filters: {
    userId?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, role, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId && role) {
      if (role === 'COMPANY') {
        where.mission = {
          company: {
            userId
          }
        };
      } else if (role === 'FREELANCE') {
        where.freelancer = {
          userId
        };
      }
    }

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: {
          mission: {
            include: {
              company: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          },
          freelancer: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          milestones: {
            select: {
              id: true,
              title: true,
              status: true,
              amount: true,
              dueDate: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.contract.count({ where })
    ]);

    return {
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async update(id: string, data: UpdateContractDto) {
    const updateData: any = { ...data };
    
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }
    if (data.signedAt) {
      updateData.signedAt = new Date(data.signedAt);
    }

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        mission: {
          include: {
            company: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        freelancer: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        milestones: true
      }
    });
  }

  async delete(id: string) {
    return this.prisma.contract.delete({
      where: { id }
    });
  }

  async findByMissionId(missionId: string) {
    return this.prisma.contract.findFirst({
      where: { missionId },
      include: {
        mission: true,
        freelancer: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
  }

  async findActiveContracts(userId: string, role: string) {
    const where: any = {
      status: { in: ['ACTIVE', 'IN_PROGRESS'] }
    };

    if (role === 'COMPANY') {
      where.mission = {
        company: {
          userId
        }
      };
    } else if (role === 'FREELANCE') {
      where.freelancer = {
        userId
      };
    }

    return this.prisma.contract.findMany({
      where,
      include: {
        mission: {
          include: {
            company: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        freelancer: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        milestones: {
          where: { status: { not: 'COMPLETED' } }
        }
      },
      orderBy: { startDate: 'asc' }
    });
  }
}
