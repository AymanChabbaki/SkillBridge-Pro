import { prisma } from '../../config/prisma';
import { redis } from '../../config/redis';
import { freelancerRepository } from '../freelancer/repository';
import { missionRepository } from '../mission/repository';
import { AppError } from '../../utils/response';
// normalize helpers
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { normalizeSkills, normalizeLanguages, normalizeFreelancerProfile } = require('../../utils/normalize');

interface MatchResult {
  id: string;
  matchScore: number;
  matchReasons: string[];
}

export class MatchingService {
  async getTopMatchingMissions(freelancerId: string, limit = 10) {
    const cacheKey = `matching:missions:${freelancerId}:${limit}`;
    
    try {
      // Try to get from cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      // Continue without cache if Redis fails
    }

  let freelancer = await freelancerRepository.findById(freelancerId);
    
    if (!freelancer) {
      throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
    }

    // Get published missions
  const missions = await prisma.mission.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            verified: true,
            logo: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      take: 100, // Get more missions to score and then filter top matches
    });

    const matches: (MatchResult & { mission: any })[] = [];

    // Fetch applications by this freelancer to exclude already-applied missions
    const appliedMissions = new Set(
      (await prisma.application.findMany({ where: { freelancerId }, select: { missionId: true } })).map(a => a.missionId)
    );

    for (const mission of missions) {
      if (appliedMissions.has(mission.id)) {
        // Skip missions already applied by this freelancer
        continue;
      }
      // normalize mission skills (handle Prisma Json fields which may be string or already array)
      if (!Array.isArray(mission.requiredSkills)) {
        try {
          if (typeof mission.requiredSkills === 'string') {
            mission.requiredSkills = JSON.parse(mission.requiredSkills || '[]');
          } else if (Array.isArray(mission.requiredSkills)) {
            // already fine
          } else {
            mission.requiredSkills = [];
          }
        } catch (e) {
          mission.requiredSkills = [];
        }
      }

  const { score, reasons } = this.calculateMissionMatch(freelancer, mission);
      
      if (score > 0.3) { // Only include missions with decent match score
        matches.push({
          id: mission.id,
          matchScore: score,
          matchReasons: reasons,
          mission,
        });
      }
    }

    // Sort by match score and take top results
    const topMatches = matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(match => ({
        mission: match.mission,
        matchScore: match.matchScore,
        matchReasons: match.matchReasons,
      }));

    // Cache the result for 3 minutes
    try {
      await redis.setEx(cacheKey, 180, JSON.stringify(topMatches));
    } catch (error) {
      // Continue without caching if Redis fails
    }

    return topMatches;
  }

  async getTopMatchingFreelancers(missionId: string, limit = 10) {
    const cacheKey = `matching:freelancers:${missionId}:${limit}`;
    
    try {
      // Try to get from cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      // Continue without cache if Redis fails
    }

    const mission = await missionRepository.findById(missionId);
    
    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    // Get available freelancers
    const freelancers = await prisma.freelancerProfile.findMany({
      where: {
        availability: {
          path: ['status'],
          equals: 'available',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        portfolio: {
          select: {
            id: true,
            title: true,
            technologies: true,
          },
          take: 3,
        },
        _count: {
          select: {
            applications: true,
            contracts: true,
          },
        },
      },
      take: 100, // Get more freelancers to score and then filter top matches
    });

    const matches: (MatchResult & { freelancer: any })[] = [];

    // Fetch applicants for this mission to exclude them from the matching list
    const applicants = new Set(
      (await prisma.application.findMany({ where: { missionId }, select: { freelancerId: true } })).map(a => a.freelancerId)
    );

    // Fetch shortlisted freelancers for this mission to exclude them as well
    let shortlistedSet = new Set<string>();
    try {
      const shortlisted = await (prisma as any).shortlist.findMany({ where: { missionId }, select: { freelancerId: true } });
      shortlistedSet = new Set((shortlisted || []).map((s: any) => s.freelancerId));
    } catch (e) {
      // If shortlist table not available yet (prisma client not generated), continue without shortlist exclusion
    }

    for (const f of freelancers) {
      if (applicants.has(f.id)) continue; // skip freelancers who already applied
      if (shortlistedSet.has(f.id)) continue; // skip freelancers already shortlisted for this mission
      // normalize freelancer profile fields
      let fre = f;
      try {
        fre = normalizeFreelancerProfile(fre);
      } catch (e) {
        // fallback
        if (!Array.isArray((fre as any).skills)) (fre as any).skills = [];
        if (typeof (fre as any).availability === 'string') {
          try { (fre as any).availability = JSON.parse((fre as any).availability); } catch (err) { (fre as any).availability = {}; }
        }
      }

      // Server-side skill pre-filter: ensure freelancer has at least one required skill if mission specifies requiredSkills
      const requiredSkills = Array.isArray(mission.requiredSkills) ? mission.requiredSkills.map((s: any) => String(s).toLowerCase()) : [];
      const freelancerSkills = Array.isArray(fre.skills) ? (fre.skills as any[]).map((s: any) => (s.name || s).toLowerCase()) : [];

      if (requiredSkills.length > 0) {
        const hasSkill = requiredSkills.some((rs: string) => freelancerSkills.some((fs: string) => fs.includes(String(rs).toLowerCase())));
        if (!hasSkill) continue; // skip freelancers that don't match any required skill
      }

      const { score, reasons } = this.calculateFreelancerMatch(mission, fre);

      if (score > 0.3) { // Only include freelancers with decent match score
        matches.push({
          id: fre.id,
          matchScore: score,
          matchReasons: reasons,
          freelancer: fre,
        });
      }
    }

    // Sort by match score and take top results
    const topMatches = matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(match => ({
        freelancer: match.freelancer,
        matchScore: match.matchScore,
        matchReasons: match.matchReasons,
      }));

    // Cache the result for 3 minutes
    try {
      await redis.setEx(cacheKey, 180, JSON.stringify(topMatches));
    } catch (error) {
      // Continue without caching if Redis fails
    }

    return topMatches;
  }

  private calculateMissionMatch(freelancer: any, mission: any) {
    let score = 0;
    const reasons: string[] = [];

    // Skills matching (40% weight)
  const requiredSkills = Array.isArray(mission.requiredSkills) ? mission.requiredSkills : [];
  const freelancerSkills = Array.isArray(freelancer.skills) ? (freelancer.skills as any[]).map((s: any) => (s.name || s).toLowerCase()) : [];
    const matchingSkills = requiredSkills.filter((skill: string) => 
      freelancerSkills.some((fs: string) => fs.includes(String(skill).toLowerCase()))
    );
    
    if (matchingSkills.length > 0 && requiredSkills.length > 0) {
      const skillsScore = (matchingSkills.length / requiredSkills.length) * 0.4;
      score += skillsScore;
      reasons.push(`${matchingSkills.length}/${requiredSkills.length} required skills match`);
    }

    // Budget fit (25% weight)
    if (mission.budgetMax && freelancer.dailyRate) {
      if (freelancer.dailyRate <= mission.budgetMax) {
        const budgetFit = 0.25;
        score += budgetFit;
        reasons.push('Budget fits your daily rate');
      } else if (freelancer.dailyRate <= mission.budgetMax * 1.2) {
        // Close to budget
        score += 0.15;
        reasons.push('Budget close to your rate');
      }
    }

    // Experience level match (20% weight)
    if (mission.experience === freelancer.seniority) {
      score += 0.2;
      reasons.push('Experience level matches');
    } else {
      // Partial match for adjacent levels
      const levels = ['junior', 'mid', 'senior'];
      const missionLevel = levels.indexOf(mission.experience);
      const freelancerLevel = levels.indexOf(freelancer.seniority);
      
      if (Math.abs(missionLevel - freelancerLevel) === 1) {
        score += 0.1;
        reasons.push('Experience level close match');
      }
    }

    // Location/Remote preference (10% weight)
    if (mission.modality === 'remote' && freelancer.remote) {
      score += 0.1;
      reasons.push('Remote work preference matches');
    } else if (mission.modality !== 'remote' && freelancer.location) {
      // Simple location matching (could be enhanced with geo-location)
      score += 0.05;
      reasons.push('Location preference considered');
    }

    // Freelancer rating and experience (5% weight)
    if (freelancer.rating && freelancer.rating >= 4.0) {
      score += 0.05;
      reasons.push('High rating freelancer');
    }

    return { score: Math.min(score, 1), reasons };
  }

  private calculateFreelancerMatch(mission: any, freelancer: any) {
    let score = 0;
    const reasons: string[] = [];

    // Skills matching (40% weight)
  const requiredSkills = Array.isArray(mission.requiredSkills) ? mission.requiredSkills : [];
  const freelancerSkills = Array.isArray(freelancer.skills) ? (freelancer.skills as any[]).map((s: any) => (s.name || s).toLowerCase()) : [];
    const matchingSkills = requiredSkills.filter((skill: string) => 
      freelancerSkills.some((fs: string) => fs.includes(String(skill).toLowerCase()))
    );
    
    if (matchingSkills.length > 0 && requiredSkills.length > 0) {
      const skillsScore = (matchingSkills.length / requiredSkills.length) * 0.4;
      score += skillsScore;
      reasons.push(`${matchingSkills.length}/${requiredSkills.length} required skills match`);
    }

    // Budget fit (25% weight)
    if (mission.budgetMax && freelancer.dailyRate) {
      if (freelancer.dailyRate <= mission.budgetMax) {
        const budgetFit = 0.25;
        score += budgetFit;
        reasons.push('Rate fits mission budget');
      } else if (freelancer.dailyRate <= mission.budgetMax * 1.2) {
        // Close to budget
        score += 0.15;
        reasons.push('Rate close to budget');
      }
    }

    // Experience level match (20% weight)
    if (mission.experience === freelancer.seniority) {
      score += 0.2;
      reasons.push('Experience level matches');
    } else {
      // Partial match for adjacent levels
      const levels = ['junior', 'mid', 'senior'];
      const missionLevel = levels.indexOf(mission.experience);
      const freelancerLevel = levels.indexOf(freelancer.seniority);
      
      if (Math.abs(missionLevel - freelancerLevel) === 1) {
        score += 0.1;
        reasons.push('Experience level close match');
      }
    }

    // Availability (10% weight)
  const availability = typeof freelancer.availability === 'string' ? (() => { try { return JSON.parse(freelancer.availability); } catch(e){ return {}; } })() : freelancer.availability;
  if (availability?.status === 'available') {
      score += 0.1;
      reasons.push('Currently available');
    }

    // Performance metrics (5% weight)
    if (freelancer.rating && freelancer.rating >= 4.0) {
      score += 0.03;
      reasons.push('High-rated freelancer');
    }
    
    if (freelancer.completedJobs > 5) {
      score += 0.02;
      reasons.push('Experienced with multiple projects');
    }

    return { score: Math.min(score, 1), reasons };
  }
}

export const matchingService = new MatchingService();
