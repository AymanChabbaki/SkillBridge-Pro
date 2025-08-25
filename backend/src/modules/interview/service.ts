import { InterviewRepository } from './repository';
import { CreateInterviewDto, UpdateInterviewDto } from './dto';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors';
import { NotificationRepository } from '../notification/repository';
import { NotificationService } from '../notification/service';

export class InterviewService {
  private notificationRepo: NotificationRepository;
  private notificationService: NotificationService;

  constructor(private interviewRepository: InterviewRepository) {
    this.notificationRepo = new NotificationRepository(this.interviewRepository.prisma);
    this.notificationService = new NotificationService(this.notificationRepo);
  }

  async createInterview(data: CreateInterviewDto, userId: string) {
    // Verify the application exists and user has permission
    const application = await this.interviewRepository.prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        mission: {
          include: { company: { include: { user: true } } }
        },
        freelancer: { include: { user: true } }
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

    const interview = await this.interviewRepository.create(data);

    // Create in-app notification for freelancer
    try {
      const freelancerUserEmail = application.freelancer.user?.email;
      const companyUserEmail = application.mission.company.user?.email;

      await this.notificationRepo.create({
        userId: application.freelancer.userId,
        type: 'info',
        title: 'Interview scheduled',
        body: `An interview has been scheduled for your application to ${application.mission.title} on ${interview.scheduledAt.toISOString()}`,
        data: { interviewId: interview.id, missionId: application.mission.id }
      });

      // Optionally send email notifications when SMTP is configured
      if (freelancerUserEmail) {
        await this.notificationService.sendEmailIfConfigured(
          freelancerUserEmail,
          'Interview scheduled',
          `<p>Your interview for <strong>${application.mission.title}</strong> is scheduled at ${interview.scheduledAt.toISOString()}</p>`
        );
      }

      if (companyUserEmail) {
        await this.notificationRepo.create({
          userId: application.mission.company.userId,
          type: 'info',
          title: 'Interview scheduled',
          body: `You scheduled an interview for ${application.mission.title} on ${interview.scheduledAt.toISOString()}`,
          data: { interviewId: interview.id, missionId: application.mission.id }
        });

        await this.notificationService.sendEmailIfConfigured(
          companyUserEmail,
          'Interview scheduled',
          `<p>You scheduled an interview for <strong>${application.mission.title}</strong> at ${interview.scheduledAt.toISOString()}</p>`
        );
      }
    } catch (err) {
      // Notification errors shouldn't block interview creation
      // Log and continue
      // eslint-disable-next-line no-console
      console.warn('Failed to create/send notifications for interview', err);
    }

    return interview;
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

  async completeInterview(id: string, payload: { rating?: number; notes?: string }, userId: string, role: string) {
    const interview = await this.interviewRepository.findById(id);
    if (!interview) throw new NotFoundError('Interview not found');

    // Only company owner or admin can mark complete
    const isCompanyOwner = interview.application.mission.company.userId === userId;
    const isAdmin = role === 'ADMIN';
    if (!isCompanyOwner && !isAdmin) throw new ForbiddenError('Not authorized to complete this interview');

    // Perform interview update, feedback creation (optional), and application status update in a transaction
    const prisma = this.interviewRepository.prisma;
    try {
      const results = await prisma.$transaction(async (tx) => {
        // update interview record
        const updatedInterview = await tx.interview.update({
          where: { id },
          data: { completed: true, rating: payload.rating, notes: payload.notes },
          include: {
            application: {
              include: {
                mission: { include: { company: true } },
                freelancer: true
              }
            }
          }
        });

        // create feedback if provided
        let feedback = null;
        if (payload.rating !== undefined || payload.notes) {
          feedback = await tx.feedback.create({
            data: {
              fromUserId: interview.application.mission.company.userId,
              toUserId: interview.application.freelancer.userId,
              missionId: interview.application.mission.id,
              rating: payload.rating || 0,
              comment: payload.notes || '',
              isPublic: true,
            }
          });
        }

        const app = await tx.application.update({
          where: { id: interview.application.id },
          data: { status: 'INTERVIEW_COMPLETED' }
        });

        return { updatedInterview, feedback, app };
      });

      return results.updatedInterview;
    } catch (e) {
      // if transaction fails, log and rethrow
      // eslint-disable-next-line no-console
      console.error('Transaction failed during interview completion', e);
      throw e;
    }
  }
}
