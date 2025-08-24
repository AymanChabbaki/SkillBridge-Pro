import { Router } from 'express';
import { missionController } from './controller';
import { authenticateToken, optionalAuth } from '../../middleware/auth.middleware';
import { requireCompany, requireCompanyOrAdmin } from '../../middleware/role.middleware';

export const missionRouter = Router();

/**
 * @swagger
 * /missions:
 *   get:
 *     summary: Get all missions (public with optional auth for personalized results)
 *     tags: [Missions]
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
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *       - in: query
 *         name: seniority
 *         schema:
 *           type: string
 *           enum: [junior, mid, senior]
 *       - in: query
 *         name: budgetMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: budgetMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *       - in: query
 *         name: modality
 *         schema:
 *           type: string
 *           enum: [remote, on-site, hybrid]
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt:desc, createdAt:asc, budgetMax:desc, budgetMax:asc]
 */
missionRouter.get('/', optionalAuth, missionController.getMissions);

/**
 * @swagger
 * /missions:
 *   post:
 *     summary: Create a new mission
 *     tags: [Missions]
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
 *               - description
 *               - requiredSkills
 *               - duration
 *               - modality
 *               - sector
 *               - urgency
 *               - experience
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               optionalSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               budgetMin:
 *                 type: number
 *               budgetMax:
 *                 type: number
 *               duration:
 *                 type: string
 *               modality:
 *                 type: string
 *                 enum: [remote, on-site, hybrid]
 *               sector:
 *                 type: string
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high]
 *               experience:
 *                 type: string
 *                 enum: [junior, mid, senior]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 */
missionRouter.post('/', authenticateToken, requireCompany, missionController.createMission);

/**
 * @swagger
 * /missions/{id}:
 *   get:
 *     summary: Get mission by ID (public)
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
missionRouter.get('/:id', optionalAuth, missionController.getMissionById);

/**
 * @swagger
 * /missions/{id}:
 *   put:
 *     summary: Update mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
missionRouter.put('/:id', authenticateToken, requireCompanyOrAdmin, missionController.updateMission);

/**
 * @swagger
 * /missions/{id}/status:
 *   patch:
 *     summary: Update mission status
 *     tags: [Missions]
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
 *                 enum: [DRAFT, PUBLISHED, IN_PROGRESS, COMPLETED, CANCELLED]
 */
missionRouter.patch('/:id/status', authenticateToken, requireCompanyOrAdmin, missionController.updateMissionStatus);

/**
 * @swagger
 * /missions/{id}:
 *   delete:
 *     summary: Delete mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
missionRouter.delete('/:id', authenticateToken, requireCompanyOrAdmin, missionController.deleteMission);
