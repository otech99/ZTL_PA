// elenco unico dei ruoli, da cui deriva anche il tipo Ruolo
export const RUOLI = ['operatore', 'varco', 'automobilista', 'admin'] as const;

export type Ruolo = (typeof RUOLI)[number];

// verifica che un valore qualsiasi (es. letto da un token) sia uno dei ruoli ammessi
export function isRuolo(valore: unknown): valore is Ruolo {
  return typeof valore === 'string' && (RUOLI as readonly string[]).includes(valore);
}

// dati contenuti nel token: solo i metadati essenziali dell'utente
export interface JwtPayload {
  id: number;
  ruolo: Ruolo;
}

// contratto del servizio di autenticazione, usato da middleware, controller e seed
export interface IAuthService {
  // verifica le credenziali e restituisce un token JWT firmato
  login(email: string, password: string): Promise<string>;
  // verifica firma e scadenza del token e ne restituisce il contenuto
  verificaToken(token: string): JwtPayload;
  // calcola l'hash da salvare al posto della password
  hashPassword(password: string): Promise<string>;
}
