import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { IAuthService } from '../interfaces/IAuthService';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  // verifica le credenziali e restituisce il token JWT
  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = matchedData(req) as { email: string; password: string };
    const token = await this.authService.login(email, password);
    res.status(StatusCodes.OK).json({ token });
  };
}
