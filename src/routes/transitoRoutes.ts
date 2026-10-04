import { Router } from 'express';
import { autenticazione, credito, transitoController } from '../container';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { COSTI } from '../config/costi';
import {
  creaTransitoValidator,
  elencoTransitiValidator,
  idTransitoValidator,
  modificaTransitoValidator,
} from '../validators/transitoValidator';

const router = Router();

// tutte le rotte dei transiti richiedono autenticazione; i ruoli ammessi cambiano per rotta
router.use(autenticazione);

// inserimento: operatore oppure dispositivo del varco
router.post('/', roleMiddleware('operatore', 'varco'), creaTransitoValidator, validationMiddleware,
  credito(COSTI.inserimentoTransito), transitoController.crea);

// consultazione, modifica ed eliminazione: solo operatore
router.get('/', roleMiddleware('operatore'), elencoTransitiValidator, validationMiddleware,
  credito(COSTI.consultazioneTransiti), transitoController.elencoPerVarco);
router.put('/:id', roleMiddleware('operatore'), modificaTransitoValidator, validationMiddleware,
  credito(COSTI.modificaTransito), transitoController.modifica);
router.delete('/:id', roleMiddleware('operatore'), idTransitoValidator, validationMiddleware,
  credito(COSTI.eliminazioneTransito), transitoController.elimina);

export default router;
