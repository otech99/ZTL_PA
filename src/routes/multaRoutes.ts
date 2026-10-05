import { Router } from 'express';
import { autenticazione, credito, multaController } from '../container';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { COSTI } from '../config/costi';
import { elencoMulteValidator } from '../validators/multaValidator';

const router = Router();

// verifica delle multe a proprio carico: solo automobilista
router.get('/', autenticazione, roleMiddleware('automobilista'), elencoMulteValidator, validationMiddleware,
  credito(COSTI.verificaMulte), multaController.elenco);

export default router;
