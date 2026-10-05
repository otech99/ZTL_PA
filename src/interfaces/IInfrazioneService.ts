import { Transaction } from 'sequelize';
import { Infrazione, Transito, Veicolo } from '../models';

// multa come la vede l'automobilista: solo i dati utili a verificarla e a scaricarne il bollettino
export interface MultaAutomobilista {
  id: number;
  idBollettino: string;
  importo: number;
  targa: string;
  dataOra: Date;
  varco: string;
  ztl: string;
}

// contratto del servizio delle multe, usato dal servizio dei transiti e dal controller delle multe
export interface IInfrazioneService {
  // valuta se il transito appena inserito genera una multa e, se sì, la crea nella stessa transazione
  valutaTransito(transito: Transito, veicolo: Veicolo, transaction: Transaction): Promise<Infrazione | null>;
  // restituisce le multe dei veicoli di cui l'utente è proprietario, dalla più recente
  multeDelProprietario(proprietarioId: number): Promise<MultaAutomobilista[]>;
}
