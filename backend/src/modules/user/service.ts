import { UserRole } from '@prisma/client';
import { userRepository } from './repository';
import { AppError } from '../../utils/response';
import { getPagination, createPaginationMeta } from '../../utils/pagination';
import { UpdateUserDto, UpdateUserStatusDto, GetUsersQueryDto } from './dto';

export class UserService {
  async getUsers(query: GetUsersQueryDto) {
    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    const { users, total } = await userRepository.findMany({
      role: query.role,
      search: query.search,
      pagination,
    });

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    return {
      users,
      pagination: meta,
    };
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const existingUser = await userRepository.findById(id);
    
    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return userRepository.update(id, data);
  }

  async updateUserStatus(id: string, data: UpdateUserStatusDto) {
    const existingUser = await userRepository.findById(id);
    
    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return userRepository.updateStatus(id, data.isActive);
  }
}

export const userService = new UserService();
