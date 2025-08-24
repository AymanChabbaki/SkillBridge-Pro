import { Request, Response, NextFunction } from 'express';
import { matchingService } from './service';
import { freelancerRepository } from '../freelancer/repository';
import { companyRepository } from '../company/repository';
import { missionRepository } from '../mission/repository';
import { successResponse } from '../../utils/response';
import { AppError } from '../../utils/response';

export class MatchingController {
  async getTopMatchingMissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { freelancerId } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      let targetFreelancerId: string;

      if (freelancerId) {
        // Admin or specific freelancer lookup
        if (req.user!.role !== 'ADMIN') {
          throw new AppError('Access denied', 403, 'ACCESS_DENIED');
        }
        targetFreelancerId = freelancerId as string;
      } else {
        // Current user (must be freelancer)
        if (req.user!.role !== 'FREELANCE') {
          throw new AppError('Only freelancers can get mission recommendations', 403, 'ACCESS_DENIED');
        }
        
        const freelancerProfile = await freelancerRepository.findByUserId(req.user!.id);
        if (!freelancerProfile) {
          throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
        }
        targetFreelancerId = freelancerProfile.id;
      }

      const result = await matchingService.getTopMatchingMissions(targetFreelancerId, limit);
      
      successResponse(res, result, 'Top matching missions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTopMatchingFreelancers(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!missionId) {
        throw new AppError('Mission ID is required', 400, 'MISSION_ID_REQUIRED');
      }

      // Check if user has access to this mission
      if (req.user!.role === 'COMPANY') {
        const companyProfile = await companyRepository.findByUserId(req.user!.id);
        if (!companyProfile) {
          throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
        }

        const mission = await missionRepository.findByIdAndCompanyId(missionId as string, companyProfile.id);
        if (!mission) {
          throw new AppError('Mission not found or access denied', 404, 'MISSION_NOT_FOUND');
        }
      } else if (req.user!.role !== 'ADMIN') {
        throw new AppError('Access denied', 403, 'ACCESS_DENIED');
      }

      const result = await matchingService.getTopMatchingFreelancers(missionId as string, limit);
      
      successResponse(res, result, 'Top matching freelancers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const matchingController = new MatchingController();
