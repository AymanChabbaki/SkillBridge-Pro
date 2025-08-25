import { shortlistRepository } from './repository';
import { missionRepository } from '../mission/repository';
import { AppError } from '../../utils/response';

export class ShortlistService {
  async addToShortlist(userId: string, companyId: string, missionId: string, freelancerId: string, notes?: string) {
    // ensure mission belongs to company (ownership)
    const mission = await missionRepository.findByIdAndCompanyId(missionId, companyId);
    if (!mission) throw new AppError('Mission not found or not owned by company', 404, 'MISSION_NOT_FOUND');

    // attempt to create, but handle unique constraint gracefully
    try {
      return await shortlistRepository.create({ companyId, missionId, freelancerId, notes });
    } catch (err: any) {
      // If already exists, return existing
      if (String(err?.message || '').toLowerCase().includes('unique') || err?.code === 'P2002') {
        const existing = await shortlistRepository.findOne(companyId, missionId, freelancerId);
        if (existing) return existing;
      }
      throw err;
    }
  }

  async list(companyId: string, missionId: string) {
    return shortlistRepository.findByCompanyAndMission(companyId, missionId);
  }

  async remove(companyId: string, missionId: string, freelancerId: string) {
    return shortlistRepository.remove(companyId, missionId, freelancerId);
  }
}

export const shortlistService = new ShortlistService();
