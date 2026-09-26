import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';

// ultimo anello della catena: trasforma le eccezioni in risposte HTTP
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ errore: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ errore: 'Errore interno del server' });
};
