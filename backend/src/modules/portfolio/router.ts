import { Router } from 'express';
import { portfolioController } from './controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireFreelance } from '../../middleware/role.middleware';

export const portfolioRouter = Router();

/**
 * @swagger
 * /portfolio/me:
 *   get:
 *     summary: Get my portfolio items
 *     tags: [Portfolio]
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
 *         name: technology
 *         schema:
 *           type: string
 */
portfolioRouter.get('/me', authenticateToken, requireFreelance, portfolioController.getMyPortfolio);

/**
 * @swagger
 * /portfolio/me:
 *   post:
 *     summary: Create portfolio item
 *     tags: [Portfolio]
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
 *               - technologies
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [live, github, demo, documentation]
 *                     url:
 *                       type: string
 *                       format: uri
 *               impact:
 *                 type: string
 *               duration:
 *                 type: string
 *               teamSize:
 *                 type: number
 */
portfolioRouter.post('/me', authenticateToken, requireFreelance, portfolioController.createPortfolioItem);

/**
 * @swagger
 * /portfolio/me/{id}:
 *   put:
 *     summary: Update portfolio item
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
portfolioRouter.put('/me/:id', authenticateToken, requireFreelance, portfolioController.updatePortfolioItem);

/**
 * @swagger
 * /portfolio/me/{id}:
 *   delete:
 *     summary: Delete portfolio item
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
portfolioRouter.delete('/me/:id', authenticateToken, requireFreelance, portfolioController.deletePortfolioItem);

/**
 * @swagger
 * /portfolio/{id}:
 *   get:
 *     summary: Get portfolio item by ID (public)
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
portfolioRouter.get('/:id', portfolioController.getPortfolioItem);
