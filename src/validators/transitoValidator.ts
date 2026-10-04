import { body, checkExact, query } from 'express-validator';
import { MESSAGGIO_CAMPI, idValido, interoNelCorpo } from './regoleComuni';

// la data deve indicare il fuso, altrimenti non si saprebbe se è ora di Roma o UTC
const FUSO = /(Z|[+-]\d{2}:\d{2})$/;
// tolleranza per l'orologio dei dispositivi, che può essere leggermente avanti rispetto al server
const TOLLERANZA_FUTURO_MS = 5 * 60 * 1000;

// regole comuni a inserimento e modifica; il varco è obbligatorio solo in modifica,
// perché nell'inserimento il dispositivo non lo indica
const campiTransito = (varcoObbligatorio: boolean) => {
  const varco = interoNelCorpo('varcoId', 1, Number.MAX_SAFE_INTEGER, 'Deve essere un numero intero positivo');

  return [
    // targa normalizzata: maiuscole e senza spazi, così "ab 123 cd" e "AB123CD" coincidono
    body('targa')
      .isString().withMessage('Deve essere una stringa')
      .bail()
      .customSanitizer((targa: string) => targa.replace(/\s+/g, '').toUpperCase())
      .matches(/^[A-Z0-9]{5,10}$/).withMessage('Solo lettere e numeri, da 5 a 10 caratteri'),
    body('dataOra')
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage('Formato ISO 8601 richiesto, es. 2026-10-01T08:30:00+02:00')
      .bail()
      .matches(FUSO).withMessage('Indicare il fuso orario, es. +02:00 oppure Z')
      .bail()
      .custom((dataOra: string) => new Date(dataOra).getTime() <= Date.now() + TOLLERANZA_FUTURO_MS)
      .withMessage('Non può essere nel futuro')
      .toDate(),
    body('tipo').isIn(['ingresso', 'uscita']).withMessage("Deve essere 'ingresso' o 'uscita'"),
    varcoObbligatorio ? varco : varco.optional(),
  ];
};

// inserimento: varco facoltativo (lo indica l'operatore, per il dispositivo è implicito)
export const creaTransitoValidator = checkExact(campiTransito(false), { message: MESSAGGIO_CAMPI });
// consultazione: varco obbligatorio come parametro dell'indirizzo (?varcoId=1)
export const elencoTransitiValidator = checkExact(
  [query('varcoId').isInt({ min: 1 }).withMessage('Deve essere un intero positivo').toInt()],
  { message: MESSAGGIO_CAMPI },
);
// modifica: id nell'indirizzo e tutti i campi, varco compreso
export const modificaTransitoValidator = checkExact([idValido(), ...campiTransito(true)], { message: MESSAGGIO_CAMPI });
// eliminazione: solo l'id nell'indirizzo
export const idTransitoValidator = checkExact([idValido()], { message: MESSAGGIO_CAMPI });
