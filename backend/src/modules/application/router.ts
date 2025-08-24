import { Router } from 'express';
import { applicationController } from './controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireFreelance, requireCompanyOrAdmin } from '../../middleware/role.middleware';

export const applicationRouter = Router();

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create application (freelancer)
 *     tags: [Applications]
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
 *               - coverLetter
 *               - proposedRate
 *               - availabilityPlan
 *             properties:
 *               missionId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               proposedRate:
 *                 type: number
 *               availabilityPlan:
 *                 type: string
 */
applicationRouter.post('/', authenticateToken, requireFreelance, applicationController.createApplication);

/**
 * @swagger
 * /applications/me:
 *   get:
 *     summary: Get my applications (freelancer)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SHORTLISTED, ASSESSMENT_SENT, ASSESSMENT_COMPLETED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, ACCEPTED, REJECTED]
 */
applicationRouter.get('/me', authenticateToken, requireFreelance, applicationController.getMyApplications);

/**
 * @swagger
 * /applications/mission/{missionId}:
 *   get:
 *     summary: Get applications for mission (company)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SHORTLISTED, ASSESSMENT_SENT, ASSESSMENT_COMPLETED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, ACCEPTED, REJECTED]
 */
applicationRouter.get('/mission/:missionId', authenticateToken, requireCompanyOrAdmin, applicationController.getApplicationsForMission);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
applicationRouter.get('/:id', authenticateToken, applicationController.getApplicationById);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status (company)
 *     tags: [Applications]
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, SHORTLISTED, ASSESSMENT_SENT, ASSESSMENT_COMPLETED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, ACCEPTED, REJECTED]
 *               notes:
 *                 type: string
 */
applicationRouter.patch('/:id/status', authenticateToken, requireCompanyOrAdmin, applicationController.updateApplicationStatus);
