import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../errors/AppError';

// raccoglie gli errori dei validatori e interrompe la catena con un 400
export const validationMiddleware: RequestHandler = (req, res, next) => {
  const errori = validationResult(req);

  if (!errori.isEmpty()) {
    // per gli errori su un campo si indica anche quale (es. fasce[1].oraFine)
    const messaggi = errori
      .array()
      .map((errore) => (errore.type === 'field' ? `${errore.path}: ${String(errore.msg)}` : String(errore.msg)));
    return next(new BadRequestError(messaggi.join(', ')));
  }

  next();
};
