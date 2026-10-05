import { checkExact, param } from 'express-validator';
import { MESSAGGIO_CAMPI } from './regoleComuni';

// download del bollettino: l'id nell'indirizzo deve essere un uuid valido
export const scaricaBollettinoValidator = checkExact(
  [param('idBollettino').isUUID(4).withMessage('Deve essere un identificativo valido')],
  { message: MESSAGGIO_CAMPI },
);
