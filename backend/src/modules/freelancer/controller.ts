import { Request, Response, NextFunction } from 'express';
import { freelancerService } from './service';
import { updateFreelancerProfileSchema, getFreelancersQuerySchema } from './dto';
import { successResponse } from '../../utils/response';

export class FreelancerController {
  async getFreelancers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getFreelancersQuerySchema.parse(req.query);
      const result = await freelancerService.getFreelancers(query);
      
      successResponse(res, result.freelancers, 'Freelancers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFreelancerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
  // Allow callers to explicitly request increment via query param ?increment=true
  const incrementQuery = String(req.query.increment || '').toLowerCase();
  const incrementRequested = incrementQuery === 'true' || incrementQuery === '1';
  const incrementViews = incrementRequested || !req.user || req.user.role !== 'FREELANCE';
  const result = await freelancerService.getFreelancerById(id, incrementViews);
      
      successResponse(res, result, 'Freelancer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await freelancerService.getMyFreelancerProfile(req.user!.id);
      
      successResponse(res, result, 'Freelancer profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateFreelancerProfileSchema.parse(req.body);
      const result = await freelancerService.createOrUpdateFreelancerProfile(req.user!.id, validatedData);
      
      successResponse(res, result, 'Freelancer profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await freelancerService.deleteFreelancerProfile(req.user!.id);
      
      successResponse(res, result, 'Freelancer profile deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const freelancerController = new FreelancerController();
