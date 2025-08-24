import { Request, Response, NextFunction } from 'express';
import { companyService } from './service';
import { updateCompanyProfileSchema, getCompaniesQuerySchema } from './dto';
import { successResponse } from '../../utils/response';

export class CompanyController {
  async getCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getCompaniesQuerySchema.parse(req.query);
      const result = await companyService.getCompanies(query);
      
      successResponse(res, result.companies, 'Companies retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await companyService.getCompanyById(id);
      
      successResponse(res, result, 'Company retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.getMyCompanyProfile(req.user!.id);
      
      successResponse(res, result, 'Company profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateCompanyProfileSchema.parse(req.body);
      const result = await companyService.createOrUpdateCompanyProfile(req.user!.id, validatedData);
      
      successResponse(res, result, 'Company profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyService.deleteCompanyProfile(req.user!.id);
      
      successResponse(res, result, 'Company profile deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();
