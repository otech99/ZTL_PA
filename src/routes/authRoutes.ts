import { Router } from 'express';
import { authController } from '../container';
import { loginValidator } from '../validators/authValidator';
import { validationMiddleware } from '../middlewares/validationMiddleware';

const router = Router();

// login: unica rotta non autenticata, restituisce il token JWT
router.post('/login', loginValidator, validationMiddleware, authController.login);

export default router;
