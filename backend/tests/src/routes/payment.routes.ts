import { Router } from 'express';
import { confirmPayment, decidePayment } from '../controllers/payment.controller';
import { authenticate, requireSeller } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/confirmation', authenticate, confirmPayment);
router.patch('/decision', authenticate, requireSeller, decidePayment);

export default router;
