import { applicationRepository } from './repository';
import { freelancerRepository } from '../freelancer/repository';
import { missionRepository } from '../mission/repository';
import { companyRepository } from '../company/repository';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/response';
import { getPagination, createPaginationMeta } from '../../utils/pagination';
import { CreateApplicationDto, UpdateApplicationStatusDto, GetApplicationsQueryDto } from './dto';
import { redis } from '../../config/redis';

export class ApplicationService {
  async getMyApplications(userId: string, query: GetApplicationsQueryDto) {
    // Get freelancer profile
    const freelancerProfile = await freelancerRepository.findByUserId(userId);
    
    if (!freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    const { applications, total } = await applicationRepository.findMany({
      freelancerId: freelancerProfile.id,
      status: query.status,
      pagination,
    });

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    return {
      items: applications,
      pagination: meta,
    };
  }

  async getApplicationsForMission(userId: string, missionId: string, query: GetApplicationsQueryDto) {
    // Get company profile
    const companyProfile = await companyRepository.findByUserId(userId);
    
    if (!companyProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    // Check if mission belongs to this company
    const mission = await missionRepository.findByIdAndCompanyId(missionId, companyProfile.id);
    
    if (!mission) {
      throw new AppError('Mission not found or access denied', 404, 'MISSION_NOT_FOUND');
    }

    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    const { applications, total } = await applicationRepository.findMany({
      missionId,
      status: query.status,
      pagination,
    });

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    return {
      items: applications,
      pagination: meta,
    };
  }

  async getApplicationById(id: string) {
    const application = await applicationRepository.findById(id);
    
    if (!application) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    }

    return application;
  }

  async createApplication(userId: string, data: CreateApplicationDto) {
    // Get freelancer profile
    const freelancerProfile = await freelancerRepository.findByUserId(userId);
    
    if (!freelancerProfile) {
      throw new AppError('Freelancer profile not found', 404, 'FREELANCER_PROFILE_NOT_FOUND');
    }

    // Check if mission exists and is published
    const mission = await missionRepository.findById(data.missionId);
    
    if (!mission || mission.status !== 'PUBLISHED') {
      throw new AppError('Mission not found or not available for applications', 404, 'MISSION_NOT_AVAILABLE');
    }

    // Check if freelancer already applied to this mission
    const existingApplication = await applicationRepository.findByMissionAndFreelancer(
      data.missionId,
      freelancerProfile.id
    );
    
    if (existingApplication) {
      throw new AppError('You have already applied to this mission', 409, 'APPLICATION_EXISTS');
    }

    // Create application
    const application = await applicationRepository.create(freelancerProfile.id, data);

    // Update mission applications count
    await prisma.mission.update({
      where: { id: data.missionId },
      data: {
        applicationsCount: {
          increment: 1,
        },
      },
    });

    // Invalidate matching caches related to this freelancer and mission
    try {
      // Invalidate per-freelancer mission matches
      const missionKeys = await redis.keys(`matching:missions:${freelancerProfile.id}:*`);
      for (const k of missionKeys) await redis.del(k);

      // Invalidate per-mission freelancer matches
      const freelancerKeys = await redis.keys(`matching:freelancers:${data.missionId}:*`);
      for (const k of freelancerKeys) await redis.del(k);
    } catch (e) {
      // ignore cache invalidation errors
    }
    return application;
  }

  async updateApplicationStatus(userId: string, id: string, data: UpdateApplicationStatusDto) {
    const application = await applicationRepository.findById(id);
    
    if (!application) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    }

    // Get company profile
    const companyProfile = await companyRepository.findByUserId(userId);
    
    if (!companyProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    // Check if the mission belongs to this company
    if (application.mission.companyId !== companyProfile.id) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    return applicationRepository.updateStatus(id, data.status, data.notes);
    // Invalidate caches related to this application change
    try {
      await this._invalidateCachesForApplication(id);
    } catch (e) {
      // ignore
    }
  }

  async _invalidateCachesForApplication(applicationId: string) {
    try {
      const app = await applicationRepository.findById(applicationId);
      if (!app) return;

      const freelancerId = app.freelancerId;
      const missionId = app.missionId;

      const missionKeys = await redis.keys(`matching:missions:${freelancerId}:*`);
      for (const k of missionKeys) await redis.del(k);

      const freelancerKeys = await redis.keys(`matching:freelancers:${missionId}:*`);
      for (const k of freelancerKeys) await redis.del(k);
    } catch (e) {
      // ignore
    }
  }

  async calculateMatchingScore(applicationId: string) {
    const application = await applicationRepository.findById(applicationId);
    
    if (!application) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    }

    // Simple matching algorithm based on:
    // 1. Skills overlap
    // 2. Budget fit
    // 3. Experience level match
    // 4. Availability
    
    let score = 0;
    const mission = application.mission;
    const freelancer = application.freelancer;

    // Skills matching (40% weight)
    const requiredSkills = mission.requiredSkills as string[];
    const freelancerSkills = (freelancer.skills as any[]).map(s => s.name);
    const skillsOverlap = requiredSkills.filter(skill => 
      freelancerSkills.some(fs => fs.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    const skillsScore = (skillsOverlap / requiredSkills.length) * 0.4;
    score += skillsScore;

    // Budget fit (30% weight)
    if (mission.budgetMax && freelancer.dailyRate) {
      const budgetFit = Math.min(mission.budgetMax / freelancer.dailyRate, 1);
      score += budgetFit * 0.3;
    } else {
      score += 0.15; // Neutral score if budget not specified
    }

    // Experience level match (20% weight)
    const experienceMatch = mission.experience === freelancer.seniority ? 0.2 : 0.1;
    score += experienceMatch;

    // Rating and completed jobs (10% weight)
    if (freelancer.rating && freelancer.completedJobs > 0) {
      const performanceScore = (freelancer.rating / 5) * 0.1;
      score += performanceScore;
    }

    // Ensure score is between 0 and 1
    score = Math.min(Math.max(score, 0), 1);

    // Update the application with the calculated score
    await applicationRepository.updateMatchingScore(applicationId, score);

    return score;
  }
}

export const applicationService = new ApplicationService();
