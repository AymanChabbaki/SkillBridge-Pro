import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './service';
import { NotificationRepository } from './repository';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../config/prisma';

const repo = new NotificationRepository(prisma as any);
const service = new NotificationService(repo);

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await repo.findByUser(req.user!.id);
      return successResponse(res, notifications, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await repo.markRead(id);
      return successResponse(res, null, 'Notification marked read');
    } catch (error) {
      next(error);
    }
  }
}
