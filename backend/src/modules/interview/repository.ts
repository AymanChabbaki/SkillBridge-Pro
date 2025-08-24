import { PrismaClient } from '@prisma/client';
import { CreateInterviewDto, UpdateInterviewDto } from './dto';

export class InterviewRepository {
  constructor(public prisma: PrismaClient) {}

  async create(data: CreateInterviewDto) {
    return this.prisma.interview.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt)
      },
      include: {
        application: {
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
            }
          }
        }
      }
    });
  }

  async findById(id: string) {
    return this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
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
            }
          }
        }
      }
    });
  }

  async findByApplicationId(applicationId: string) {
    return this.prisma.interview.findMany({
      where: { applicationId },
      include: {
        application: {
          include: {
            mission: {
              include: {
                company: true
              }
            },
            freelancer: true
          }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  async update(id: string, data: UpdateInterviewDto) {
    const updateData: any = { ...data };
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    return this.prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        application: {
          include: {
            mission: {
              include: {
                company: true
              }
            },
            freelancer: true
          }
        }
      }
    });
  }

  async delete(id: string) {
    return this.prisma.interview.delete({
      where: { id }
    });
  }

  async findUpcoming(userId: string, role: string) {
    const now = new Date();
    
    if (role === 'COMPANY') {
      return this.prisma.interview.findMany({
        where: {
          scheduledAt: { gte: now },
          application: {
            mission: {
              company: {
                userId
              }
            }
          }
        },
        include: {
          application: {
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
          }
        },
        orderBy: { scheduledAt: 'asc' }
      });
    } else if (role === 'FREELANCE') {
      return this.prisma.interview.findMany({
        where: {
          scheduledAt: { gte: now },
          application: {
            freelancer: {
              userId
            }
          }
        },
        include: {
          application: {
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
              }
            }
          }
        },
        orderBy: { scheduledAt: 'asc' }
      });
    }

    return [];
  }
}
