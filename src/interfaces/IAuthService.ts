// elenco unico dei ruoli, da cui deriva anche il tipo Ruolo
export const RUOLI = ['operatore', 'varco', 'automobilista', 'admin'] as const;

export type Ruolo = (typeof RUOLI)[number];

export function isRuolo(valore: unknown): valore is Ruolo {
  return typeof valore === 'string' && (RUOLI as readonly string[]).includes(valore);
}

// dati contenuti nel token, solo metadati essenziali dell'utente
export interface JwtPayload {
  id: number;
  ruolo: Ruolo;
}

export interface IAuthService {
  login(email: string, password: string): Promise<string>;
  verificaToken(token: string): JwtPayload;
  hashPassword(password: string): Promise<string>;
}
