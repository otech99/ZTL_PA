import { EventEmitter } from 'events';
import { NextFunction, Request, Response } from 'express';
import { creditoMiddleware } from '../../src/middlewares/creditoMiddleware';
import { ICreditoService } from '../../src/interfaces/ICreditoService';
import { UnauthorizedError } from '../../src/errors/AppError';

const COSTO = 0.5;

// risposta finta con il codice indicato, in grado di emettere 'finish' come una risposta vera
function rispostaFinta(statusCode: number): Response {
  const res = new EventEmitter() as EventEmitter & { statusCode: number };
  res.statusCode = statusCode;
  return res as unknown as Response;
}

// richiesta di un utente già autenticato dall'authMiddleware
function richiestaAutenticata(): Request {
  return { utente: { id: 1, ruolo: 'operatore' } } as unknown as Request;
}

// il middleware riceve un servizio del credito finto: nessun database
describe('creditoMiddleware', () => {
  const creditoServiceFinto: jest.Mocked<ICreditoService> = {
    verificaCredito: jest.fn(),
    addebita: jest.fn(),
    ricarica: jest.fn(),
  };

  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it('restituisce 401 se il credito non copre il costo, senza proseguire né addebitare', async () => {
    creditoServiceFinto.verificaCredito.mockRejectedValue(new UnauthorizedError('Credito insufficiente'));

    // Express 5 inoltra all'errorMiddleware l'eccezione della funzione asincrona
    await expect(
      creditoMiddleware(creditoServiceFinto)(COSTO)(richiestaAutenticata(), rispostaFinta(200), next as NextFunction),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(next).not.toHaveBeenCalled();
    expect(creditoServiceFinto.addebita).not.toHaveBeenCalled();
  });

  it('prosegue e addebita il costo solo quando la risposta di successo è stata inviata', async () => {
    creditoServiceFinto.verificaCredito.mockResolvedValue(undefined);
    creditoServiceFinto.addebita.mockResolvedValue(true);
    const res = rispostaFinta(200);

    await creditoMiddleware(creditoServiceFinto)(COSTO)(richiestaAutenticata(), res, next as NextFunction);

    expect(creditoServiceFinto.verificaCredito).toHaveBeenCalledWith(1, COSTO);
    expect(next).toHaveBeenCalledWith();
    // prima dell'invio della risposta non si addebita nulla
    expect(creditoServiceFinto.addebita).not.toHaveBeenCalled();

    res.emit('finish');

    expect(creditoServiceFinto.addebita).toHaveBeenCalledWith(1, COSTO);
  });

  it('non addebita nulla se la risposta è un errore', async () => {
    creditoServiceFinto.verificaCredito.mockResolvedValue(undefined);
    const res = rispostaFinta(404);

    await creditoMiddleware(creditoServiceFinto)(COSTO)(richiestaAutenticata(), res, next as NextFunction);
    res.emit('finish');

    expect(next).toHaveBeenCalledWith();
    expect(creditoServiceFinto.addebita).not.toHaveBeenCalled();
  });

  it('restituisce 401 se manca l\'utente autenticato, senza interrogare il credito', async () => {
    const req = {} as Request;

    await creditoMiddleware(creditoServiceFinto)(COSTO)(req, rispostaFinta(200), next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(creditoServiceFinto.verificaCredito).not.toHaveBeenCalled();
  });
});
