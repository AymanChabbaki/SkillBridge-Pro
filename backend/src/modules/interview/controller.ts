import { Request, Response, NextFunction } from 'express';
import { InterviewService } from './service';
import { CreateInterviewSchema, UpdateInterviewSchema } from './dto';
import { InviteInterviewSchema } from './dto';
import { successResponse, errorResponse } from '../../utils/response';

export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  createInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = CreateInterviewSchema.safeParse(req.body);
      
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.errors);
      }

      const interview = await this.interviewService.createInterview(
        validation.data,
        req.user!.id
      );

      return successResponse(res, interview, 'Interview scheduled successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const interview = await this.interviewService.getInterview(
        id,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, interview, 'Interview retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = UpdateInterviewSchema.safeParse(req.body);
      
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.errors);
      }

      const interview = await this.interviewService.updateInterview(
        id,
        validation.data,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, interview, 'Interview updated successfully');
    } catch (error) {
      next(error);
    }
  };

  completeInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { rating, notes } = req.body || {};

      const interview = await this.interviewService.getInterview(id, req.user!.id, req.user!.role);

      // Only company owner or admin can mark complete
      // (service will validate)
      const updated = await this.interviewService.completeInterview(id, { rating, notes }, req.user!.id, req.user!.role);

      return successResponse(res, updated, 'Interview completed');
    } catch (error) {
      next(error);
    }
  };

  deleteInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      await this.interviewService.deleteInterview(
        id,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, null, 'Interview deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getUpcomingInterviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const interviews = await this.interviewService.getUpcomingInterviews(
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, interviews, 'Upcoming interviews retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getInterviewsByApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { applicationId } = req.params;
      
      const interviews = await this.interviewService.getInterviewsByApplication(
        applicationId,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, interviews, 'Application interviews retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  inviteAndSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = InviteInterviewSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.errors);
      }

      const interview = await this.interviewService.inviteAndSchedule(validation.data, req.user!.id);

      return successResponse(res, interview, 'Interview invitation sent', 201);
    } catch (error) {
      next(error);
    }
  };
}
