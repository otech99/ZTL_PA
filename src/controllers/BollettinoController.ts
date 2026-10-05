import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { IBollettinoService } from '../interfaces/IBollettinoService';
import { UnauthorizedError } from '../errors/AppError';

export class BollettinoController {
  constructor(private readonly bollettinoService: IBollettinoService) {}

  // invia il bollettino come file PDF da scaricare
  scarica = async (req: Request, res: Response): Promise<void> => {
    if (!req.utente) {
      throw new UnauthorizedError('Utente non autenticato');
    }
    const { idBollettino } = matchedData(req) as { idBollettino: string };
    const bollettino = await this.bollettinoService.genera(idBollettino, req.utente);

    // attachment: il browser scarica il file invece di aprirlo
    res.status(StatusCodes.OK).attachment(bollettino.nomeFile).type('application/pdf').send(bollettino.contenuto);
  };
}
