import { Router } from 'express';
import { companyController } from './controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireCompany } from '../../middleware/role.middleware';

export const companyRouter = Router();

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies (public)
 *     tags: [Companies]
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
 *         name: industry
 *         schema:
 *           type: string
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 */
companyRouter.get('/', companyController.getCompanies);

/**
 * @swagger
 * /companies/me:
 *   get:
 *     summary: Get my company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
companyRouter.get('/me', authenticateToken, requireCompany, companyController.getMyProfile);

/**
 * @swagger
 * /companies/me:
 *   put:
 *     summary: Update my company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - industry
 *               - size
 *             properties:
 *               name:
 *                 type: string
 *               industry:
 *                 type: string
 *               size:
 *                 type: string
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               location:
 *                 type: string
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *               logo:
 *                 type: string
 *                 format: uri
 */
companyRouter.put('/me', authenticateToken, requireCompany, companyController.updateMyProfile);

/**
 * @swagger
 * /companies/me:
 *   delete:
 *     summary: Delete my company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
companyRouter.delete('/me', authenticateToken, requireCompany, companyController.deleteMyProfile);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID (public)
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
companyRouter.get('/:id', companyController.getCompanyById);
