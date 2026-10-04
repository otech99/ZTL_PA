import { Transaction, UniqueConstraintError } from 'sequelize';
import { sequelize, Varco, ZTL, FasciaOraria, Transito } from '../models';
import { ConflictError, NotFoundError } from '../errors/AppError';

export interface DatiFascia {
  giornoSettimana: number;
  oraInizio: string;
  oraFine: string;
  maggiorazione?: number;
}

export interface DatiVarco {
  posizione: string;
  ztlId: number;
  fasce: DatiFascia[];
}

const INCLUDI_FASCE = {
  model: FasciaOraria,
  as: 'fasce',
  attributes: ['id', 'giornoSettimana', 'oraInizio', 'oraFine', 'maggiorazione'],
};

export class VarcoService {
  // restituisce tutti i varchi con le fasce ordinate per giorno e ora di inizio
  async elenco(): Promise<Varco[]> {
    return Varco.findAll({
      include: [INCLUDI_FASCE],
      order: [
        ['id', 'ASC'],
        [{ model: FasciaOraria, as: 'fasce' }, 'giornoSettimana', 'ASC'],
        [{ model: FasciaOraria, as: 'fasce' }, 'oraInizio', 'ASC'],
      ],
    });
  }

  // restituisce un varco con le sue fasce, oppure 404 se non esiste
  async dettaglio(id: number): Promise<Varco> {
    const varco = await Varco.findByPk(id, {
      include: [INCLUDI_FASCE],
      order: [
        [{ model: FasciaOraria, as: 'fasce' }, 'giornoSettimana', 'ASC'],
        [{ model: FasciaOraria, as: 'fasce' }, 'oraInizio', 'ASC'],
      ],
    });
    if (!varco) {
      throw new NotFoundError('Varco non trovato');
    }
    return varco;
  }

  // crea il varco e le sue fasce in un'unica transazione: o tutto o niente
  async crea(dati: DatiVarco): Promise<Varco> {
    try {
      const id = await sequelize.transaction(async (transaction) => {
        await this.bloccaZtl(dati.ztlId, transaction);

        const varco = await Varco.create({ posizione: dati.posizione, ztlId: dati.ztlId }, { transaction });
        await FasciaOraria.bulkCreate(this.righeFasce(varco.id, dati.fasce), { transaction });
        return varco.id;
      });
      return this.dettaglio(id);
    } catch (err) {
      throw this.traduciDuplicato(err);
    }
  }

  // sostituisce posizione, ZTL e fasce del varco; le multe già emesse non cambiano
  async modifica(id: number, dati: DatiVarco): Promise<Varco> {
    try {
      await sequelize.transaction(async (transaction) => {
        const varco = await this.bloccaVarco(id, transaction);

        // un varco con transiti non può cambiare ZTL, altrimenti lo storico cambierebbe significato
        if (dati.ztlId !== varco.ztlId) {
          await this.bloccaZtl(dati.ztlId, transaction);
          if (await this.haTransiti(id, transaction)) {
            throw new ConflictError('Impossibile cambiare ZTL: il varco ha transiti registrati');
          }
        }

        await varco.update({ posizione: dati.posizione, ztlId: dati.ztlId }, { transaction });
        await FasciaOraria.destroy({ where: { varcoId: id }, transaction });
        await FasciaOraria.bulkCreate(this.righeFasce(id, dati.fasce), { transaction });
      });
    } catch (err) {
      throw this.traduciDuplicato(err);
    }

    return this.dettaglio(id);
  }

  // elimina il varco se non ha transiti; le sue fasce vengono eliminate con lui (CASCADE)
  async elimina(id: number): Promise<void> {
    await sequelize.transaction(async (transaction) => {
      const varco = await this.bloccaVarco(id, transaction);

      if (await this.haTransiti(id, transaction)) {
        throw new ConflictError('Impossibile eliminare: il varco ha transiti registrati');
      }

      await varco.destroy({ transaction });
    });
  }

  // legge il varco bloccandone la riga fino alla fine della transazione:
  // nel frattempo nessun transito può essere collegato a questo varco
  private async bloccaVarco(id: number, transaction: Transaction): Promise<Varco> {
    const varco = await Varco.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!varco) {
      throw new NotFoundError('Varco non trovato');
    }
    return varco;
  }

  // verifica che la ZTL esista e impedisce che venga eliminata mentre ci si collega il varco
  private async bloccaZtl(ztlId: number, transaction: Transaction): Promise<void> {
    const ztl = await ZTL.findByPk(ztlId, { transaction, lock: transaction.LOCK.SHARE });
    if (!ztl) {
      throw new NotFoundError('ZTL non trovata');
    }
  }

  // indica se il varco ha almeno un transito registrato
  private async haTransiti(varcoId: number, transaction: Transaction): Promise<boolean> {
    return (await Transito.count({ where: { varcoId }, transaction })) > 0;
  }

  // trasforma le fasce ricevute nelle righe da salvare, con maggiorazione predefinita 1
  private righeFasce(varcoId: number, fasce: DatiFascia[]) {
    return fasce.map((fascia) => ({
      varcoId,
      giornoSettimana: fascia.giornoSettimana,
      oraInizio: fascia.oraInizio,
      oraFine: fascia.oraFine,
      maggiorazione: fascia.maggiorazione ?? 1,
    }));
  }

  // il vincolo di unicità del database diventa un 409 comprensibile
  private traduciDuplicato(err: unknown): unknown {
    if (err instanceof UniqueConstraintError) {
      return new ConflictError('Esiste già un varco in questa posizione per la ZTL indicata');
    }
    return err;
  }
}
