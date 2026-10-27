import { Router } from 'express';
import { getQueue, updateQueueStatus } from '../controllers/queue.controller';
import { authenticate, requireSeller } from '../middleware/auth';

const router = Router();

router.get('/', getQueue);
router.patch('/:id/status', authenticate, requireSeller, updateQueueStatus);

export default router;
