import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { IInfrazioneService } from '../interfaces/IInfrazioneService';
import { UnauthorizedError } from '../errors/AppError';

export class MultaController {
  constructor(private readonly infrazioneService: IInfrazioneService) {}

  // restituisce le multe a carico dell'automobilista autenticato
  elenco = async (req: Request, res: Response): Promise<void> => {
    if (!req.utente) {
      throw new UnauthorizedError('Utente non autenticato');
    }
    res.status(StatusCodes.OK).json(await this.infrazioneService.multeDelProprietario(req.utente.id));
  };
}
