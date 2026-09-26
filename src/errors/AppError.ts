// errore applicativo con codice HTTP, gestito dall'errorMiddleware
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorizzato') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Operazione non consentita per questo ruolo') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404);
  }
}
