import { Router } from 'express';
import { adminController, autenticazione } from '../container';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { ricaricaValidator } from '../validators/adminValidator';

const router = Router();

// ricarica del credito di un utente: solo admin, senza addebito
router.post('/ricarica', autenticazione, roleMiddleware('admin'), ricaricaValidator, validationMiddleware,
  adminController.ricarica);

export default router;
