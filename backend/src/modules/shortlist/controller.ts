import { Request, Response } from 'express';
import { shortlistService } from './service';
import { successResponse } from '../../utils/response';

export class ShortlistController {
  async add(req: Request, res: Response) {
    const user = (req as any).user;
    const { companyId, missionId, freelancerId, notes } = req.body;
    const item = await shortlistService.addToShortlist(user.id, companyId, missionId, freelancerId, notes);
  return successResponse(res, item);
  }

  async list(req: Request, res: Response) {
    const user = (req as any).user;
    const { companyId, missionId } = req.query;
    const items = await shortlistService.list(String(companyId), String(missionId));
  return successResponse(res, items);
  }

  async remove(req: Request, res: Response) {
    const user = (req as any).user;
    const { companyId, missionId, freelancerId } = req.params;
    const removed = await shortlistService.remove(String(companyId), String(missionId), String(freelancerId));
  return successResponse(res, removed);
  }
}

export const shortlistController = new ShortlistController();
