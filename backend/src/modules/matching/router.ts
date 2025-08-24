import { Router } from 'express';
import { matchingController } from './controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireFreelance, requireCompanyOrAdmin } from '../../middleware/role.middleware';

export const matchingRouter = Router();

/**
 * @swagger
 * /matching/missions:
 *   get:
 *     summary: Get top matching missions for freelancer
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: freelancerId
 *         schema:
 *           type: string
 *         description: Freelancer ID (admin only, otherwise uses current user)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 */
matchingRouter.get('/missions', authenticateToken, matchingController.getTopMatchingMissions);

/**
 * @swagger
 * /matching/freelancers:
 *   get:
 *     summary: Get top matching freelancers for mission
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mission ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 */
matchingRouter.get('/freelancers', authenticateToken, requireCompanyOrAdmin, matchingController.getTopMatchingFreelancers);
