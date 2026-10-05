import { Router } from 'express';
import { autenticazione, bollettinoController, credito } from '../container';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { COSTI } from '../config/costi';
import { scaricaBollettinoValidator } from '../validators/bollettinoValidator';

const router = Router();

// download del bollettino: automobilista (solo i propri) oppure operatore
router.get('/:idBollettino', autenticazione, roleMiddleware('automobilista', 'operatore'), scaricaBollettinoValidator,
  validationMiddleware, credito(COSTI.downloadBollettino), bollettinoController.scarica);

export default router;
