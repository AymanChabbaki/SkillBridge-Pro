import { PrismaClient } from '@prisma/client';
import { AnalyticsQueryDto, MarketTrendsQueryDto } from './dto';

export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  async getSummary(userId: string, role: string) {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      if (!userId || !role) {
        throw new Error('Invalid user data: userId or role is missing');
      }

      if (role === 'FREELANCE') {
        return this.getFreelancerSummary(userId, lastMonth, lastYear);
      } else if (role === 'COMPANY') {
        return this.getCompanySummary(userId, lastMonth, lastYear);
      } else if (role === 'ADMIN') {
        // return extended admin summary with extra aggregated fields
        return this.getAdminExtendedSummary(lastMonth, lastYear);
      }

      throw new Error(`Unsupported role: ${role}`);
    } catch (error) {
      console.error('Error in getSummary:', error);
      throw error;
    }
  }

  private async getFreelancerSummary(userId: string, lastMonth: Date, lastYear: Date) {
  let freelancer = await this.prisma.freelancerProfile.findUnique({
      where: { userId },
      include: {
        applications: {
          include: {
            mission: true,
            assessments: true,
            interviews: true
          }
        },
        contracts: {
          include: {
            milestones: {
              include: {
                payments: true
              }
            }
          }
        }
      }
    });

  if (!freelancer) return {};

  // TypeScript non-null local alias to satisfy strict checks below
  const fl = freelancer as any;

    // Normalize skills and languages shape to arrays to avoid runtime errors
    try {
      // lazy require to avoid circular imports during build
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { normalizeFreelancerProfile } = require('../../utils/normalize');
      // @ts-ignore
      const normalized = normalizeFreelancerProfile(freelancer);
      // overwrite freelancer local variable
      // @ts-ignore
      freelancer = normalized;
    } catch (e) {
      // ignore normalization errors and continue
      console.warn('AnalyticsService: failed to normalize freelancer profile', e);
    }

    const totalEarnings = (fl.contracts || []).reduce((sum: number, contract: any) => {
      return sum + (contract.milestones || []).reduce((milestoneSum: number, milestone: any) => {
        return milestoneSum + (milestone.payments || []).reduce((paymentSum: number, payment: any) => {
          return payment && payment.status === 'COMPLETED' ? paymentSum + (payment.amount || 0) : paymentSum;
        }, 0);
      }, 0);
    }, 0);

  const activeContracts = (fl.contracts || []).filter((c: any) => c.status === 'ACTIVE').length;
  const completedJobs = (fl.contracts || []).filter((c: any) => c.status === 'COMPLETED').length;
    
    // Applications statistics
  const totalApplications = (fl.applications || []).length;
  const acceptedApplications = (fl.applications || []).filter((a: any) => a.status === 'ACCEPTED').length;
    const conversionRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

    // Recent activity
  const recentApplications = (fl.applications || []).filter((a: any) => new Date(a.createdAt) >= lastMonth).length;
    
    // Skill demand analysis - guard in case skills is not an array
    let skillDemand: any = [];
    try {
  const freelancerSkills = (fl as any).skills;
  if (!Array.isArray(freelancerSkills)) {
        // attempt to normalize via utility
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { normalizeSkills } = require('../../utils/normalize');
          // @ts-ignore
          (fl as any).skills = normalizeSkills(freelancerSkills);
        } catch (e) {
          console.warn('AnalyticsService: failed to normalize skills', e);
          (freelancer as any).skills = [];
        }
      }

  skillDemand = await this.getSkillDemandAnalysis((fl as any).skills as any[]);
    } catch (e) {
      console.error('AnalyticsService: getSkillDemandAnalysis error', e);
      skillDemand = [];
    }

    // Compute average rating from feedback table (prefer real feedback over stored profile rating)
    let averageRating = 0;
    let ratingCount = 0;
    try {
      const agg = await this.prisma.feedback.aggregate({
        where: { toUserId: userId },
        _avg: { rating: true },
        _count: { rating: true }
      }).catch(() => ({ _avg: { rating: null }, _count: { rating: 0 } }));

      averageRating = Number(agg._avg.rating || 0);
      ratingCount = Number(agg._count.rating || 0);
    } catch (e) {
      // fallback to stored profile rating if any
      averageRating = fl.rating || 0;
      ratingCount = 0;
      console.warn('AnalyticsService: failed to aggregate feedback ratings', e);
    }

    return {
      totalEarnings,
      activeContracts,
      completedJobs,
      totalApplications,
      conversionRate: Math.round(conversionRate * 100) / 100,
      recentApplications,
      averageRating,
      ratingCount,
      profileViews: fl.profileViews || 0,
      skillDemand,
      projectedEarnings: this.calculateProjectedEarnings(fl.contracts || [], fl.dailyRate || undefined)
    };
  }

  private async getCompanySummary(userId: string, lastMonth: Date, lastYear: Date) {
    const company = await this.prisma.companyProfile.findUnique({
      where: { userId },
      include: {
        missions: {
          include: {
            applications: {
              include: {
                assessments: true,
                interviews: true
              }
            },
            contracts: {
              include: {
                milestones: {
                  include: {
                    payments: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!company) return {};

  const totalMissions = company.missions.length;
  // Missions use statuses like 'PUBLISHED', 'COMPLETED', 'CANCELLED' in the schemata.
  // Count published missions as active (previously checked 'IN_PROGRESS' which doesn't exist).
  const activeMissions = company.missions.filter(m => m.status === 'PUBLISHED' || m.status === 'IN_PROGRESS').length;
  const completedMissions = company.missions.filter(m => m.status === 'COMPLETED').length;

  // Company-scoped active contracts and active freelancers
  const allContracts = company.missions.flatMap(m => m.contracts || []);
  const activeContracts = allContracts.filter((c: any) => c.status === 'ACTIVE').length;
  const activeFreelancerIds = Array.from(new Set(allContracts.filter((c: any) => c.status === 'ACTIVE').map((c: any) => c.freelancerId).filter(Boolean)));
  const activeFreelancers = activeFreelancerIds.length;

    // Calculate total spend
    const totalSpend = company.missions.reduce((sum, mission) => {
      return sum + mission.contracts.reduce((contractSum, contract) => {
        return contractSum + contract.milestones.reduce((milestoneSum, milestone) => {
          return milestoneSum + milestone.payments.reduce((paymentSum, payment) => {
            return payment.status === 'COMPLETED' ? paymentSum + payment.amount : paymentSum;
          }, 0);
        }, 0);
      }, 0);
    }, 0);

    // Applications statistics
    const totalApplications = company.missions.reduce((sum, mission) => sum + mission.applications.length, 0);
    const avgApplicationsPerMission = totalMissions > 0 ? totalApplications / totalMissions : 0;

    // Time to hire calculation
    const avgTimeToHire = this.calculateAverageTimeToHire(company.missions);

    // Recent activity
    const recentMissions = company.missions.filter(m => m.createdAt >= lastMonth).length;

    return {
      totalMissions,
      activeMissions,
      completedMissions,
  activeContracts,
  activeFreelancers,
      totalSpend,
      totalApplications,
      avgApplicationsPerMission: Math.round(avgApplicationsPerMission * 100) / 100,
      avgTimeToHire,
      recentMissions,
      successRate: totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0
    };
  }

  private async getAdminSummary(lastMonth: Date, lastYear: Date) {
    const [
      totalUsers,
      totalMissions,
      totalContracts,
      totalPayments,
      activeDisputes
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.mission.count(),
      this.prisma.contract.count(),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.dispute.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } })
    ]);

    // Growth metrics
    const [
      newUsersLastMonth,
      newMissionsLastMonth,
      newContractsLastMonth
    ] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
      this.prisma.mission.count({ where: { createdAt: { gte: lastMonth } } }),
      this.prisma.contract.count({ where: { createdAt: { gte: lastMonth } } })
    ]);

    // Revenue (platform fees - mock calculation)
    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { fees: true }
    });

    return {
      totalUsers,
      totalMissions,
      totalContracts,
      totalPayments,
      activeDisputes,
      growth: {
        newUsers: newUsersLastMonth,
        newMissions: newMissionsLastMonth,
        newContracts: newContractsLastMonth
      },
      platformRevenue: totalRevenue._sum.fees || 0
    };
  }

  /**
   * Extended admin summary with extra aggregated fields used by the admin dashboard
   */
  private async getAdminExtendedSummary(lastMonth: Date, lastYear: Date) {
    // Base admin summary
    const base = await this.getAdminSummary(lastMonth, lastYear);

    // Additional platform-wide aggregates
    const [freelancersCount, companiesCount] = await Promise.all([
      this.prisma.freelancerProfile.count(),
      this.prisma.companyProfile.count()
    ]);

    // Average rating across feedbacks
    const ratingAgg = await this.prisma.feedback.aggregate({ _avg: { rating: true } }).catch(() => ({ _avg: { rating: null } }));
    const avgRating = Number(ratingAgg._avg.rating || 0);

    // Total volume (sum of completed payment amounts)
    const volumeAgg = await this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } }));
    const totalVolume = Number(volumeAgg._sum.amount || 0);

    // Average match time: average days between mission.createdAt and contract.createdAt for contracts tied to missions
    const contractsWithMission = await this.prisma.contract.findMany({
      select: { createdAt: true, mission: { select: { createdAt: true } } }
    }).catch(() => [] as any[]);

    let avgMatchTime = 0;
    if (contractsWithMission.length > 0) {
      const totalDays = contractsWithMission.reduce((sum: number, c: any) => {
        try {
          const mCreated = new Date(c.mission.createdAt).getTime();
          const cCreated = new Date(c.createdAt).getTime();
          const days = Math.max(0, Math.round((cCreated - mCreated) / (1000 * 60 * 60 * 24)));
          return sum + days;
        } catch (e) {
          return sum;
        }
      }, 0);

      avgMatchTime = Math.round((totalDays / contractsWithMission.length) * 100) / 100; // days, 2 decimals
    }

    // Success rate based on completed contracts
    const [totalContracts, completedContracts] = await Promise.all([
      this.prisma.contract.count(),
      this.prisma.contract.count({ where: { status: 'COMPLETED' } })
    ]);
    const successRate = totalContracts > 0 ? Math.round((completedContracts / totalContracts) * 10000) / 100 : 0;

    return {
      ...base,
      freelancersCount,
      companiesCount,
      avgRating,
      totalVolume,
      avgMatchTime,
      successRate
    };
  }

  async getTopSkills() {
    // Aggregate skills from all missions and freelancers
    const missions = await this.prisma.mission.findMany({
      select: { requiredSkills: true, optionalSkills: true }
    });

    const freelancers = await this.prisma.freelancerProfile.findMany({
      select: { skills: true }
    });

    const skillCounts: Record<string, number> = {};

    // Count skills from missions
    missions.forEach(mission => {
      const allSkills = [
        ...(mission.requiredSkills as string[] || []),
        ...(mission.optionalSkills as string[] || [])
      ];
      allSkills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Count skills from freelancers
    freelancers.forEach(freelancer => {
      const skills = (freelancer.skills as any[]) || [];
      skills.forEach((skillObj: any) => {
        const skill = skillObj.name || skillObj;
        if (skill) {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      });
    });

    return Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([skill, count]) => ({ skill, count }));
  }

  /**
   * Count currently active contracts on the platform.
   */
  async getActiveContractsCount() {
    try {
      const count = await this.prisma.contract.count({ where: { status: 'ACTIVE' } });
      return { activeContracts: count };
    } catch (e) {
      console.error('AnalyticsService.getActiveContractsCount error', e);
      return { activeContracts: 0 };
    }
  }

  /**
   * Count freelancers that are currently active (have at least one active contract)
   */
  async getActiveFreelancersCount() {
    try {
      const count = await this.prisma.freelancerProfile.count({
        where: { contracts: { some: { status: 'ACTIVE' } } }
      });
      return { activeFreelancers: count };
    } catch (e) {
      console.error('AnalyticsService.getActiveFreelancersCount error', e);
      return { activeFreelancers: 0 };
    }
  }

  async getMarketTrends(query: MarketTrendsQueryDto) {
    // This is a simplified implementation
    // In a real application, you would have more sophisticated trend analysis
    const { skills, sectors, period } = query;
    
    const missions = await this.prisma.mission.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }, // Last year
        ...(sectors && { sector: { in: sectors } })
      },
      select: {
        budgetMin: true,
        budgetMax: true,
        sector: true,
        requiredSkills: true,
        createdAt: true
      }
    });

    // Calculate average rates by skill/sector
    const trends = this.calculateTrends(missions, skills, period);
    
    return trends;
  }

  private async getSkillDemandAnalysis(freelancerSkills: any[]) {
    // Analyze demand for freelancer's skills
    const skillNames = freelancerSkills.map(s => s.name || s);
    
    const demandData = await Promise.all(
      skillNames.map(async (skill) => {
        const missionsCount = await this.prisma.mission.count({
          where: {
            OR: [
              { requiredSkills: { array_contains: skill } },
              { optionalSkills: { array_contains: skill } }
            ],
            createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 3 months
          }
        });

        return { skill, demand: missionsCount };
      })
    );

    return demandData.sort((a, b) => b.demand - a.demand);
  }

  private calculateProjectedEarnings(contracts: any[], dailyRate?: number) {
    // Simple projection based on active contracts and daily rate
    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
    const avgMonthlyDays = 20; // Working days
    
    return (dailyRate || 0) * avgMonthlyDays * activeContracts.length;
  }

  private calculateAverageTimeToHire(missions: any[]) {
    const completedMissions = missions.filter(m => 
      m.status === 'COMPLETED' && m.contracts.length > 0
    );

    if (completedMissions.length === 0) return 0;

    const totalDays = completedMissions.reduce((sum, mission) => {
      const contract = mission.contracts[0];
      const daysDiff = Math.floor(
        (new Date(contract.createdAt).getTime() - new Date(mission.createdAt).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      return sum + daysDiff;
    }, 0);

    return Math.round(totalDays / completedMissions.length);
  }

  private calculateTrends(missions: any[], skills?: string[], period: string = 'quarterly') {
    // This is a simplified trend calculation
    // Group missions by time period and calculate averages
    const grouped = missions.reduce((acc, mission) => {
      const date = new Date(mission.createdAt);
      const key = period === 'monthly' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
      
      if (!acc[key]) {
        acc[key] = { missions: [], totalBudget: 0, count: 0 };
      }
      
      acc[key].missions.push(mission);
      acc[key].totalBudget += (mission.budgetMin + mission.budgetMax) / 2 || 0;
      acc[key].count++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(grouped).map(([period, data]: [string, any]) => ({
      period,
      averageBudget: data.count > 0 ? data.totalBudget / data.count : 0,
      missionCount: data.count,
      topSectors: this.getTopSectors(data.missions)
    }));
  }

  private getTopSectors(missions: any[]) {
    const sectorCounts = missions.reduce((acc, mission) => {
      acc[mission.sector] = (acc[mission.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectorCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([sector, count]) => ({ sector, count }));
  }
}
