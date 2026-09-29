import { Request, Response } from 'express';
import { DatiFascia, DatiVarco, VarcoService } from '../services/VarcoService';

export class VarcoController {
  constructor(private readonly varcoService: VarcoService) {}

  elenco = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.varcoService.elenco());
  };

  dettaglio = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.varcoService.dettaglio(Number(req.params.id)));
  };

  crea = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.varcoService.crea(this.datiDaRichiesta(req)));
  };

  modifica = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.varcoService.modifica(Number(req.params.id), this.datiDaRichiesta(req)));
  };

  elimina = async (req: Request, res: Response): Promise<void> => {
    await this.varcoService.elimina(Number(req.params.id));
    res.status(204).send();
  };

  // prende dal body solo i campi previsti, con i numeri convertiti
  private datiDaRichiesta(req: Request): DatiVarco {
    const { posizione, ztlId, fasce } = req.body as DatiVarco;
    return {
      posizione,
      ztlId: Number(ztlId),
      fasce: fasce.map((fascia: DatiFascia) => ({
        giornoSettimana: Number(fascia.giornoSettimana),
        oraInizio: fascia.oraInizio,
        oraFine: fascia.oraFine,
        maggiorazione: fascia.maggiorazione === undefined ? undefined : Number(fascia.maggiorazione),
      })),
    };
  }
}
