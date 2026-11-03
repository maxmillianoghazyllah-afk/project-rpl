import { Router } from 'express';
import {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  getCategories,
  addCategory,
  removeCategory,
} from '../controllers/menu.controller';
import { authenticate, requireSeller } from '../middleware/auth';

const router = Router();

// Kategori Menu (Diletakkan sebelum parameter :id)
router.get('/categories', getCategories);
router.post('/categories', authenticate, requireSeller, addCategory);
router.delete('/categories/:name', authenticate, requireSeller, removeCategory);

// Menu CRUD
router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', authenticate, requireSeller, createMenu);
router.patch('/:id', authenticate, requireSeller, updateMenu);
router.delete('/:id', authenticate, requireSeller, deleteMenu);

export default router;
