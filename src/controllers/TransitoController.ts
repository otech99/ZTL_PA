import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { DatiTransito, ITransitoService } from '../interfaces/ITransitoService';
import { UnauthorizedError } from '../errors/AppError';

// i dati arrivano da matchedData: già validati, con targa normalizzata e data convertita
export class TransitoController {
  constructor(private readonly transitoService: ITransitoService) {}

  // registra un transito e restituisce l'eventuale multa generata
  crea = async (req: Request, res: Response): Promise<void> => {
    if (!req.utente) {
      throw new UnauthorizedError('Utente non autenticato');
    }
    const dati = matchedData(req) as DatiTransito;
    res.status(StatusCodes.CREATED).json(await this.transitoService.inserisci(dati, req.utente));
  };

  // restituisce i transiti del varco indicato
  elencoPerVarco = async (req: Request, res: Response): Promise<void> => {
    const { varcoId } = matchedData(req) as { varcoId: number };
    res.status(StatusCodes.OK).json(await this.transitoService.elencoPerVarco(varcoId));
  };

  // modifica un transito che non ha generato multe
  modifica = async (req: Request, res: Response): Promise<void> => {
    const { id, ...dati } = matchedData(req) as Required<DatiTransito> & { id: number };
    res.status(StatusCodes.OK).json(await this.transitoService.modifica(id, dati));
  };

  // elimina un transito che non ha generato multe
  elimina = async (req: Request, res: Response): Promise<void> => {
    const { id } = matchedData(req) as { id: number };
    await this.transitoService.elimina(id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
