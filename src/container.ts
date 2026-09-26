import { env } from './config/env';
import { IAuthService } from './interfaces/IAuthService';
import { AuthService } from './services/AuthService';
import { AuthController } from './controllers/AuthController';
import { authMiddleware } from './middlewares/authMiddleware';

// unico punto dell'applicazione che conosce le classi concrete dei service
export const authService: IAuthService = new AuthService(
  env.jwt.chiavePrivata,
  env.jwt.chiavePubblica,
  env.jwt.scadenza,
);

export const authController = new AuthController(authService);

// middleware di autenticazione già collegato al service, pronto per le rotte
export const autenticazione = authMiddleware(authService);
