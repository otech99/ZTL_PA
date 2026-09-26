import { RequestHandler } from 'express';
import { IAuthService } from '../interfaces/IAuthService';
import { UnauthorizedError } from '../errors/AppError';

// verifica il JWT e salva i dati dell'utente nella richiesta
export function authMiddleware(authService: IAuthService): RequestHandler {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Token mancante'));
    }

    const token = header.slice('Bearer '.length);

    try {
      req.utente = authService.verificaToken(token);
      next();
    } catch (err) {
      next(err);
    }
  };
}
