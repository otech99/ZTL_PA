import { RequestHandler } from 'express';
import { ICreditoService } from '../interfaces/ICreditoService';
import { UnauthorizedError } from '../errors/AppError';

// verifica il credito prima dell'operazione e lo addebita solo se la risposta è di successo
export function creditoMiddleware(creditoService: ICreditoService) {
  return (costo: number): RequestHandler =>
    async (req, res, next) => {
      if (!req.utente) {
        return next(new UnauthorizedError('Utente non autenticato'));
      }

      const utenteId = req.utente.id;

      await creditoService.verificaCredito(utenteId, costo);

      // 'finish' scatta quando la risposta è stata inviata al client
      res.on('finish', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return;
        }

        creditoService
          .addebita(utenteId, costo)
          .then((addebitato) => {
            if (!addebitato) {
              console.warn(`Addebito non riuscito per l'utente ${utenteId}: credito insufficiente`);
            }
          })
          .catch((err) => console.error(`Errore durante l'addebito per l'utente ${utenteId}:`, err));
      });

      next();
    };
}
