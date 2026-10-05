import { NextFunction, Request, Response } from 'express';
import { authMiddleware } from '../../src/middlewares/authMiddleware';
import { IAuthService } from '../../src/interfaces/IAuthService';
import { UnauthorizedError } from '../../src/errors/AppError';

// il middleware riceve un servizio di autenticazione finto: nessun database né chiave reale
describe('authMiddleware', () => {
  const authServiceFinto: jest.Mocked<IAuthService> = {
    login: jest.fn(),
    verificaToken: jest.fn(),
    hashPassword: jest.fn(),
  };

  const res = {} as Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it('restituisce 401 se manca il token', () => {
    const req = { headers: {} } as unknown as Request;

    authMiddleware(authServiceFinto)(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(authServiceFinto.verificaToken).not.toHaveBeenCalled();
  });

  it('salva i dati utente e prosegue se il token è valido', () => {
    const req = { headers: { authorization: 'Bearer token-valido' } } as unknown as Request;
    authServiceFinto.verificaToken.mockReturnValue({ id: 1, ruolo: 'operatore' });

    authMiddleware(authServiceFinto)(req, res, next as NextFunction);

    expect(authServiceFinto.verificaToken).toHaveBeenCalledWith('token-valido');
    expect(req.utente).toEqual({ id: 1, ruolo: 'operatore' });
    expect(next).toHaveBeenCalledWith();
  });

  it('restituisce 401 se il token non è valido o è scaduto', () => {
    const req = { headers: { authorization: 'Bearer token-scaduto' } } as unknown as Request;
    authServiceFinto.verificaToken.mockImplementation(() => {
      throw new UnauthorizedError('Token non valido o scaduto');
    });

    authMiddleware(authServiceFinto)(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(req.utente).toBeUndefined();
  });
});
