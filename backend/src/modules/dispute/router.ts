import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { successResponse } from '../../utils/response';

const router = Router();

/**
 * @swagger
 * /api/v1/disputes:
 *   post:
 *     summary: Create dispute
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, async (req, res) => {
  return successResponse(res, null, 'Dispute module - under construction');
});

/**
 * @swagger
 * /api/v1/disputes/{id}/status:
 *   patch:
 *     summary: Update dispute status
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', authenticateToken, async (req, res) => {
  return successResponse(res, null, 'Dispute status updated - under construction');
});

export default router;
