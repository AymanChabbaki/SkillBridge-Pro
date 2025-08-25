import { Router } from 'express';
import { NotificationController } from './controller';
const router = Router();
const controller = new NotificationController();

router.get('/', controller.list.bind(controller));
router.patch('/:id/read', controller.markRead.bind(controller));

export default router;
