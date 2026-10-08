import { Router } from 'express';
import authRoutes from './auth.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import queueRoutes from './queue.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/orders/:id/payment', paymentRoutes);
router.use('/queue', queueRoutes);

export default router;
