import { Request, Response, NextFunction } from 'express';
import { assessmentService } from './service';
import { createAssessmentSchema, submitAssessmentSchema, scoreAssessmentSchema, getAssessmentsQuerySchema } from './dto';
import { successResponse } from '../../utils/response';

export class AssessmentController {
  async getAssessments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getAssessmentsQuerySchema.parse(req.query);
      const result = await assessmentService.getAssessments(query);
      
      successResponse(res, result.assessments, 'Assessments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await assessmentService.getAssessmentById(id);
      
      successResponse(res, result, 'Assessment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createAssessmentSchema.parse(req.body);
      const result = await assessmentService.createAssessment(req.user!.id, validatedData);
      
      successResponse(res, result, 'Assessment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async submitAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = submitAssessmentSchema.parse(req.body);
      const result = await assessmentService.submitAssessment(req.user!.id, id, validatedData);
      
      successResponse(res, result, 'Assessment submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async scoreAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = scoreAssessmentSchema.parse(req.body);
      const result = await assessmentService.scoreAssessment(req.user!.id, id, validatedData);
      
      successResponse(res, result, 'Assessment scored successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const assessmentController = new AssessmentController();
