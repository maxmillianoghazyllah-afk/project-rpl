import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate, requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, requireAuth, getMe);

export default router;
