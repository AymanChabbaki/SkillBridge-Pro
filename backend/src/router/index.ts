import { Router } from 'express';
import { logger } from '../config/logger'
import { env } from '../config/env';
import { authRouter } from '../modules/auth/router';
import { userRouter } from '../modules/user/router';
import { companyRouter } from '../modules/company/router';
import { freelancerRouter } from '../modules/freelancer/router';
import { portfolioRouter } from '../modules/portfolio/router';
import { missionRouter } from '../modules/mission/router';
import { applicationRouter } from '../modules/application/router';
import { matchingRouter } from '../modules/matching/router';
import { assessmentRouter } from '../modules/assessment/router';
import { interviewRouter } from '../modules/interview/router';
import contractRouter from '../modules/contract/router';
import milestoneRouter from '../modules/milestone/router';
import paymentRouter from '../modules/payment/router';
import trackingRouter from '../modules/tracking/router';
import feedbackRouter from '../modules/feedback/router';
import disputeRouter from '../modules/dispute/router';
import analyticsRouter from '../modules/analytics/router';

export const router = Router();

// Mount all routers
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/companies', companyRouter);
router.use('/freelancers', freelancerRouter);
router.use('/portfolio', portfolioRouter);
router.use('/missions', missionRouter);
router.use('/applications', applicationRouter);
router.use('/matching', matchingRouter);
router.use('/assessments', assessmentRouter);
router.use('/interviews', interviewRouter);
router.use('/contracts', contractRouter);
router.use('/milestones', milestoneRouter);
router.use('/payments', paymentRouter);
router.use('/tracking', trackingRouter);
router.use('/feedback', feedbackRouter);
router.use('/disputes', disputeRouter);
router.use('/analytics', analyticsRouter);

logger.info('All routes mounted successfully');
