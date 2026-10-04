import { Infrazione, Transito } from '../models';
import { JwtPayload } from './IAuthService';

// dati di un transito ricevuti dalla richiesta; il varco è facoltativo perché per il dispositivo è implicito
export interface DatiTransito {
  targa: string;
  dataOra: Date;
  tipo: 'ingresso' | 'uscita';
  varcoId?: number;
}

// esito dell'inserimento: il transito salvato e l'eventuale multa generata
export interface EsitoInserimento {
  transito: Transito;
  multa: Infrazione | null;
}

// contratto del servizio dei transiti, usato dal relativo controller
export interface ITransitoService {
  // registra un transito e valuta la multa; l'utente serve a capire su quale varco è avvenuto
  inserisci(dati: DatiTransito, utente: JwtPayload): Promise<EsitoInserimento>;
  // restituisce i transiti di un varco con l'eventuale multa di ciascuno
  elencoPerVarco(varcoId: number): Promise<Transito[]>;
  // modifica un transito che non ha generato multe
  modifica(id: number, dati: Required<DatiTransito>): Promise<Transito>;
  // elimina un transito che non ha generato multe
  elimina(id: number): Promise<void>;
}
