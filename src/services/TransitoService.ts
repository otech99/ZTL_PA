import { Transaction } from 'sequelize';
import { sequelize, Infrazione, Transito, Utente, Varco, Veicolo } from '../models';
import { IInfrazioneService } from '../interfaces/IInfrazioneService';
import { DatiTransito, EsitoInserimento, ITransitoService } from '../interfaces/ITransitoService';
import { JwtPayload } from '../interfaces/IAuthService';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError';

// gestione dei transiti; la valutazione della multa è delegata al servizio delle multe
export class TransitoService implements ITransitoService {
  // riceve il servizio delle multe tramite il suo contratto
  constructor(private readonly infrazioneService: IInfrazioneService) {}

  // registra il transito e valuta la multa nella stessa transazione. Il veicolo resta bloccato
  // fino alla fine, così due transiti contemporanei dello stesso veicolo non generano due multe
  async inserisci(dati: DatiTransito, utente: JwtPayload): Promise<EsitoInserimento> {
    const varcoId = await this.varcoDelTransito(dati, utente);

    return sequelize.transaction(async (transaction) => {
      const veicolo = await this.bloccaVeicolo(dati.targa, transaction);
      await this.verificaVarco(varcoId, transaction);

      const transito = await Transito.create(
        { veicoloTarga: dati.targa, varcoId, dataOra: dati.dataOra, tipo: dati.tipo },
        { transaction },
      );
      const multa = await this.infrazioneService.valutaTransito(transito, veicolo, transaction);

      return { transito, multa };
    });
  }

  // restituisce i transiti del varco in ordine cronologico, ognuno con la sua eventuale multa
  async elencoPerVarco(varcoId: number): Promise<Transito[]> {
    if (!(await Varco.findByPk(varcoId))) {
      throw new NotFoundError('Varco non trovato');
    }

    return Transito.findAll({
      where: { varcoId },
      include: [{ model: Infrazione, as: 'multa', attributes: ['id', 'importo', 'idBollettino'] }],
      order: [['dataOra', 'ASC']],
    });
  }

  // modifica un transito senza multa; la multa si valuta solo all'inserimento, quindi qui non se ne generano
  async modifica(id: number, dati: Required<DatiTransito>): Promise<Transito> {
    await sequelize.transaction(async (transaction) => {
      const transito = await this.bloccaTransitoSenzaMulta(id, 'modificare', transaction);
      await this.bloccaVeicolo(dati.targa, transaction);
      await this.verificaVarco(dati.varcoId, transaction);

      await transito.update(
        { veicoloTarga: dati.targa, varcoId: dati.varcoId, dataOra: dati.dataOra, tipo: dati.tipo },
        { transaction },
      );
    });

    return this.dettaglio(id);
  }

  // elimina un transito senza multa
  async elimina(id: number): Promise<void> {
    await sequelize.transaction(async (transaction) => {
      const transito = await this.bloccaTransitoSenzaMulta(id, 'eliminare', transaction);
      await transito.destroy({ transaction });
    });
  }

  // varco del transito: per il dispositivo è quello del suo account, per l'operatore va indicato
  private async varcoDelTransito(dati: DatiTransito, utente: JwtPayload): Promise<number> {
    if (utente.ruolo === 'varco') {
      if (dati.varcoId !== undefined) {
        throw new BadRequestError('varcoId: per il dispositivo il varco è determinato dal suo account');
      }
      const dispositivo = await Utente.findByPk(utente.id, { attributes: ['varcoId'] });
      if (!dispositivo || dispositivo.varcoId === null) {
        throw new ForbiddenError('Dispositivo non collegato a nessun varco');
      }
      return dispositivo.varcoId;
    }

    if (dati.varcoId === undefined) {
      throw new BadRequestError('varcoId: obbligatorio');
    }
    return dati.varcoId;
  }

  // legge il veicolo bloccandone la riga fino alla fine della transazione; 404 se la targa non è registrata
  private async bloccaVeicolo(targa: string, transaction: Transaction): Promise<Veicolo> {
    const veicolo = await Veicolo.findByPk(targa, { transaction, lock: transaction.LOCK.UPDATE });
    if (!veicolo) {
      throw new NotFoundError('Veicolo non registrato');
    }
    return veicolo;
  }

  // verifica che il varco esista e impedisce che venga eliminato durante l'operazione
  private async verificaVarco(varcoId: number, transaction: Transaction): Promise<void> {
    const varco = await Varco.findByPk(varcoId, { transaction, lock: transaction.LOCK.SHARE });
    if (!varco) {
      throw new NotFoundError('Varco non trovato');
    }
  }

  // legge il transito bloccandolo; 404 se non esiste, 409 se ha generato una multa
  private async bloccaTransitoSenzaMulta(id: number, operazione: string, transaction: Transaction): Promise<Transito> {
    const transito = await Transito.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!transito) {
      throw new NotFoundError('Transito non trovato');
    }

    const multe = await Infrazione.count({ where: { transitoId: id }, transaction });
    if (multe > 0) {
      throw new ConflictError(`Impossibile ${operazione}: il transito ha generato una multa`);
    }

    return transito;
  }

  // restituisce il transito con la sua eventuale multa
  private async dettaglio(id: number): Promise<Transito> {
    const transito = await Transito.findByPk(id, {
      include: [{ model: Infrazione, as: 'multa', attributes: ['id', 'importo', 'idBollettino'] }],
    });
    if (!transito) {
      throw new NotFoundError('Transito non trovato');
    }
    return transito;
  }
}
