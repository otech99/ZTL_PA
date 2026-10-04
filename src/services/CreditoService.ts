import { Op } from 'sequelize';
import { sequelize, Utente } from '../models';
import { ICreditoService } from '../interfaces/ICreditoService';
import { NotFoundError, UnauthorizedError } from '../errors/AppError';

// gestione del credito in token: verifica, addebito e ricarica
export class CreditoService implements ICreditoService {
  // lancia 401 se l'utente non esiste o se il suo credito non copre il costo
  async verificaCredito(utenteId: number, costo: number): Promise<void> {
    const utente = await Utente.findByPk(utenteId, { attributes: ['credito'] });

    if (!utente) {
      throw new UnauthorizedError('Utente non trovato');
    }

    if (utente.credito < costo) {
      throw new UnauthorizedError('Credito insufficiente');
    }
  }

  // scala il costo con un'unica istruzione sul database, solo se il credito basta ancora:
  // due richieste contemporanee non possono portarlo sotto zero
  async addebita(utenteId: number, costo: number): Promise<boolean> {
    const [righeAggiornate] = await Utente.update(
      { credito: sequelize.literal(`"credito" - ${sequelize.escape(costo)}`) },
      { where: { id: utenteId, credito: { [Op.gte]: costo } } },
    );

    return righeAggiornate === 1;
  }

  // somma l'importo al credito attuale con un'unica istruzione, così nessuna ricarica va persa
  async ricarica(email: string, importo: number): Promise<{ email: string; credito: number }> {
    const [righeAggiornate, utenti] = await Utente.update(
      { credito: sequelize.literal(`"credito" + ${sequelize.escape(importo)}`) },
      { where: { email }, returning: true },
    );

    if (righeAggiornate === 0) {
      throw new NotFoundError('Utente non trovato');
    }

    return { email: utenti[0].email, credito: utenti[0].credito };
  }
}
