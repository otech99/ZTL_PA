import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { DatiVarco, VarcoService } from '../services/VarcoService';

// i dati arrivano da matchedData: già validati, ripuliti e con l'id convertito in numero
export class VarcoController {
  constructor(private readonly varcoService: VarcoService) {}

  // restituisce tutti i varchi con le loro fasce orarie
  elenco = async (req: Request, res: Response): Promise<void> => {
    res.status(StatusCodes.OK).json(await this.varcoService.elenco());
  };

  // restituisce il varco indicato con le sue fasce orarie
  dettaglio = async (req: Request, res: Response): Promise<void> => {
    const { id } = matchedData(req) as { id: number };
    res.status(StatusCodes.OK).json(await this.varcoService.dettaglio(id));
  };

  // crea un varco insieme alle sue fasce orarie
  crea = async (req: Request, res: Response): Promise<void> => {
    const dati = matchedData(req) as DatiVarco;
    res.status(StatusCodes.CREATED).json(await this.varcoService.crea(dati));
  };

  // sostituisce posizione, ZTL e fasce orarie del varco indicato
  modifica = async (req: Request, res: Response): Promise<void> => {
    const { id, ...dati } = matchedData(req) as DatiVarco & { id: number };
    res.status(StatusCodes.OK).json(await this.varcoService.modifica(id, dati));
  };

  // elimina il varco indicato, se non ha transiti registrati
  elimina = async (req: Request, res: Response): Promise<void> => {
    const { id } = matchedData(req) as { id: number };
    await this.varcoService.elimina(id);
    res.status(StatusCodes.NO_CONTENT).send();
  };
}
