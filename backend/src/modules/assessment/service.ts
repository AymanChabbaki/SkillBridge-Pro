import { assessmentRepository } from './repository';
import { applicationRepository } from '../application/repository';
import { companyRepository } from '../company/repository';
import { AppError } from '../../utils/response';
import { getPagination, createPaginationMeta } from '../../utils/pagination';
import { CreateAssessmentDto, SubmitAssessmentDto, ScoreAssessmentDto, GetAssessmentsQueryDto } from './dto';

export class AssessmentService {
  async getAssessments(query: GetAssessmentsQueryDto) {
    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    const { assessments, total } = await assessmentRepository.findMany({
      type: query.type,
      applicationId: query.applicationId,
      pagination,
    });

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    return {
      assessments,
      pagination: meta,
    };
  }

  async getAssessmentById(id: string) {
    const assessment = await assessmentRepository.findById(id);
    
    if (!assessment) {
      throw new AppError('Assessment not found', 404, 'ASSESSMENT_NOT_FOUND');
    }

    return assessment;
  }

  async createAssessment(userId: string, data: CreateAssessmentDto) {
    // Verify the application exists and user has access
    const application = await applicationRepository.findById(data.applicationId);
    
    if (!application) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    }

    // Get company profile to verify ownership
    const companyProfile = await companyRepository.findByUserId(userId);
    
    if (!companyProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    // Check if the mission belongs to this company
    if (application.mission.companyId !== companyProfile.id) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Create the assessment
    const assessment = await assessmentRepository.create({
      ...data,
      reviewerId: userId,
    });

    // Update application status to ASSESSMENT_SENT
    await applicationRepository.updateStatus(data.applicationId, 'ASSESSMENT_SENT');

    return assessment;
  }

  async submitAssessment(userId: string, id: string, data: SubmitAssessmentDto) {
    const assessment = await assessmentRepository.findById(id);
    
    if (!assessment) {
      throw new AppError('Assessment not found', 404, 'ASSESSMENT_NOT_FOUND');
    }

    // Check if the freelancer owns this assessment
    if (assessment.application.freelancer.userId !== userId) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Check if already submitted
    if (assessment.submittedAt) {
      throw new AppError('Assessment already submitted', 400, 'ASSESSMENT_ALREADY_SUBMITTED');
    }

    // Validate answers match questions
    const questions = assessment.questions as any[];
    const questionIds = questions.map(q => q.id);
    const answerQuestionIds = data.answers.map(a => a.questionId);
    
    const missingAnswers = questionIds.filter(qId => !answerQuestionIds.includes(qId));
    if (missingAnswers.length > 0) {
      throw new AppError('Missing answers for some questions', 400, 'MISSING_ANSWERS');
    }

    // Submit the assessment
    await assessmentRepository.submitAnswers(id, data.answers);

    // Update application status to ASSESSMENT_COMPLETED
    await applicationRepository.updateStatus(assessment.applicationId, 'ASSESSMENT_COMPLETED');

    return { message: 'Assessment submitted successfully' };
  }

  async scoreAssessment(userId: string, id: string, data: ScoreAssessmentDto) {
    const assessment = await assessmentRepository.findById(id);
    
    if (!assessment) {
      throw new AppError('Assessment not found', 404, 'ASSESSMENT_NOT_FOUND');
    }

    // Check if user is the reviewer or admin
    if (assessment.reviewerId !== userId && userId !== 'admin') {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Check if assessment was submitted
    if (!assessment.submittedAt) {
      throw new AppError('Assessment not yet submitted', 400, 'ASSESSMENT_NOT_SUBMITTED');
    }

    // Validate score doesn't exceed max score
    if (data.score > assessment.maxScore) {
      throw new AppError('Score cannot exceed maximum score', 400, 'SCORE_EXCEEDS_MAX');
    }

    return assessmentRepository.scoreAssessment(id, data.score, data.reviewNotes);
  }

  async getAssessmentsForApplication(applicationId: string) {
    return assessmentRepository.findByApplicationId(applicationId);
  }

  private calculateAutoScore(assessment: any, answers: any[]) {
    // Simple auto-scoring for multiple choice questions
    let totalScore = 0;
    const questions = assessment.questions as any[];
    
    for (const question of questions) {
      if (question.type === 'multiple_choice' && question.correctAnswer) {
        const answer = answers.find(a => a.questionId === question.id);
        if (answer && answer.answer === question.correctAnswer) {
          totalScore += question.points || 10;
        }
      }
    }
    
    return totalScore;
  }
}

export const assessmentService = new AssessmentService();
