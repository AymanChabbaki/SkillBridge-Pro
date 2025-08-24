import { Request, Response, NextFunction } from 'express';
import { missionService } from './service';
import { createMissionSchema, updateMissionSchema, updateMissionStatusSchema, getMissionsQuerySchema } from './dto';
import { paginatedResponse, successResponse } from '../../utils/response';

export class MissionController {
  async getMissions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getMissionsQuerySchema.parse(req.query);
  const result = await missionService.getMissions(query);

  // Return paginated response with `items` so frontend `PaginatedResponse` matches
  paginatedResponse(res, result.items, result.pagination, 'Missions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const incrementViews = !req.user || req.user.role !== 'COMPANY';
      const result = await missionService.getMissionById(id, incrementViews);
      
      successResponse(res, result, 'Mission retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createMission(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createMissionSchema.parse(req.body);
      const result = await missionService.createMission(req.user!.id, validatedData);
      
      successResponse(res, result, 'Mission created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateMissionSchema.parse(req.body);
      const result = await missionService.updateMission(req.user!.id, id, validatedData);
      
      successResponse(res, result, 'Mission updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMissionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateMissionStatusSchema.parse(req.body);
      const result = await missionService.updateMissionStatus(req.user!.id, id, validatedData);
      
      successResponse(res, result, 'Mission status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await missionService.deleteMission(req.user!.id, id);
      
      successResponse(res, result, 'Mission deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const missionController = new MissionController();
