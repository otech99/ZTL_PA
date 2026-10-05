import { checkExact } from 'express-validator';
import { MESSAGGIO_CAMPI } from './regoleComuni';

// verifica delle multe: nessun parametro, l'utente è già identificato dal token
export const elencoMulteValidator = checkExact([], { message: MESSAGGIO_CAMPI });
