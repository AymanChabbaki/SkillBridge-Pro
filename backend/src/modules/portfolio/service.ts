import { portfolioRepository } from './repository';
import { freelancerRepository } from '../freelancer/repository';
import { AppError } from '../../utils/response';
import { getPagination, createPaginationMeta } from '../../utils/pagination';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto, GetPortfolioQueryDto } from './dto';

export class PortfolioService {
  async getMyPortfolio(userId: string, query: GetPortfolioQueryDto) {
    // First get the freelancer profile
    const freelancerProfile = await freelancerRepository.findByUserId(userId);
    
    if (!freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    const { items, total } = await portfolioRepository.findByFreelancerId(
      freelancerProfile.id,
      {
        technology: query.technology,
        pagination,
      }
    );

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    return {
      items,
      pagination: meta,
    };
  }

  async getPortfolioItem(id: string) {
    const item = await portfolioRepository.findById(id);
    
    if (!item) {
      throw new AppError('Portfolio item not found', 404, 'PORTFOLIO_ITEM_NOT_FOUND');
    }

    return item;
  }

  async createPortfolioItem(userId: string, data: CreatePortfolioItemDto) {
    // First get the freelancer profile
    const freelancerProfile = await freelancerRepository.findByUserId(userId);
    
    if (!freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    return portfolioRepository.create(freelancerProfile.id, data);
  }

  async updatePortfolioItem(userId: string, id: string, data: UpdatePortfolioItemDto) {
    // First get the freelancer profile
    const freelancerProfile = await freelancerRepository.findByUserId(userId);
    
    if (!freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    // Check if the portfolio item belongs to this freelancer
    const existingItem = await portfolioRepository.findByIdAndFreelancerId(id, freelancerProfile.id);
    
    if (!existingItem) {
      throw new AppError('Portfolio item not found or access denied', 404, 'PORTFOLIO_ITEM_NOT_FOUND');
    }

    return portfolioRepository.update(id, data);
  }

  async deletePortfolioItem(userId: string, id: string) {
    // First get the freelancer profile
    const freelancerProfile = await freelancerRepository.findByUserId(userId);
    
    if (!freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    // Check if the portfolio item belongs to this freelancer
    const existingItem = await portfolioRepository.findByIdAndFreelancerId(id, freelancerProfile.id);
    
    if (!existingItem) {
      throw new AppError('Portfolio item not found or access denied', 404, 'PORTFOLIO_ITEM_NOT_FOUND');
    }

    await portfolioRepository.delete(id);
    
    return { message: 'Portfolio item deleted successfully' };
  }
}

export const portfolioService = new PortfolioService();
