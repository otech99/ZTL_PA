import { body, checkExact } from 'express-validator';
import { MESSAGGIO_CAMPI, decimaleNelCorpo, idValido, interoNelCorpo } from './regoleComuni';

const ORA = /^([01]\d|2[0-3]):[0-5]\d$/;
// una fascia può terminare a mezzanotte
const ORA_FINE = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;
const CAMPI_FASCIA = ['giornoSettimana', 'oraInizio', 'oraFine', 'maggiorazione'];

interface FasciaBenFormata {
  giornoSettimana: number;
  oraInizio: string;
  oraFine: string;
}

// verifica che una fascia abbia giorno e orari validi, per poterla confrontare con le altre
function isFasciaBenFormata(valore: unknown): valore is FasciaBenFormata {
  if (typeof valore !== 'object' || valore === null) {
    return false;
  }
  const fascia = valore as Record<string, unknown>;
  return (
    Number.isInteger(fascia.giornoSettimana) &&
    typeof fascia.oraInizio === 'string' && ORA.test(fascia.oraInizio) &&
    typeof fascia.oraFine === 'string' && ORA_FINE.test(fascia.oraFine)
  );
}

// due fasce dello stesso giorno si sovrappongono se ciascuna inizia prima che l'altra finisca
function ciSonoSovrapposizioni(fasce: unknown[]): boolean {
  const valide = fasce.filter(isFasciaBenFormata);
  for (let i = 0; i < valide.length; i++) {
    for (let j = i + 1; j < valide.length; j++) {
      const a = valide[i];
      const b = valide[j];
      if (a.giornoSettimana === b.giornoSettimana && a.oraInizio < b.oraFine && b.oraInizio < a.oraFine) {
        return true;
      }
    }
  }
  return false;
}

// regole su posizione, ZTL di appartenenza ed elenco delle fasce orarie
const campiVarco = () => [
  body('posizione')
    .isString().withMessage('Deve essere una stringa')
    .bail()
    .trim()
    .notEmpty().withMessage('La posizione è obbligatoria'),
  interoNelCorpo('ztlId', 1, Number.MAX_SAFE_INTEGER, 'Deve essere un numero intero positivo'),

  // checkExact non controlla i campi dentro gli oggetti dell'elenco, serve un controllo dedicato
  body('fasce.*')
    .isObject().withMessage('Ogni fascia deve essere un oggetto')
    .bail()
    .custom((fascia: Record<string, unknown>) => Object.keys(fascia).every((campo) => CAMPI_FASCIA.includes(campo)))
    .withMessage('Campi non ammessi nella fascia'),
  interoNelCorpo('fasce.*.giornoSettimana', 1, 7, 'Deve essere un numero intero tra 1 (lunedì) e 7 (domenica)'),
  body('fasce.*.oraInizio')
    .matches(ORA).withMessage('Formato orario non valido, usare HH:MM'),
  body('fasce.*.oraFine')
    .matches(ORA_FINE).withMessage('Formato orario non valido, usare HH:MM')
    .bail()
    .custom((fine: string, { req, pathValues }) => {
      const inizio: unknown = req.body.fasce[pathValues[0] as string].oraInizio;
      // se l'inizio è già sbagliato lo segnala la sua regola, qui non si confronta
      return !(typeof inizio === 'string' && ORA.test(inizio) && fine <= inizio);
    })
    .withMessage('Deve essere successiva a oraInizio'),
  decimaleNelCorpo('fasce.*.maggiorazione', 0, 99.99, 'Deve essere un numero positivo').optional(),

  // controllo sull'elenco intero, dopo quelli sulle singole fasce
  body('fasce')
    .isArray().withMessage('Deve essere un elenco')
    .bail()
    .custom((fasce: unknown[]) => !ciSonoSovrapposizioni(fasce))
    .withMessage('Fasce sovrapposte nello stesso giorno'),
];

// elenco: nessun parametro ammesso
export const elencoVarchiValidator = checkExact([], { message: MESSAGGIO_CAMPI });
// dettaglio ed eliminazione: solo l'id nell'indirizzo
export const idVarcoValidator = checkExact([idValido()], { message: MESSAGGIO_CAMPI });
// creazione: posizione, ZTL e fasce
export const creaVarcoValidator = checkExact(campiVarco(), { message: MESSAGGIO_CAMPI });
// modifica: id nell'indirizzo più tutti i campi del varco
export const modificaVarcoValidator = checkExact([idValido(), ...campiVarco()], { message: MESSAGGIO_CAMPI });
