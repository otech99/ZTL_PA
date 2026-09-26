import { JwtPayload } from '../interfaces/IAuthService';

declare global {
  namespace Express {
    interface Request {
      utente?: JwtPayload;
    }
  }
}

export {};
