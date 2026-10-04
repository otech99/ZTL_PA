import { StatusCodes } from 'http-status-codes';
import { RequestHandler } from 'express';
import { ICreditoService } from '../interfaces/ICreditoService';
import { UnauthorizedError } from '../errors/AppError';

// crea il middleware del credito collegato al service; si usa nelle rotte come credito(costo).
// Verifica il credito prima dell'operazione e lo addebita solo se la risposta è di successo
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
        if (res.statusCode < StatusCodes.OK || res.statusCode >= StatusCodes.MULTIPLE_CHOICES) {
          return;
        }

        // addebito a risposta già inviata: Express non intercetta questi errori, quindi serve il catch
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
