import { Router } from 'express';
import { register, login, refresh, logout, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/profile', authenticate, getProfile as any);
router.put('/profile', authenticate, updateProfile as any);

export default router;
