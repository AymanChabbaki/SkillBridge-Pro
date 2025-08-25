import { Router } from 'express';
import { InterviewController } from './controller';
import { InterviewService } from './service';
import { InterviewRepository } from './repository';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireCompanyOrAdmin } from '../../middleware/role.middleware';
import { prisma } from '../../config/prisma';

const router = Router();

// Initialize dependencies
const interviewRepository = new InterviewRepository(prisma);
const interviewService = new InterviewService(interviewRepository);
const interviewController = new InterviewController(interviewService);

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateInterview:
 *       type: object
 *       required:
 *         - applicationId
 *         - scheduledAt
 *         - duration
 *       properties:
 *         applicationId:
 *           type: string
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: number
 *           minimum: 15
 *           maximum: 480
 *         meetingLink:
 *           type: string
 *           format: uri
 *         notes:
 *           type: string
 *     
 *     UpdateInterview:
 *       type: object
 *       properties:
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: number
 *           minimum: 15
 *           maximum: 480
 *         meetingLink:
 *           type: string
 *           format: uri
 *         notes:
 *           type: string
 *         completed:
 *           type: boolean
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 */

/**
 * @swagger
 * /api/v1/interviews/schedule:
 *   post:
 *     summary: Schedule an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInterview'
 *     responses:
 *       201:
 *         description: Interview scheduled successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Application not found
 */
router.post('/schedule', 
  authenticateToken, 
  requireCompanyOrAdmin, 
  interviewController.createInterview
);

/**
 * @swagger
 * /api/v1/interviews/invite:
 *   post:
 *     summary: Invite freelancer to mission and schedule interview (company)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - missionId
 *               - freelancerId
 *               - scheduledAt
 *               - duration
 *             properties:
 *               missionId:
 *                 type: string
 *               freelancerId:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               meetingLink:
 *                 type: string
 *                 format: uri
 */
router.post('/invite',
  authenticateToken,
  requireCompanyOrAdmin,
  interviewController.inviteAndSchedule
);

/**
 * @swagger
 * /api/v1/interviews/upcoming:
 *   get:
 *     summary: Get upcoming interviews
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming interviews retrieved successfully
 */
router.get('/upcoming', 
  authenticateToken, 
  interviewController.getUpcomingInterviews
);

/**
 * @swagger
 * /api/v1/interviews/application/{applicationId}:
 *   get:
 *     summary: Get interviews by application
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application interviews retrieved successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Application not found
 */
router.get('/application/:applicationId', 
  authenticateToken, 
  interviewController.getInterviewsByApplication
);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview retrieved successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Interview not found
 */
router.get('/:id', 
  authenticateToken, 
  interviewController.getInterview
);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   patch:
 *     summary: Update interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInterview'
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Interview not found
 */
router.patch('/:id', 
  authenticateToken, 
  requireCompanyOrAdmin, 
  interviewController.updateInterview
);

// Mark interview complete and create feedback + update application status
router.patch('/:id/complete',
  authenticateToken,
  requireCompanyOrAdmin,
  interviewController.completeInterview
);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   delete:
 *     summary: Delete interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Interview not found
 */
router.delete('/:id', 
  authenticateToken, 
  requireCompanyOrAdmin, 
  interviewController.deleteInterview
);

export { router as interviewRouter };
