import { PrismaClient } from '@prisma/client';

export class NotificationRepository {
  constructor(public prisma: PrismaClient) {}

  async create(notification: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: any;
  }) {
    // prisma.notification may not exist on the generated type in some build setups
    const p: any = this.prisma as any;
    return p.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data ? notification.data : null,
      },
    });
  }

  async findByUser(userId: string, limit = 20) {
    const p: any = this.prisma as any;
    return p.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markRead(id: string) {
    const p: any = this.prisma as any;
    return p.notification.update({ where: { id }, data: { read: true } });
  }
}
