import { Router } from 'express';
import authRoutes from './authRoutes';
import ztlRoutes from './ztlRoutes';
import varcoRoutes from './varcoRoutes';
import transitoRoutes from './transitoRoutes';
import multaRoutes from './multaRoutes';
import bollettinoRoutes from './bollettinoRoutes';
import adminRoutes from './adminRoutes';

// raccoglie tutti i router dell'applicazione sotto i rispettivi prefissi
const router = Router();

router.use('/auth', authRoutes);
router.use('/ztl', ztlRoutes);
router.use('/varchi', varcoRoutes);
router.use('/transiti', transitoRoutes);
router.use('/multe', multaRoutes);
router.use('/bollettini', bollettinoRoutes);
router.use('/admin', adminRoutes);

export default router;
