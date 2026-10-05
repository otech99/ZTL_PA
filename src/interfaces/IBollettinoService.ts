import { JwtPayload } from './IAuthService';

// bollettino pronto da inviare: nome del file e contenuto del PDF
export interface BollettinoPdf {
  nomeFile: string;
  contenuto: Buffer;
}

// contratto del servizio dei bollettini, usato dal relativo controller
export interface IBollettinoService {
  // genera il PDF del bollettino; l'automobilista può ottenere solo i propri, altrimenti 404
  genera(idBollettino: string, utente: JwtPayload): Promise<BollettinoPdf>;
}
