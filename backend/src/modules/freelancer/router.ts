import { Router } from 'express';
import { freelancerController } from './controller';
import { authenticateToken, optionalAuth } from '../../middleware/auth.middleware';
import { requireFreelance } from '../../middleware/role.middleware';

export const freelancerRouter = Router();

/**
 * @swagger
 * /freelancers:
 *   get:
 *     summary: Get all freelancers (public)
 *     tags: [Freelancers]
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
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: seniority
 *         schema:
 *           type: string
 *           enum: [junior, mid, senior]
 *       - in: query
 *         name: minRate
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxRate
 *         schema:
 *           type: number
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: remote
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [available, busy, unavailable]
 */
freelancerRouter.get('/', freelancerController.getFreelancers);

/**
 * @swagger
 * /freelancers/me:
 *   get:
 *     summary: Get my freelancer profile
 *     tags: [Freelancers]
 *     security:
 *       - bearerAuth: []
 */
freelancerRouter.get('/me', authenticateToken, requireFreelance, freelancerController.getMyProfile);

/**
 * @swagger
 * /freelancers/me:
 *   put:
 *     summary: Update my freelancer profile
 *     tags: [Freelancers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - skills
 *               - seniority
 *               - availability
 *             properties:
 *               title:
 *                 type: string
 *               bio:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: [beginner, intermediate, advanced, expert]
 *               seniority:
 *                 type: string
 *                 enum: [junior, mid, senior]
 *               dailyRate:
 *                 type: number
 *               availability:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [available, busy, unavailable]
 *                   startDate:
 *                     type: string
 *                   endDate:
 *                     type: string
 *               location:
 *                 type: string
 *               remote:
 *                 type: boolean
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: number
 */
freelancerRouter.put('/me', authenticateToken, requireFreelance, freelancerController.updateMyProfile);

/**
 * @swagger
 * /freelancers/me:
 *   delete:
 *     summary: Delete my freelancer profile
 *     tags: [Freelancers]
 *     security:
 *       - bearerAuth: []
 */
freelancerRouter.delete('/me', authenticateToken, requireFreelance, freelancerController.deleteMyProfile);

/**
 * @swagger
 * /freelancers/{id}:
 *   get:
 *     summary: Get freelancer by ID (public)
 *     tags: [Freelancers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
freelancerRouter.get('/:id', optionalAuth, freelancerController.getFreelancerById);
