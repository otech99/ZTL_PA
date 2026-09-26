import { Request, Response } from 'express';
import { IAuthService } from '../interfaces/IAuthService';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  // arrow function: mantiene il this quando il metodo viene passato al router
  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };

    const token = await this.authService.login(email, password);

    res.status(200).json({ token });
  };
}
