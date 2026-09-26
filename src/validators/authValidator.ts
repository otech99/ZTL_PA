import { body, checkExact } from 'express-validator';

export const loginValidator = checkExact(
  [
    body('email').isEmail().withMessage('Email non valida'),
    body('password')
      .isString().withMessage('La password deve essere una stringa')
      .bail()
      .notEmpty().withMessage('La password è obbligatoria'),
  ],
  { message: 'Campi non ammessi nella richiesta' },
);
