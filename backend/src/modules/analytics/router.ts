import { Router } from 'express';
import { AnalyticsController } from './controller';
import { AnalyticsService } from './service';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { prisma } from '../../config/prisma';

const router = Router();

// Initialize dependencies
const analyticsService = new AnalyticsService(prisma);
const analyticsController = new AnalyticsController(analyticsService);

/**
 * @swagger
 * /api/v1/analytics/summary:
 *   get:
 *     summary: Get analytics summary (role-aware)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary retrieved successfully
 */
router.get('/summary', 
  authenticateToken, 
  analyticsController.getSummary
);

/**
 * @swagger
 * /api/v1/analytics/top-skills:
 *   get:
 *     summary: Get top skills in demand
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top skills retrieved successfully
 */
router.get('/top-skills', 
  authenticateToken, 
  requireAdmin, 
  analyticsController.getTopSkills
);

/**
 * @swagger
 * /api/v1/analytics/market-trends:
 *   get:
 *     summary: Get market trends
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, yearly]
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: sectors
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Market trends retrieved successfully
 */
router.get('/market-trends', 
  analyticsController.getMarketTrends
);

export default router;
