import { body, checkExact } from 'express-validator';
import { MESSAGGIO_CAMPI } from './regoleComuni';

const RICARICA_MASSIMA = 100;

// indica se un numero ha al massimo due decimali; il margine assorbe gli errori di
// arrotondamento di JavaScript (0.1 * 100 = 10.000000000000002)
function haAlMassimoDueDecimali(valore: number): boolean {
  return Math.abs(valore * 100 - Math.round(valore * 100)) < 1e-9;
}

// ricarica: email dell'utente da ricaricare e credito da aggiungere al suo saldo
export const ricaricaValidator = checkExact(
  [
    body('email').isEmail().withMessage('Email non valida'),
    body('credito')
      .custom((valore: unknown) => typeof valore === 'number' && valore > 0 && valore <= RICARICA_MASSIMA)
      .withMessage(`Deve essere un numero maggiore di zero e non superiore a ${RICARICA_MASSIMA}`)
      .bail()
      .custom((valore: number) => haAlMassimoDueDecimali(valore))
      .withMessage('Al massimo due decimali'),
  ],
  { message: MESSAGGIO_CAMPI },
);
