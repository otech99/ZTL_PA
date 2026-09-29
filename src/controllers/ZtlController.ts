import { Request, Response } from 'express';
import { DatiZtl, ZtlService } from '../services/ZtlService';

export class ZtlController {
  constructor(private readonly ztlService: ZtlService) {}

  elenco = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.ztlService.elenco());
  };

  dettaglio = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.ztlService.dettaglio(Number(req.params.id)));
  };

  crea = async (req: Request, res: Response): Promise<void> => {
    const { nome, citta } = req.body as DatiZtl;
    res.status(201).json(await this.ztlService.crea({ nome, citta }));
  };

  modifica = async (req: Request, res: Response): Promise<void> => {
    const { nome, citta } = req.body as DatiZtl;
    res.status(200).json(await this.ztlService.modifica(Number(req.params.id), { nome, citta }));
  };

  elimina = async (req: Request, res: Response): Promise<void> => {
    await this.ztlService.elimina(Number(req.params.id));
    res.status(204).send();
  };
}
