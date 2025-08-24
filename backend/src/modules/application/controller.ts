import { Request, Response, NextFunction } from 'express';
import { applicationService } from './service';
import { createApplicationSchema, updateApplicationStatusSchema, getApplicationsQuerySchema } from './dto';
import { successResponse, paginatedResponse } from '../../utils/response';

export class ApplicationController {
  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getApplicationsQuerySchema.parse(req.query);
  const result = await applicationService.getMyApplications(req.user!.id, query);

  paginatedResponse(res, result.items, result.pagination, 'Applications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getApplicationsForMission(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;
      const query = getApplicationsQuerySchema.parse(req.query);
  const result = await applicationService.getApplicationsForMission(req.user!.id, missionId, query);

  paginatedResponse(res, result.items, result.pagination, 'Applications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await applicationService.getApplicationById(id);
      
      successResponse(res, result, 'Application retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createApplicationSchema.parse(req.body);
      const result = await applicationService.createApplication(req.user!.id, validatedData);
      
      successResponse(res, result, 'Application created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateApplicationStatusSchema.parse(req.body);
      const result = await applicationService.updateApplicationStatus(req.user!.id, id, validatedData);
      
      successResponse(res, result, 'Application status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
