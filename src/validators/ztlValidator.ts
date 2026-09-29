import { body, param, checkExact } from 'express-validator';

const MESSAGGIO_CAMPI = 'Campi non ammessi nella richiesta';

const idValido = () =>
  param('id').isInt({ min: 1 }).withMessage("L'id deve essere un intero positivo");

// trim: un nome fatto solo di spazi viene considerato vuoto
const campiZtl = () => [
  body('nome')
    .isString().withMessage('Il nome deve essere una stringa')
    .bail()
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio'),
  body('citta')
    .isString().withMessage('La città deve essere una stringa')
    .bail()
    .trim()
    .notEmpty().withMessage('La città è obbligatoria'),
];

export const elencoZtlValidator = checkExact([], { message: MESSAGGIO_CAMPI });
export const idZtlValidator = checkExact([idValido()], { message: MESSAGGIO_CAMPI });
export const creaZtlValidator = checkExact(campiZtl(), { message: MESSAGGIO_CAMPI });
export const modificaZtlValidator = checkExact([idValido(), ...campiZtl()], { message: MESSAGGIO_CAMPI });
