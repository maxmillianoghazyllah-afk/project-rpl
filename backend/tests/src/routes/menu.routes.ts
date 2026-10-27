import { Router } from 'express';
import {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../controllers/menu.controller';
import { authenticate, requireSeller } from '../middleware/auth';

const router = Router();

router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', authenticate, requireSeller, createMenu);
router.patch('/:id', authenticate, requireSeller, updateMenu);
router.delete('/:id', authenticate, requireSeller, deleteMenu);

export default router;
