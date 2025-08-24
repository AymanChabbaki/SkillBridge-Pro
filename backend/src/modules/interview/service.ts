import { InterviewRepository } from './repository';
import { CreateInterviewDto, UpdateInterviewDto } from './dto';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors';

export class InterviewService {
  constructor(private interviewRepository: InterviewRepository) {}

  async createInterview(data: CreateInterviewDto, userId: string) {
    // Verify the application exists and user has permission
    const application = await this.interviewRepository.prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        mission: {
          include: { company: true }
        },
        freelancer: true
      }
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Only company owner or admin can schedule interviews
    if (application.mission.company.userId !== userId) {
      throw new ForbiddenError('Not authorized to schedule interview for this application');
    }

    // Check if interview time conflicts with existing interviews
    const scheduledAt = new Date(data.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + (data.duration * 60000));
    
    const conflictingInterviews = await this.interviewRepository.prisma.interview.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                application: {
                  mission: {
                    company: {
                      userId
                    }
                  }
                }
              },
              {
                application: {
                  freelancer: {
                    userId: application.freelancer.userId
                  }
                }
              }
            ]
          },
          {
            OR: [
              {
                AND: [
                  { scheduledAt: { lte: scheduledAt } },
                  { 
                    scheduledAt: { 
                      gte: new Date(scheduledAt.getTime() - (data.duration * 60000))
                    } 
                  }
                ]
              },
              {
                AND: [
                  { scheduledAt: { gte: scheduledAt } },
                  { scheduledAt: { lte: endTime } }
                ]
              }
            ]
          }
        ]
      }
    });

    if (conflictingInterviews.length > 0) {
      throw new ValidationError('Interview time conflicts with existing interviews');
    }

    return this.interviewRepository.create(data);
  }

  async getInterview(id: string, userId: string, role: string) {
    const interview = await this.interviewRepository.findById(id);
    
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    // Check permissions
    const isCompanyOwner = interview.application.mission.company.user.id === userId;
    const isFreelancer = interview.application.freelancer.user.id === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isFreelancer && !isAdmin) {
      throw new ForbiddenError('Not authorized to view this interview');
    }

    return interview;
  }

  async updateInterview(id: string, data: UpdateInterviewDto, userId: string, role: string) {
    const interview = await this.interviewRepository.findById(id);
    
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    // Check permissions
    const isCompanyOwner = interview.application.mission.company.user.id === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isAdmin) {
      throw new ForbiddenError('Not authorized to update this interview');
    }

    return this.interviewRepository.update(id, data);
  }

  async deleteInterview(id: string, userId: string, role: string) {
    const interview = await this.interviewRepository.findById(id);
    
    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    // Check permissions
    const isCompanyOwner = interview.application.mission.company.user.id === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isAdmin) {
      throw new ForbiddenError('Not authorized to delete this interview');
    }

    return this.interviewRepository.delete(id);
  }

  async getUpcomingInterviews(userId: string, role: string) {
    return this.interviewRepository.findUpcoming(userId, role);
  }

  async getInterviewsByApplication(applicationId: string, userId: string, role: string) {
    // Verify permission to view application
    const application = await this.interviewRepository.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        mission: {
          include: { company: true }
        },
        freelancer: true
      }
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const isCompanyOwner = application.mission.company.userId === userId;
    const isFreelancer = application.freelancer.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isFreelancer && !isAdmin) {
      throw new ForbiddenError('Not authorized to view interviews for this application');
    }

    return this.interviewRepository.findByApplicationId(applicationId);
  }
}
