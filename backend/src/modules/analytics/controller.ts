import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './service';
import { AnalyticsQuerySchema, MarketTrendsQuerySchema } from './dto';
import { successResponse, errorResponse } from '../../utils/response';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log user info for debugging
      // eslint-disable-next-line no-console
      console.info('AnalyticsController.getSummary - user:', req.user);

      const summary = await this.analyticsService.getSummary(
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, summary, 'Analytics summary retrieved successfully');
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('AnalyticsController.getSummary error:', error);
      next(error);
    }
  };

  getTopSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topSkills = await this.analyticsService.getTopSkills();

      return successResponse(res, topSkills, 'Top skills retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getMarketTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = MarketTrendsQuerySchema.safeParse(req.query);
      
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.errors);
      }

      const trends = await this.analyticsService.getMarketTrends(validation.data);

      return successResponse(res, trends, 'Market trends retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getActiveContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.analyticsService.getActiveContractsCount();
      return successResponse(res, result, 'Active contracts count retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getActiveFreelancers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.analyticsService.getActiveFreelancersCount();
      return successResponse(res, result, 'Active freelancers count retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
