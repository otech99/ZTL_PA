import { UniqueConstraintError } from 'sequelize';
import { sequelize, ZTL, Varco } from '../models';
import { ConflictError, NotFoundError } from '../errors/AppError';

export interface DatiZtl {
  nome: string;
  citta: string;
}

export class ZtlService {
  // restituisce tutte le ZTL ordinate per id
  async elenco(): Promise<ZTL[]> {
    return ZTL.findAll({ order: [['id', 'ASC']] });
  }

  // restituisce una ZTL, oppure 404 se non esiste
  async dettaglio(id: number): Promise<ZTL> {
    const ztl = await ZTL.findByPk(id);
    if (!ztl) {
      throw new NotFoundError('ZTL non trovata');
    }
    return ztl;
  }

  // crea una nuova ZTL; un duplicato nome + città diventa 409
  async crea(dati: DatiZtl): Promise<ZTL> {
    try {
      return await ZTL.create({ ...dati });
    } catch (err) {
      throw this.traduciDuplicato(err);
    }
  }

  // sostituisce nome e città della ZTL; un duplicato nome + città diventa 409
  async modifica(id: number, dati: DatiZtl): Promise<ZTL> {
    const ztl = await this.dettaglio(id);
    try {
      return await ztl.update(dati);
    } catch (err) {
      throw this.traduciDuplicato(err);
    }
  }

  // elimina la ZTL se non ha varchi; la riga resta bloccata fino alla fine della transazione,
  // così nessun varco può esserle collegato tra il controllo e l'eliminazione
  async elimina(id: number): Promise<void> {
    await sequelize.transaction(async (transaction) => {
      const ztl = await ZTL.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!ztl) {
        throw new NotFoundError('ZTL non trovata');
      }

      const varchiCollegati = await Varco.count({ where: { ztlId: id }, transaction });
      if (varchiCollegati > 0) {
        throw new ConflictError('Impossibile eliminare: la ZTL ha varchi associati');
      }

      await ztl.destroy({ transaction });
    });
  }

  // il vincolo di unicità del database diventa un 409 comprensibile
  private traduciDuplicato(err: unknown): unknown {
    if (err instanceof UniqueConstraintError) {
      return new ConflictError('Esiste già una ZTL con questo nome in questa città');
    }
    return err;
  }
}
