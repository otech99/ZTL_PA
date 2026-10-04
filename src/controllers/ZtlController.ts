import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { DatiZtl, ZtlService } from '../services/ZtlService';

// i dati arrivano da matchedData: già validati, ripuliti e con l'id convertito in numero
export class ZtlController {
  constructor(private readonly ztlService: ZtlService) {}

  // restituisce tutte le ZTL
  elenco = async (req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).json(await this.ztlService.elenco());
  };

  // restituisce la ZTL indicata dall'id
  dettaglio = async (req: Request, res: Response): Promise<void> => {
    const { id } = matchedData(req) as { id: number };
    res.status(StatusCodes.OK).json(await this.ztlService.dettaglio(id));
  };

  // crea una nuova ZTL
  crea = async (req: Request, res: Response): Promise<void> => {
    const dati = matchedData(req) as DatiZtl;
    res.status(StatusCodes.CREATED).json(await this.ztlService.crea(dati));
  };

  // sostituisce nome e città della ZTL indicata
  modifica = async (req: Request, res: Response): Promise<void> => {
    const { id, ...dati } = matchedData(req) as DatiZtl & { id: number };
    res.status(StatusCodes.OK).json(await this.ztlService.modifica(id, dati));
  };

  // elimina la ZTL indicata, se non ha varchi collegati
  elimina = async (req: Request, res: Response): Promise<void> => {
    const { id } = matchedData(req) as { id: number };
    await this.ztlService.elimina(id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
