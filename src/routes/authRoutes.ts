import { Router } from 'express';
import { authController } from '../container';
import { loginValidator } from '../validators/authValidator';
import { validationMiddleware } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/login', loginValidator, validationMiddleware, authController.login);

export default router;
