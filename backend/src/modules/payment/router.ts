import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { successResponse } from '../../utils/response';
import { prisma } from '../../config/prisma';

const router = Router();

/**
 * POST /api/v1/payments/:milestoneId/pay
 * Creates a Payment row linked to the milestone and contract.
 */
router.post('/:milestoneId/pay', authenticateToken, async (req, res) => {
  const milestoneId = req.params.milestoneId;
  const { amount, currency = 'USD', paymentMethod = 'mock', description } = req.body || {};

  // Find milestone and contract
  const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId }, select: { id: true, contractId: true, amount: true } });
  if (!milestone) return res.status(404).json({ success: false, error: { message: 'Milestone not found' } });

  const payment = await prisma.payment.create({
    data: {
      milestoneId: milestone.id,
      contractId: milestone.contractId,
      payerId: req.user!.id,
      amount: amount ?? milestone.amount,
      currency,
      status: 'COMPLETED',
      paymentMethod,
      description,
      transactionId: `mock_tx_${Date.now()}`,
      processedAt: new Date(),
    },
  });

  return successResponse(res, payment, 'Payment created (mock)');
});

router.post('/webhook', async (req, res) => {
  // For now just acknowledge
  return successResponse(res, null, 'Webhook received - mock implementation');
});

// GET /payments/history?contractId=&page=&limit=
router.get('/history', authenticateToken, async (req, res) => {
  const contractId = String(req.query.contractId || '');
  const page = parseInt(String(req.query.page || '1'), 10) || 1;
  const limit = parseInt(String(req.query.limit || '20'), 10) || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (contractId) where.contractId = contractId;

  const [items, total] = await Promise.all([
    prisma.payment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return res.json({ success: true, data: { items, total, page, limit, totalPages } });
});

export default router;
