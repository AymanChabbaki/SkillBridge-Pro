import { missionRepository } from './repository';
import { companyRepository } from '../company/repository';
import { AppError } from '../../utils/response';
import { getPagination, createPaginationMeta } from '../../utils/pagination';
import { redis } from '../../config/redis';
import { CreateMissionDto, UpdateMissionDto, UpdateMissionStatusDto, GetMissionsQueryDto } from './dto';

export class MissionService {
  async getMissions(query: GetMissionsQueryDto) {
    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    // Create cache key based on filters
    const cacheKey = `missions:${JSON.stringify({ ...query, ...pagination })}`;
    
    try {
      // Try to get from cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      // Continue without cache if Redis fails
    }

  const { missions, total } = await missionRepository.findMany({
      q: query.q,
      skills: query.skills,
      sector: query.sector,
      seniority: query.seniority,
      budgetMin: query.budgetMin,
      budgetMax: query.budgetMax,
      duration: query.duration,
      modality: query.modality,
      urgency: query.urgency,
      status: query.status,
      sort: query.sort,
      pagination,
    });

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    const result = {
      items: missions,
      pagination: meta,
    };

    // Cache the result for 5 minutes
    try {
  await redis.setEx(cacheKey, 300, JSON.stringify(result));
    } catch (error) {
      // Continue without caching if Redis fails
    }

    return result;
  }

  async getMissionById(id: string, incrementViews = false) {
    const mission = await missionRepository.findById(id);
    
    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    // Increment views if requested (for public views)
    if (incrementViews) {
      await missionRepository.incrementViews(id);
    }

    return mission;
  }

  async createMission(userId: string, data: CreateMissionDto) {
    // Get company profile
    const companyProfile = await companyRepository.findByUserId(userId);
    
    if (!companyProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    // Validate budget range
    if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
      throw new AppError('Budget minimum cannot be greater than maximum', 400, 'INVALID_BUDGET_RANGE');
    }

    const mission = await missionRepository.create(companyProfile.id, data);

    // Invalidate missions cache
    await this.invalidateMissionsCache();

    return mission;
  }

  async updateMission(userId: string, id: string, data: UpdateMissionDto) {
    // Get company profile
    const companyProfile = await companyRepository.findByUserId(userId);
    
    if (!companyProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    // Check if mission belongs to this company
    const existingMission = await missionRepository.findByIdAndCompanyId(id, companyProfile.id);
    
    if (!existingMission) {
      throw new AppError('Mission not found or access denied', 404, 'MISSION_NOT_FOUND');
    }

    // Validate budget range
    if (data.budgetMin && data.budgetMax && data.budgetMin > data.budgetMax) {
      throw new AppError('Budget minimum cannot be greater than maximum', 400, 'INVALID_BUDGET_RANGE');
    }

    const mission = await missionRepository.update(id, data);

    // Invalidate missions cache
    await this.invalidateMissionsCache();

    return mission;
  }

  async updateMissionStatus(userId: string, id: string, data: UpdateMissionStatusDto) {
    // Get company profile
    const companyProfile = await companyRepository.findByUserId(userId);
    
    if (!companyProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    // Check if mission belongs to this company
    const existingMission = await missionRepository.findByIdAndCompanyId(id, companyProfile.id);
    
    if (!existingMission) {
      throw new AppError('Mission not found or access denied', 404, 'MISSION_NOT_FOUND');
    }

    const mission = await missionRepository.updateStatus(id, data.status);

    // Invalidate missions cache
    await this.invalidateMissionsCache();

    return mission;
  }

  async deleteMission(userId: string, id: string) {
    // Get company profile
    const companyProfile = await companyRepository.findByUserId(userId);
    
    if (!companyProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    // Check if mission belongs to this company
    const existingMission = await missionRepository.findByIdAndCompanyId(id, companyProfile.id);
    
    if (!existingMission) {
      throw new AppError('Mission not found or access denied', 404, 'MISSION_NOT_FOUND');
    }

    await missionRepository.delete(id);

    // Invalidate missions cache
    await this.invalidateMissionsCache();

    return { message: 'Mission deleted successfully' };
  }

  private async invalidateMissionsCache() {
    try {
      const keys = await redis.keys('missions:*');
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      // Continue without cache invalidation if Redis fails
    }
  }
}

export const missionService = new MissionService();
