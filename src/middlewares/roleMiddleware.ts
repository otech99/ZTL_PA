import { RequestHandler } from 'express';
import { Ruolo } from '../interfaces/IAuthService';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

// lascia passare solo gli utenti con uno dei ruoli indicati per la rotta (altrimenti 403)
export function roleMiddleware(...ruoliAmmessi: Ruolo[]): RequestHandler {
  return (req, res, next) => {
    // scatta solo se il middleware viene montato senza authMiddleware prima
    if (!req.utente) {
      return next(new UnauthorizedError('Utente non autenticato'));
    }

    if (!ruoliAmmessi.includes(req.utente.ruolo)) {
      return next(new ForbiddenError());
    }

    next();
  };
}
