import { Router } from 'express';
import { ContractController } from './controller';
import { ContractService } from './service';
import { ContractRepository } from './repository';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireFreelanceOrCompany, requireCompanyOrAdmin, requireFreelance } from '../../middleware/role.middleware';
import { prisma } from '../../config/prisma';

const router = Router();

// Initialize dependencies
const contractRepository = new ContractRepository(prisma);
const contractService = new ContractService(contractRepository);
const contractController = new ContractController(contractService);

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateContract:
 *       type: object
 *       required:
 *         - missionId
 *         - freelancerId
 *         - terms
 *         - startDate
 *       properties:
 *         missionId:
 *           type: string
 *         freelancerId:
 *           type: string
 *         templateId:
 *           type: string
 *         terms:
 *           type: object
 *         hourlyRate:
 *           type: number
 *           minimum: 0
 *         fixedPrice:
 *           type: number
 *           minimum: 0
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/contracts:
 *   post:
 *     summary: Create a new contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContract'
 *     responses:
 *       201:
 *         description: Contract created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Mission or freelancer not found
 */
router.post('/', 
  authenticateToken, 
  requireCompanyOrAdmin, 
  contractController.createContract
);

/**
 * @swagger
 * /api/v1/contracts:
 *   get:
 *     summary: Get contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, CANCELLED, DISPUTED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Contracts retrieved successfully
 */
router.get('/', 
  authenticateToken, 
  contractController.getContracts
);

/**
 * @swagger
 * /api/v1/contracts/active:
 *   get:
 *     summary: Get active contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active contracts retrieved successfully
 */
router.get('/active', 
  authenticateToken, 
  contractController.getActiveContracts
);

/**
 * @swagger
 * /api/v1/contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     tags: [Contracts]
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
 *         description: Contract retrieved successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Contract not found
 */
router.get('/:id', 
  authenticateToken, 
  contractController.getContract
);

/**
 * @swagger
 * /api/v1/contracts/{id}:
 *   patch:
 *     summary: Update contract
 *     tags: [Contracts]
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
 *         description: Contract updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Contract not found
 */
router.patch('/:id', 
  authenticateToken, 
  requireCompanyOrAdmin, 
  contractController.updateContract
);

/**
 * @swagger
 * /api/v1/contracts/{id}/sign:
 *   post:
 *     summary: Sign contract
 *     tags: [Contracts]
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
 *               - signature
 *               - agreedToTerms
 *             properties:
 *               signature:
 *                 type: string
 *               agreedToTerms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contract signed successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Contract not found
 */
router.post('/:id/sign', 
  authenticateToken, 
  requireFreelance, 
  contractController.signContract
);

/**
 * @swagger
 * /api/v1/contracts/{id}:
 *   delete:
 *     summary: Delete contract
 *     tags: [Contracts]
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
 *         description: Contract deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Contract not found
 */
router.delete('/:id', 
  authenticateToken, 
  requireCompanyOrAdmin, 
  contractController.deleteContract
);

export default router;
