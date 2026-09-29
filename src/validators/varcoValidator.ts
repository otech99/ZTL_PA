import { body, param, checkExact } from 'express-validator';

const MESSAGGIO_CAMPI = 'Campi non ammessi nella richiesta';
const ORA = /^([01]\d|2[0-3]):[0-5]\d$/;
// una fascia può terminare a mezzanotte
const ORA_FINE = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;
const CAMPI_FASCIA = ['giornoSettimana', 'oraInizio', 'oraFine', 'maggiorazione'];

interface FasciaBenFormata {
  giornoSettimana: number;
  oraInizio: string;
  oraFine: string;
}

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

const idValido = () =>
  param('id').isInt({ min: 1 }).withMessage("L'id deve essere un intero positivo");

const campiVarco = () => [
  body('posizione')
    .isString().withMessage('La posizione deve essere una stringa')
    .bail()
    .trim()
    .notEmpty().withMessage('La posizione è obbligatoria'),
  body('ztlId').isInt({ min: 1 }).withMessage('ztlId deve essere un intero positivo'),

  // checkExact non controlla i campi dentro gli oggetti dell'elenco, serve un controllo dedicato
  body('fasce.*')
    .isObject().withMessage('Ogni fascia deve essere un oggetto')
    .bail()
    .custom((fascia: Record<string, unknown>) => Object.keys(fascia).every((campo) => CAMPI_FASCIA.includes(campo)))
    .withMessage('Campi non ammessi nella fascia'),
  body('fasce.*.giornoSettimana')
    .isInt({ min: 1, max: 7 }).withMessage('Il giorno deve essere compreso tra 1 (lunedì) e 7 (domenica)'),
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
  body('fasce.*.maggiorazione')
    .optional()
    .isFloat({ gt: 0, max: 99.99 }).withMessage('La maggiorazione deve essere un numero positivo'),

  // controllo sull'elenco intero, dopo quelli sulle singole fasce
  body('fasce')
    .isArray().withMessage('fasce deve essere un elenco')
    .bail()
    .custom((fasce: unknown[]) => !ciSonoSovrapposizioni(fasce))
    .withMessage('Fasce sovrapposte nello stesso giorno'),
];

export const elencoVarchiValidator = checkExact([], { message: MESSAGGIO_CAMPI });
export const idVarcoValidator = checkExact([idValido()], { message: MESSAGGIO_CAMPI });
export const creaVarcoValidator = checkExact(campiVarco(), { message: MESSAGGIO_CAMPI });
export const modificaVarcoValidator = checkExact([idValido(), ...campiVarco()], { message: MESSAGGIO_CAMPI });
