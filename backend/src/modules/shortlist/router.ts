import { Router } from 'express';
import { shortlistController } from './controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireCompanyOrAdmin } from '../../middleware/role.middleware';

const router = Router();

router.post('/', authenticateToken, requireCompanyOrAdmin, (req, res) => shortlistController.add(req, res));
router.get('/', authenticateToken, requireCompanyOrAdmin, (req, res) => shortlistController.list(req, res));
router.delete('/:companyId/:missionId/:freelancerId', authenticateToken, requireCompanyOrAdmin, (req, res) => shortlistController.remove(req, res));

export default router;
