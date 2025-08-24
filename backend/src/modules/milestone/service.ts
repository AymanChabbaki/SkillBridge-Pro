import { MilestoneStatus } from '@prisma/client';
import { CreateMilestoneInput, UpdateMilestoneInput, MilestoneQueryInput } from './dto';
import { NotFoundError, BadRequestError } from '../../utils/errors';

import { prisma } from '../../config/prisma';

export class MilestoneService {
  async create(data: CreateMilestoneInput, userId: string) {
    // Verify contract exists and user has access
    const contract = await prisma.contract.findUnique({
      where: { id: data.contractId },
    });

    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new BadRequestError('Not authorized to create milestone for this contract');
    }

    // Only client can create milestones
    if (contract.clientId !== userId) {
      throw new BadRequestError('Only client can create milestones');
    }

    return prisma.milestone.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
      },
      include: {
        contract: {
          include: {
            client: true,
            freelancer: true,
            mission: true,
          },
        },
        payments: true,
      },
    });
  }

  async findMany(query: MilestoneQueryInput, userId: string) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      contract: {
        OR: [
          { clientId: userId },
          { freelancerId: userId },
        ],
      },
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.contractId) {
      where.contractId = query.contractId;
    }

    const [milestones, total] = await Promise.all([
      prisma.milestone.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          contract: {
            include: {
              client: true,
              freelancer: true,
              mission: true,
            },
          },
          payments: true,
        },
      }),
      prisma.milestone.count({ where }),
    ]);

    return {
      milestones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            client: true,
            freelancer: true,
            mission: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundError('Milestone not found');
    }

    // Check if user has access
    if (milestone.contract.clientId !== userId && milestone.contract.freelancerId !== userId) {
      throw new BadRequestError('Not authorized to view this milestone');
    }

    return milestone;
  }

  async update(id: string, data: UpdateMilestoneInput, userId: string) {
    const milestone = await this.findById(id, userId);

    // Only client can update milestone details
    if (milestone.contract.clientId !== userId && data.amount) {
      throw new BadRequestError('Only client can update milestone amount');
    }

    // Freelancer can update status to IN_PROGRESS or COMPLETED
    if (milestone.contract.freelancerId === userId) {
      const allowedStatuses = ['IN_PROGRESS', 'COMPLETED'];
      if (data.status && !allowedStatuses.includes(data.status)) {
        throw new BadRequestError('Freelancer can only mark milestone as in progress or completed');
      }
    }

    const updateData: any = { ...data };

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    return prisma.milestone.update({
      where: { id },
      data: updateData,
      include: {
        contract: {
          include: {
            client: true,
            freelancer: true,
            mission: true,
          },
        },
        payments: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const milestone = await this.findById(id, userId);

    // Only client can delete milestone
    if (milestone.contract.clientId !== userId) {
      throw new BadRequestError('Only client can delete milestones');
    }

    // Cannot delete if milestone is completed or has payments
    if (milestone.status === 'COMPLETED' || milestone.payments.length > 0) {
      throw new BadRequestError('Cannot delete milestone with payments or completed status');
    }

    return prisma.milestone.delete({
      where: { id },
    });
  }

  async approve(id: string, userId: string) {
    const milestone = await this.findById(id, userId);

    // Only client can approve milestones
    if (milestone.contract.clientId !== userId) {
      throw new BadRequestError('Only client can approve milestones');
    }

    if (milestone.status !== 'COMPLETED') {
      throw new BadRequestError('Milestone must be completed before approval');
    }

    return prisma.milestone.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        contract: {
          include: {
            client: true,
            freelancer: true,
            mission: true,
          },
        },
        payments: true,
      },
    });
  }

  async reject(id: string, feedback: string, userId: string) {
    const milestone = await this.findById(id, userId);

    // Only client can reject milestones
    if (milestone.contract.clientId !== userId) {
      throw new BadRequestError('Only client can reject milestones');
    }

    if (milestone.status !== 'COMPLETED') {
      throw new BadRequestError('Only completed milestones can be rejected');
    }

    return prisma.milestone.update({
      where: { id },
      data: {
        status: 'REJECTED',
        feedback,
      },
      include: {
        contract: {
          include: {
            client: true,
            freelancer: true,
            mission: true,
          },
        },
        payments: true,
      },
    });
  }
}
