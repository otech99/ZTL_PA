import { body, checkExact } from 'express-validator';
import { MESSAGGIO_CAMPI, idValido } from './regoleComuni';

// nome e città obbligatori; trim: un valore fatto solo di spazi viene considerato vuoto
const campiZtl = () => [
  body('nome')
    .isString().withMessage('Deve essere una stringa')
    .bail()
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio'),
  body('citta')
    .isString().withMessage('Deve essere una stringa')
    .bail()
    .trim()
    .notEmpty().withMessage('La città è obbligatoria'),
];

// elenco: nessun parametro ammesso
export const elencoZtlValidator = checkExact([], { message: MESSAGGIO_CAMPI });
// dettaglio ed eliminazione: solo l'id nell'indirizzo
export const idZtlValidator = checkExact([idValido()], { message: MESSAGGIO_CAMPI });
// creazione: solo i campi della ZTL
export const creaZtlValidator = checkExact(campiZtl(), { message: MESSAGGIO_CAMPI });
// modifica: id nell'indirizzo più tutti i campi della ZTL
export const modificaZtlValidator = checkExact([idValido(), ...campiZtl()], { message: MESSAGGIO_CAMPI });
