import { Router } from 'express';
import authRoutes from './authRoutes';
import ztlRoutes from './ztlRoutes';
import varcoRoutes from './varcoRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ztl', ztlRoutes);
router.use('/varchi', varcoRoutes);

export default router;
