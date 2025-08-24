import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { successResponse, paginatedResponse } from '../../utils/response';
import { prisma } from '../../config/prisma';

const router = Router();

/**
 * Create feedback
 */
router.post('/', authenticateToken, async (req, res) => {
  const fromUserId = req.user!.id;
  const { toUserId, missionId, contractId, rating = 5, comment, skills, isPublic = true } = req.body || {};
  if (!toUserId) return res.status(400).json({ success: false, error: { message: 'toUserId is required' } });

  const created = await prisma.feedback.create({
    data: {
      fromUserId,
      toUserId,
      missionId: missionId || null,
      contractId: contractId || null,
      rating: Number(rating) || 0,
      comment: comment || '',
      skills: skills || undefined,
      isPublic: Boolean(isPublic),
    },
  });

  return successResponse(res, created, 'Feedback saved');
});

/**
 * Get public feedback for a user
 */
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 10), 100);

  const [total, items] = await Promise.all([
    prisma.feedback.count({ where: { toUserId: userId, isPublic: true } }),
    prisma.feedback.findMany({
      where: { toUserId: userId, isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { fromUser: { select: { id: true, name: true, avatar: true } } },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const mapped = items.map(i => ({
    id: i.id,
    fromUserId: i.fromUserId,
    authorName: i.fromUser?.name || null,
    fromUser: i.fromUser ? { id: i.fromUser.id, name: i.fromUser.name, avatar: i.fromUser.avatar } : undefined,
    toUserId: i.toUserId,
    rating: i.rating,
    comment: i.comment,
    skills: i.skills,
    isPublic: i.isPublic,
    createdAt: i.createdAt,
  }));

  return paginatedResponse(res, mapped, { page, limit, total, totalPages: Math.ceil(total / limit) });
});


/**
 * Get feedback for the authenticated user (private or public depending on requester)
 */
router.get('/me', authenticateToken, async (req, res) => {
  const userId = req.user!.id;
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 10), 100);

  const [total, items] = await Promise.all([
    prisma.feedback.count({ where: { toUserId: userId } }),
    prisma.feedback.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: { fromUser: { select: { id: true, name: true, avatar: true } } },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const mapped = items.map(i => ({
    id: i.id,
    fromUserId: i.fromUserId,
    authorName: i.fromUser?.name || null,
    fromUser: i.fromUser ? { id: i.fromUser.id, name: i.fromUser.name, avatar: i.fromUser.avatar } : undefined,
    toUserId: i.toUserId,
    rating: i.rating,
    comment: i.comment,
    skills: i.skills,
    isPublic: i.isPublic,
    createdAt: i.createdAt,
  }));

  return paginatedResponse(res, mapped, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

export default router;
