import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../errors/AppError';

// raccoglie gli errori dei validatori e interrompe la catena con un 400
export const validationMiddleware: RequestHandler = (req, res, next) => {
  const errori = validationResult(req);

  if (!errori.isEmpty()) {
    const messaggi = errori.array().map((errore) => String(errore.msg));
    return next(new BadRequestError(messaggi.join(', ')));
  }

  next();
};
