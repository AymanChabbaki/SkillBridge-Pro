import { InterviewRepository } from './repository';
import { CreateInterviewDto, UpdateInterviewDto } from './dto';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors';
import { NotificationRepository } from '../notification/repository';
import { NotificationService } from '../notification/service';
import { shortlistService } from '../shortlist/service';

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

  /**
   * Invite a freelancer to a mission: create an application if missing, then schedule an interview.
   * Only company owner or admin may call this (router enforces requireCompanyOrAdmin).
   */
  async inviteAndSchedule(data: import('./dto').InviteInterviewDto, userId: string) {
    const { missionId, freelancerId, scheduledAt, duration, meetingLink, notes } = data;

    // Ensure mission exists and belongs to the company
    const mission = await this.interviewRepository.prisma.mission.findUnique({
      where: { id: missionId },
      include: { company: { include: { user: true } } }
    });

    if (!mission) throw new NotFoundError('Mission not found');

    // Only company owner or admin can invite
    if (mission.company.userId !== userId) {
      throw new ForbiddenError('Not authorized to invite for this mission');
    }

    // Check if application exists for this freelancer & mission
    let application = await this.interviewRepository.prisma.application.findUnique({
      where: { missionId_freelancerId: { missionId, freelancerId } },
      include: { freelancer: { include: { user: true } }, mission: true }
    });

    if (!application) {
      // Use provided coverLetter/proposedRate when available
      const appCover = data.coverLetter || `Invited by company ${mission.company.name}`;
      const appRate = data.proposedRate !== undefined ? data.proposedRate : 0;

      // Create an application record on behalf of freelancer with status SHORTLISTED
      application = await this.interviewRepository.prisma.application.create({
        data: {
          freelancerId,
          missionId,
          coverLetter: appCover,
          proposedRate: appRate,
          availabilityPlan: 'Invited by company',
          status: 'SHORTLISTED'
        },
        include: {
          freelancer: { include: { user: true } },
          mission: true
        }
      });

      // increment mission applicationsCount
      try {
        await this.interviewRepository.prisma.mission.update({ where: { id: missionId }, data: { applicationsCount: { increment: 1 } } });
      } catch (e) {}
    }

    // Mark freelancer as shortlisted for this mission so they won't appear again in matching
    try {
      await shortlistService.addToShortlist(userId, mission.company.id, missionId, freelancerId);
    } catch (e) {
      // don't block the invite if shortlist creation fails
    }

    // Now create interview using existing repository
    const interview = await this.interviewRepository.create({
      applicationId: application.id,
      scheduledAt,
      duration,
      meetingLink: meetingLink || undefined,
      notes: notes || undefined
    });

    // Notifications are created within createInterview normally; replicate that behavior
    try {
      await this.notificationRepo.create({
        userId: application.freelancer.userId,
        type: 'info',
        title: 'Interview invitation',
        body: `You have been invited to an interview for ${application.mission.title} scheduled at ${interview.scheduledAt.toISOString()}`,
        data: { interviewId: interview.id, missionId: application.mission.id }
      });
    } catch (e) {
      // ignore notification errors
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
