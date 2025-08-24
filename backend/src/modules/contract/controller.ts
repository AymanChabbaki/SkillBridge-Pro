import { Request, Response, NextFunction } from 'express';
import { ContractService } from './service';
import { CreateContractSchema, UpdateContractSchema, SignContractSchema } from './dto';
import { successResponse, errorResponse } from '../../utils/response';

export class ContractController {
  constructor(private contractService: ContractService) {}

  createContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = CreateContractSchema.safeParse(req.body);
      
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.errors);
      }

      const contract = await this.contractService.createContract(
        validation.data,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, contract, 'Contract created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const contract = await this.contractService.getContract(
        id,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, contract, 'Contract retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = UpdateContractSchema.safeParse(req.body);
      
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.errors);
      }

      const contract = await this.contractService.updateContract(
        id,
        validation.data,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, contract, 'Contract updated successfully');
    } catch (error) {
      next(error);
    }
  };

  signContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = SignContractSchema.safeParse(req.body);
      
      if (!validation.success) {
        return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', validation.error.errors);
      }

      const contract = await this.contractService.signContract(
        id,
        validation.data,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, contract, 'Contract signed successfully');
    } catch (error) {
      next(error);
    }
  };

  getContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, page, limit } = req.query;
      
      const contracts = await this.contractService.getContracts(
        req.user!.id,
        req.user!.role,
        {
          status: status as string,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined
        }
      );

      return successResponse(res, contracts, 'Contracts retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getActiveContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contracts = await this.contractService.getActiveContracts(
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, contracts, 'Active contracts retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      await this.contractService.deleteContract(
        id,
        req.user!.id,
        req.user!.role
      );

      return successResponse(res, null, 'Contract deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
