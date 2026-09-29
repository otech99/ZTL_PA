import { UniqueConstraintError } from 'sequelize';
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

  // varco e fasce salvati nella stessa transazione: o tutto o niente
  async crea(dati: DatiVarco): Promise<Varco> {
    await this.verificaZtl(dati.ztlId);

    try {
      const id = await sequelize.transaction(async (transaction) => {
        const varco = await Varco.create({ posizione: dati.posizione, ztlId: dati.ztlId }, { transaction });
        await FasciaOraria.bulkCreate(this.righeFasce(varco.id, dati.fasce), { transaction });
        return varco.id;
      });
      return this.dettaglio(id);
    } catch (err) {
      throw this.traduciDuplicato(err);
    }
  }

  // le fasce vengono sostituite per intero; le multe già emesse non cambiano
  async modifica(id: number, dati: DatiVarco): Promise<Varco> {
    const varco = await this.dettaglio(id);

    // un varco con transiti non può cambiare ZTL, altrimenti lo storico cambierebbe significato
    if (dati.ztlId !== varco.ztlId) {
      await this.verificaZtl(dati.ztlId);
      if (await this.haTransiti(id)) {
        throw new ConflictError('Impossibile cambiare ZTL: il varco ha transiti registrati');
      }
    }

    try {
      await sequelize.transaction(async (transaction) => {
        await varco.update({ posizione: dati.posizione, ztlId: dati.ztlId }, { transaction });
        await FasciaOraria.destroy({ where: { varcoId: id }, transaction });
        await FasciaOraria.bulkCreate(this.righeFasce(id, dati.fasce), { transaction });
      });
    } catch (err) {
      throw this.traduciDuplicato(err);
    }

    return this.dettaglio(id);
  }

  // le fasce del varco vengono eliminate con lui (CASCADE)
  async elimina(id: number): Promise<void> {
    const varco = await this.dettaglio(id);

    if (await this.haTransiti(id)) {
      throw new ConflictError('Impossibile eliminare: il varco ha transiti registrati');
    }

    await varco.destroy();
  }

  private righeFasce(varcoId: number, fasce: DatiFascia[]) {
    return fasce.map((fascia) => ({
      varcoId,
      giornoSettimana: fascia.giornoSettimana,
      oraInizio: fascia.oraInizio,
      oraFine: fascia.oraFine,
      maggiorazione: fascia.maggiorazione ?? 1,
    }));
  }

  private async verificaZtl(ztlId: number): Promise<void> {
    if (!(await ZTL.findByPk(ztlId))) {
      throw new NotFoundError('ZTL non trovata');
    }
  }

  private async haTransiti(varcoId: number): Promise<boolean> {
    return (await Transito.count({ where: { varcoId } })) > 0;
  }

  private traduciDuplicato(err: unknown): unknown {
    if (err instanceof UniqueConstraintError) {
      return new ConflictError('Esiste già un varco in questa posizione per la ZTL indicata');
    }
    return err;
  }
}
