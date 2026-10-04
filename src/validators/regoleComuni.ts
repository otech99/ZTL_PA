import { body, param } from 'express-validator';

export const MESSAGGIO_CAMPI = 'Campi non ammessi nella richiesta';

// id nell'indirizzo: arriva sempre come testo, quindi si valida e si converte in numero
export const idValido = () =>
  param('id').isInt({ min: 1 }).withMessage('Deve essere un intero positivo').toInt();

// campo numerico intero nel corpo: deve essere un vero numero JSON, il testo "1" viene rifiutato
export const interoNelCorpo = (campo: string, min: number, max: number, messaggio: string) =>
  body(campo)
    .custom((valore: unknown) => Number.isInteger(valore) && (valore as number) >= min && (valore as number) <= max)
    .withMessage(messaggio);

// campo numerico decimale nel corpo: stesso principio, deve essere un numero e non una stringa
export const decimaleNelCorpo = (campo: string, minEscluso: number, max: number, messaggio: string) =>
  body(campo)
    .custom((valore: unknown) => typeof valore === 'number' && valore > minEscluso && valore <= max)
    .withMessage(messaggio);
