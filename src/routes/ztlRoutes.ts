import { Router } from 'express';
import { autenticazione, credito, ztlController } from '../container';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { COSTI } from '../config/costi';
import {
  creaZtlValidator,
  elencoZtlValidator,
  idZtlValidator,
  modificaZtlValidator,
} from '../validators/ztlValidator';

const router = Router();

// tutte le rotte delle ZTL sono riservate all'operatore autenticato
router.use(autenticazione, roleMiddleware('operatore'));

// per ogni rotta: validazione, verifica del credito, poi il controller
router.get('/', elencoZtlValidator, validationMiddleware, credito(COSTI.consultazioneZtl), ztlController.elenco);
router.get('/:id', idZtlValidator, validationMiddleware, credito(COSTI.consultazioneZtl), ztlController.dettaglio);
router.post('/', creaZtlValidator, validationMiddleware, credito(COSTI.creazioneZtl), ztlController.crea);
router.put('/:id', modificaZtlValidator, validationMiddleware, credito(COSTI.modificaZtl), ztlController.modifica);
router.delete('/:id', idZtlValidator, validationMiddleware, credito(COSTI.eliminazioneZtl), ztlController.elimina);

export default router;
