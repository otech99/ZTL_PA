import { RequestHandler } from 'express';
import { Ruolo } from '../interfaces/IAuthService';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

// lascia passare solo i ruoli indicati per la rotta
export function roleMiddleware(...ruoliAmmessi: Ruolo[]): RequestHandler {
  return (req, res, next) => {
    if (!req.utente) {
      return next(new UnauthorizedError('Utente non autenticato'));
    }

    if (!ruoliAmmessi.includes(req.utente.ruolo)) {
      return next(new ForbiddenError());
    }

    next();
  };
}
