import { Request, Response, NextFunction } from 'express';
import { userService } from './service';
import { updateUserSchema, updateUserStatusSchema, getUsersQuerySchema } from './dto';
import { successResponse } from '../../utils/response';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getUsersQuerySchema.parse(req.query);
      const result = await userService.getUsers(query);
      
      successResponse(res, result.users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await userService.getUserById(id);
      
      successResponse(res, result, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      const result = await userService.updateUser(id, validatedData);
      
      successResponse(res, result, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateUserStatusSchema.parse(req.body);
      const result = await userService.updateUserStatus(id, validatedData);
      
      successResponse(res, result, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
