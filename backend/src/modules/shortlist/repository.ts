import { prisma } from '../../config/prisma';

export class ShortlistRepository {
  async create(data: { companyId: string; missionId: string; freelancerId: string; notes?: string }) {
  return (prisma as any).shortlist.create({ data });
  }

  async findByCompanyAndMission(companyId: string, missionId: string) {
  return (prisma as any).shortlist.findMany({
      where: { companyId, missionId },
      include: {
        freelancer: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            portfolio: { take: 3 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, missionId: string, freelancerId: string) {
  return (prisma as any).shortlist.findUnique({ where: { companyId_missionId_freelancerId: { companyId, missionId, freelancerId } } });
  }

  async remove(companyId: string, missionId: string, freelancerId: string) {
  return (prisma as any).shortlist.delete({ where: { companyId_missionId_freelancerId: { companyId, missionId, freelancerId } } });
  }
}

export const shortlistRepository = new ShortlistRepository();
