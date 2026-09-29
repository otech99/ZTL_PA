import { Router } from 'express';
import { autenticazione, credito, varcoController } from '../container';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { COSTI } from '../config/costi';
import {
  creaVarcoValidator,
  elencoVarchiValidator,
  idVarcoValidator,
  modificaVarcoValidator,
} from '../validators/varcoValidator';

const router = Router();

// tutte le rotte dei varchi sono riservate all'operatore autenticato
router.use(autenticazione, roleMiddleware('operatore'));

router.get('/', elencoVarchiValidator, validationMiddleware, credito(COSTI.consultazioneVarco), varcoController.elenco);
router.get('/:id', idVarcoValidator, validationMiddleware, credito(COSTI.consultazioneVarco), varcoController.dettaglio);
router.post('/', creaVarcoValidator, validationMiddleware, credito(COSTI.creazioneVarco), varcoController.crea);
router.put('/:id', modificaVarcoValidator, validationMiddleware, credito(COSTI.modificaVarco), varcoController.modifica);
router.delete('/:id', idVarcoValidator, validationMiddleware, credito(COSTI.eliminazioneVarco), varcoController.elimina);

export default router;
