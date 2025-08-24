import { freelancerRepository } from './repository';
import { AppError } from '../../utils/response';
import { getPagination, createPaginationMeta } from '../../utils/pagination';
import { UpdateFreelancerProfileDto, GetFreelancersQueryDto } from './dto';

export class FreelancerService {
  async getFreelancers(query: GetFreelancersQueryDto) {
    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    const { freelancers, total } = await freelancerRepository.findMany({
      skills: query.skills,
      seniority: query.seniority,
      minRate: query.minRate,
      maxRate: query.maxRate,
      location: query.location,
      remote: query.remote,
      availability: query.availability,
      pagination,
    });

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    return {
      freelancers,
      pagination: meta,
    };
  }

  async getFreelancerById(id: string, incrementViews = false) {
    const freelancer = await freelancerRepository.findById(id);
    
    if (!freelancer) {
      throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
    }

    // Increment profile views if requested (for public views)
    if (incrementViews) {
      await freelancerRepository.updateProfileViews(id);
    }

    return freelancer;
  }

  async getMyFreelancerProfile(userId: string) {
    const freelancer = await freelancerRepository.findByUserId(userId);
    
    if (!freelancer) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    return freelancer;
  }

  async createOrUpdateFreelancerProfile(userId: string, data: UpdateFreelancerProfileDto) {
    const existingProfile = await freelancerRepository.findByUserId(userId);
    
    if (existingProfile) {
      return freelancerRepository.update(userId, data);
    } else {
      return freelancerRepository.create(userId, data);
    }
  }

  async deleteFreelancerProfile(userId: string) {
    const existingProfile = await freelancerRepository.findByUserId(userId);
    
    if (!existingProfile) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    await freelancerRepository.delete(userId);
    
    return { message: 'Freelancer profile deleted successfully' };
  }
}

export const freelancerService = new FreelancerService();
