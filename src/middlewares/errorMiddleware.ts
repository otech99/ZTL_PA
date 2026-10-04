import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

// ultimo anello della catena: trasforma qualunque eccezione in una risposta JSON.
// Gli errori applicativi usano il proprio codice, quelli imprevisti diventano un 500
// senza esporre dettagli interni al client
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ errore: err.message });
    return;
  }

  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errore: 'Errore interno del server' });
};
