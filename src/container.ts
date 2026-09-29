import { env } from './config/env';
import { IAuthService } from './interfaces/IAuthService';
import { ICreditoService } from './interfaces/ICreditoService';
import { AuthService } from './services/AuthService';
import { CreditoService } from './services/CreditoService';
import { ZtlService } from './services/ZtlService';
import { VarcoService } from './services/VarcoService';
import { AuthController } from './controllers/AuthController';
import { ZtlController } from './controllers/ZtlController';
import { VarcoController } from './controllers/VarcoController';
import { authMiddleware } from './middlewares/authMiddleware';
import { creditoMiddleware } from './middlewares/creditoMiddleware';

// unico punto dell'applicazione che conosce le classi concrete dei service

// autenticazione
export const authService: IAuthService = new AuthService(
  env.jwt.chiavePrivata,
  env.jwt.chiavePubblica,
  env.jwt.scadenza,
);
export const authController = new AuthController(authService);
export const autenticazione = authMiddleware(authService);

// credito: middleware già collegato al service, si usa come credito(COSTI.xxx)
export const creditoService: ICreditoService = new CreditoService();
export const credito = creditoMiddleware(creditoService);

// ZTL e varchi
export const ztlController = new ZtlController(new ZtlService());
export const varcoController = new VarcoController(new VarcoService());
