import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  clearAllOrders,
} from '../controllers/order.controller';
import { authenticate, requireSeller } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/status', authenticate, requireSeller, updateOrderStatus);
router.delete('/:id', authenticate, requireSeller, deleteOrder);
router.delete('/', authenticate, requireSeller, clearAllOrders);

export default router;
