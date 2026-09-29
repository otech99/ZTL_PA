import { UniqueConstraintError } from 'sequelize';
import { ZTL, Varco } from '../models';
import { ConflictError, NotFoundError } from '../errors/AppError';

export interface DatiZtl {
  nome: string;
  citta: string;
}

export class ZtlService {
  async elenco(): Promise<ZTL[]> {
    return ZTL.findAll({ order: [['id', 'ASC']] });
  }

  async dettaglio(id: number): Promise<ZTL> {
    const ztl = await ZTL.findByPk(id);
    if (!ztl) {
      throw new NotFoundError('ZTL non trovata');
    }
    return ztl;
  }

  async crea(dati: DatiZtl): Promise<ZTL> {
    try {
      return await ZTL.create({ ...dati });
    } catch (err) {
      throw this.traduciDuplicato(err);
    }
  }

  async modifica(id: number, dati: DatiZtl): Promise<ZTL> {
    const ztl = await this.dettaglio(id);
    try {
      return await ztl.update(dati);
    } catch (err) {
      throw this.traduciDuplicato(err);
    }
  }

  // eliminazione bloccata se la ZTL ha ancora varchi: si preserva lo storico dei transiti
  async elimina(id: number): Promise<void> {
    const ztl = await this.dettaglio(id);

    const varchiCollegati = await Varco.count({ where: { ztlId: id } });
    if (varchiCollegati > 0) {
      throw new ConflictError('Impossibile eliminare: la ZTL ha varchi associati');
    }

    await ztl.destroy();
  }

  // il vincolo di unicità del database diventa un 409 comprensibile
  private traduciDuplicato(err: unknown): unknown {
    if (err instanceof UniqueConstraintError) {
      return new ConflictError('Esiste già una ZTL con questo nome in questa città');
    }
    return err;
  }
}
