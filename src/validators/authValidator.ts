import { body, checkExact } from 'express-validator';
import { MESSAGGIO_CAMPI } from './regoleComuni';

// login: email valida e password di almeno 8 caratteri, nessun altro campo
export const loginValidator = checkExact(
  [
    body('email').isEmail().withMessage('Email non valida'),
    body('password')
      .isString().withMessage('La password deve essere una stringa')
      .bail()
      .isLength({ min: 8 }).withMessage('La password deve contenere almeno 8 caratteri'),
  ],
  { message: MESSAGGIO_CAMPI },
);
