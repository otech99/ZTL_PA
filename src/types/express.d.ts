import { JwtPayload } from '../interfaces/IAuthService';

// aggiunge alla richiesta di Express i dati dell'utente autenticato, impostati dall'authMiddleware
declare global {
  namespace Express {
    interface Request {
      utente?: JwtPayload;
    }
  }
}

export {};
