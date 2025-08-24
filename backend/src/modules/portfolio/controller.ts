import { Request, Response, NextFunction } from 'express';
import { portfolioService } from './service';
import { createPortfolioItemSchema, updatePortfolioItemSchema, getPortfolioQuerySchema } from './dto';
import { successResponse } from '../../utils/response';

export class PortfolioController {
  async getMyPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getPortfolioQuerySchema.parse(req.query);
      const result = await portfolioService.getMyPortfolio(req.user!.id, query);
      
      successResponse(res, result.items, 'Portfolio retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPortfolioItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await portfolioService.getPortfolioItem(id);
      
      successResponse(res, result, 'Portfolio item retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createPortfolioItem(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createPortfolioItemSchema.parse(req.body);
      const result = await portfolioService.createPortfolioItem(req.user!.id, validatedData);
      
      successResponse(res, result, 'Portfolio item created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePortfolioItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updatePortfolioItemSchema.parse(req.body);
      const result = await portfolioService.updatePortfolioItem(req.user!.id, id, validatedData);
      
      successResponse(res, result, 'Portfolio item updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deletePortfolioItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await portfolioService.deletePortfolioItem(req.user!.id, id);
      
      successResponse(res, result, 'Portfolio item deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const portfolioController = new PortfolioController();
