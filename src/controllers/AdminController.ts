import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { ICreditoService } from '../interfaces/ICreditoService';

export class AdminController {
  constructor(private readonly creditoService: ICreditoService) {}

  // somma il credito indicato al saldo dell'utente e restituisce email e nuovo credito
  ricarica = async (req: Request, res: Response): Promise<void> => {
    const { email, credito } = matchedData(req) as { email: string; credito: number };
    res.status(StatusCodes.OK).json(await this.creditoService.ricarica(email, credito));
  };
}
