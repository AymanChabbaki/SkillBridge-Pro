import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  approveMilestone,
  rejectMilestone,
} from './controller';

const router = Router();

// Create a milestone
router.post('/', authenticateToken, createMilestone);

// Get milestones (with filters and pagination)
router.get('/', authenticateToken, getMilestones);

// Get single milestone
router.get('/:id', authenticateToken, getMilestoneById);

// Update milestone
router.put('/:id', authenticateToken, updateMilestone);

// Delete milestone
router.delete('/:id', authenticateToken, deleteMilestone);

// Approve milestone
router.patch('/:id/approve', authenticateToken, approveMilestone);

// Reject milestone (with feedback)
router.post('/:id/reject', authenticateToken, rejectMilestone);

export default router;
