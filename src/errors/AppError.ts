import { StatusCodes } from 'http-status-codes';

// errore applicativo con il codice HTTP da restituire, gestito dall'errorMiddleware
export class AppError extends Error {
  public readonly statusCode: StatusCodes;

  // crea l'errore con il messaggio per il client e il relativo codice HTTP
  constructor(message: string, statusCode: StatusCodes) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

// 400: la richiesta contiene dati non validi
export class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

// 401: utente non autenticato, token non valido o credito insufficiente
export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorizzato') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

// 403: utente autenticato ma con un ruolo non ammesso per l'operazione
export class ForbiddenError extends AppError {
  constructor(message = 'Operazione non consentita per questo ruolo') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

// 404: la risorsa richiesta non esiste
export class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata') {
    super(message, StatusCodes.NOT_FOUND);
  }
}

// 409: l'operazione è in conflitto con i dati esistenti (duplicati, risorse collegate)
export class ConflictError extends AppError {
  constructor(message = 'Conflitto con lo stato attuale della risorsa') {
    super(message, StatusCodes.CONFLICT);
  }
}
