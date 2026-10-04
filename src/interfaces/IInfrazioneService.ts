import { Transaction } from 'sequelize';
import { Infrazione, Transito, Veicolo } from '../models';

// contratto del servizio delle multe, usato dal servizio dei transiti
export interface IInfrazioneService {
  // valuta se il transito appena inserito genera una multa e, se sì, la crea nella stessa transazione
  valutaTransito(transito: Transito, veicolo: Veicolo, transaction: Transaction): Promise<Infrazione | null>;
}
